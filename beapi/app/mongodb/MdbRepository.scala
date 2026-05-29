/*
 * The MIT License
 *
 * Copyright (c) 2021-2026 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package mongodb

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import com.mongodb.DuplicateKeyException
import com.mongodb.client.model.Filters
import com.mongodb.client.model.IndexOptions
import com.mongodb.client.model.Indexes
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Updates
import domain.driven_ports.persistence.CandidatesNominatedEvent
import domain.driven_ports.persistence.ElectionEvent
import domain.driven_ports.persistence.PrivatizedEvent
import domain.driven_ports.persistence.ProtectedEvent
import domain.driven_ports.persistence.PublishedEvent
import domain.driven_ports.persistence.Repository
import domain.driven_ports.persistence.RepublishedEvent
import domain.driven_ports.persistence.RetextedEvent
import domain.driven_ports.persistence.SubscribedEvent
import domain.driven_ports.persistence.VoteDeletedEvent
import domain.driven_ports.persistence.VotedEvent
import domain.value_objects.AccessToken
import domain.value_objects.Availability
import domain.value_objects.Availability.*
import domain.value_objects.ElectionSnapshot
import domain.value_objects.EmailAddress
import domain.value_objects.Id
import domain.value_objects.Visibility
import domain.value_objects.Visibility.*
import domain.value_objects.Vote
import jakarta.inject.Inject
import org.bson.BsonArray
import org.bson.BsonBinary
import org.bson.BsonDateTime // not org.bson.BsonTimestamp, which is for internal MongoDB use (https://www.mongodb.com/docs/manual/reference/bson-types/#timestamps)
import org.bson.BsonDocument
import org.bson.BsonElement
import org.bson.BsonInt32
import org.bson.BsonString
import org.bson.BsonValue
import org.reactivestreams.Subscription
import play.api.Logging

import java.net.URI
import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.util.Locale
import java.util.TimeZone
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.concurrent.Promise
import scala.jdk.CollectionConverters.*
import scala.util.Failure
import scala.util.Success

class MdbRepository @Inject() (implicit ec: ExecutionContext, val mdb: Mdb) extends Repository with Logging {

  val Collection = "elections"
  val IdKey = "id"
  val SnapshotKey = "snapshot"
  val CreatedKey = "created"
  val VisibilityKey = "visibility"
  val CandidatesKey = "candidates"
  val VotesKey = "votes"
  val UpdatedKey = "updated"
  val ReplayedEventsKey = "replayedEvents"
  val EventsKey = "events"
  val OccurredKey = "occurred"
  val VersionKey = "version"
  val VoterTokenKey = "voterToken"
  val OrganizerTokenKey = "organizerToken"
  val NameKey = "name"
  val DescriptionKey = "description"
  val DateTimeKey = "dateTime"
  val TimeZoneKey = "timeZone"
  val UrlKey = "url"
  val SubscriptionsKey = "subscriptions"
  val LocaleKey = "locale"
  val EmailAddressKey = "ea"
  val PhoneNumberKey = "pn"
  val AvailabilityKey = "availability"
  val VotedKey = "voted"
  val TypeKey = "et"
  val PublishedValue = "published"
  val RetextedValue = "retexted"
  val CandidatesNominatedValue = "candidatesNominated"
  val SubscribedValue = "subscribed"
  val ProtectedValue = "protected"
  val PrivatizedValue = "privatized"
  val RepublishedValue = "republished"
  val VotedValue = "voted"
  val VoteDeletedValue = "voteDeleted"

  logger.info(s"ensuring indices for ${Collection}")
  mdb(Collection)
    .createIndex(
      Indexes.ascending(IdKey),
      new IndexOptions().unique(true)
    )
    .subscribe(
      new org.reactivestreams.Subscriber[String] {

        override def onSubscribe(s: Subscription): Unit =
          s.request(Long.MaxValue)

        override def onNext(s: String): Unit =
          logger.info(s"created indices ${s} for ${Collection}")

        override def onError(e: Throwable): Unit =
          logger.error(s"failed to create indices for ${Collection}", e)

        override def onComplete(): Unit =
          logger.info(s"created indices for ${Collection}")
      }
    )

  private def toFutureResult[R](publisher: org.reactivestreams.Publisher[R]) = {
    val promise = Promise[R]()

    publisher.subscribe(
      new org.reactivestreams.Subscriber[R] {

        override def onSubscribe(s: Subscription): Unit = s.request(1)

        override def onNext(result: R): Unit =
          promise.success(result)

        override def onError(e: Throwable): Unit =
          promise.failure(e)

        override def onComplete(): Unit =
          if (!promise.isCompleted) {
            promise.failure(
              new RuntimeException(
                "premature completion: onComplete before onNext and onError"
              )
            )
          }
      }
    )

    promise.future
  }

  private def toFutureDocSeq(
      publisher: org.reactivestreams.Publisher[BsonDocument]
  ) = {
    val promise = Promise[Seq[BsonDocument]]()

    publisher.subscribe(
      new org.reactivestreams.Subscriber[BsonDocument] {

        override def onSubscribe(s: Subscription): Unit =
          s.request(Long.MaxValue)

        val docs = scala.collection.mutable.ListBuffer[BsonDocument]()

        override def onNext(doc: BsonDocument): Unit = docs += doc

        override def onError(e: Throwable): Unit =
          promise.failure(e)

        override def onComplete(): Unit =
          promise.success(docs.toSeq)
      }
    )

    promise.future
  }

  override def logEvent(event: PublishedEvent): Future[Boolean] = {
    val document = new BsonDocument(
      Map(
        IdKey -> new BsonInt32(event.id.wert),
        ReplayedEventsKey -> new BsonInt32(0),
        EventsKey -> new BsonArray(
          Seq(
            new BsonDocument(
              Map(
                TypeKey -> new BsonString(PublishedValue),
                OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
                VersionKey -> new BsonInt32(event.version),
                OrganizerTokenKey -> new BsonBinary(event.organizerToken.wert),
                VoterTokenKey -> new BsonBinary(event.voterToken.wert)
              ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
            )
          ).asJava
        )
      ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
    )

    toFutureResult(
      mdb(Collection)
        .insertOne(document)
    ).transform(_ match {
      case Success(_)                                => Success(true)
      case Failure(exception: DuplicateKeyException) => Success(false)
      case Failure(throwable)                        => Failure(throwable)
    })
  }

  private def logEvent(id: Id, document: BsonDocument): Future[Unit] =
    toFutureResult(
      mdb(Collection)
        .updateOne(
          Filters.eq(IdKey, id.wert),
          Updates.push(EventsKey, document)
        )
    ).map(_ => ())

  private def logEvent(
      event: ElectionEvent,
      typeValue: String
  ): Future[Unit] = {
    require(
      typeValue == ProtectedValue || typeValue == PrivatizedValue || typeValue == RepublishedValue
    )

    val document = new BsonDocument(
      Map(
        TypeKey -> new BsonString(typeValue),
        OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
        VersionKey -> new BsonInt32(event.version)
      ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
    )
    logEvent(event.id, document)
  }

  override def logEvent(event: ElectionEvent): Future[Unit] = event match {
    case PublishedEvent(_, _, _, _) =>
      val msg =
        "PublishedEvent case should have been handled by logEvent(PublishedEvent)"
      logger.error(msg)
      Future.failed(new RuntimeException(msg))
    case RetextedEvent(_, name, description, _) =>
      val document = new BsonDocument(
        Map(
          TypeKey -> new BsonString(RetextedValue),
          OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
          VersionKey -> new BsonInt32(event.version),
          NameKey -> new BsonString(name)
        ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
      )
      description.foreach(d => document.append(DescriptionKey, new BsonString(d)))
      logEvent(event.id, document)
    case CandidatesNominatedEvent(_, timeZone, candidates, _) =>
      val document = new BsonDocument(
        Map(
          TypeKey -> new BsonString(CandidatesNominatedValue),
          OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
          VersionKey -> new BsonInt32(event.version),
          CandidatesKey -> fromCandidates(candidates)
        ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
      )
      timeZone.foreach(tz => document.append(TimeZoneKey, new BsonString(tz.getID)))
      logEvent(event.id, document)
    case SubscribedEvent(_, locale, email, text, webHook, _) =>
      val document = new BsonDocument(
        Map(
          TypeKey -> new BsonString(SubscribedValue),
          OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
          VersionKey -> new BsonInt32(event.version),
          LocaleKey -> new BsonString(locale.toLanguageTag)
        ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
      )
      email.foreach(ea => document.append(EmailAddressKey, new BsonString(ea.wert)))
      text.foreach(pn =>
        document.append(
          PhoneNumberKey,
          new BsonString(
            PhoneNumberUtil
              .getInstance()
              .format(pn, PhoneNumberFormat.E164)
          )
        )
      )
      webHook.foreach(u => document.append(UrlKey, new BsonString(u.toExternalForm)))
      logEvent(event.id, document)
    case ProtectedEvent(_, _) =>
      logEvent(event, ProtectedValue)
    case PrivatizedEvent(_, _) =>
      logEvent(event, PrivatizedValue)
    case RepublishedEvent(_, _) =>
      logEvent(event, RepublishedValue)
    case VotedEvent(_, name, timeZone, availability, _) =>
      val document = new BsonDocument(
        Map(
          TypeKey -> new BsonString(VotedValue),
          OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
          VersionKey -> new BsonInt32(event.version),
          NameKey -> new BsonString(name),
          AvailabilityKey -> fromAvailability(availability)
        ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
      )
      timeZone.foreach(tz => document.append(TimeZoneKey, new BsonString(tz.getID)))
      logEvent(event.id, document)
    case VoteDeletedEvent(_, name, voted, _) =>
      val document = new BsonDocument(
        Map(
          TypeKey -> new BsonString(VoteDeletedValue),
          OccurredKey -> new BsonDateTime(event.occurred.toEpochMilli),
          VersionKey -> new BsonInt32(event.version),
          NameKey -> new BsonString(name),
          VotedKey -> new BsonDateTime(voted.toEpochMilli)
        ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
      )
      logEvent(event.id, document)
  }

  // migrating from BSON Timestamp (which is for internal MongoDB use) to BSON DateTime
  private def getDateTimestampValue(doc: BsonDocument, key: String) =
    if (doc.isDateTime(key)) {
      doc.getDateTime(key).getValue
    } else if (doc.isTimestamp(key)) {
      doc.getTimestamp(key).getValue
    } else {
      throw new RuntimeException(s"expected $key to be a DateTime or a Timestamp")
    }

  private def toElectionEvent(id: Id, doc: BsonDocument) = {
    val eventType = doc.getString(TypeKey).getValue
    val version = doc.getInt32(VersionKey).getValue.toInt
    assume(version == 1)

    eventType match {
      case PublishedValue =>
        PublishedEvent(
          id,
          AccessToken(doc.getBinary(OrganizerTokenKey).asUuid),
          AccessToken(doc.getBinary(VoterTokenKey).asUuid),
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case RetextedValue =>
        RetextedEvent(
          id,
          doc.getString(NameKey).getValue,
          Option(doc.getString(DescriptionKey, null)).map(_.getValue),
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case CandidatesNominatedValue =>
        CandidatesNominatedEvent(
          id,
          Option(
            doc
              .getString(TimeZoneKey, null)
          )
            .map(tz => TimeZone.getTimeZone(tz.getValue)),
          doc
            .getArray(CandidatesKey)
            .getValues
            .asScala
            .toSet
            .map((bv: BsonValue) => LocalDateTime.parse(bv.asString.getValue)),
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case SubscribedValue =>
        val subscriptions = toSubscriptions(doc)
        SubscribedEvent(
          id,
          subscriptions._1,
          subscriptions._2,
          subscriptions._3,
          subscriptions._4,
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case ProtectedValue =>
        ProtectedEvent(
          id,
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case PrivatizedValue =>
        PrivatizedEvent(
          id,
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case RepublishedValue =>
        RepublishedEvent(
          id,
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case VotedValue =>
        VotedEvent(
          id,
          doc.getString(NameKey).getValue,
          Option(
            doc
              .getString(TimeZoneKey, null)
          )
            .map(tz => TimeZone.getTimeZone(tz.getValue)),
          toAvailability(
            doc.getDocument(AvailabilityKey).asScala.toMap
          ),
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
      case VoteDeletedValue =>
        VoteDeletedEvent(
          id,
          doc.getString(NameKey).getValue,
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, VotedKey)
          ),
          Instant.ofEpochMilli(
            getDateTimestampValue(doc, OccurredKey)
          )
        )
    }
  }

  private def toVote(document: BsonDocument) = Vote(
    document.getString(NameKey).getValue,
    toAvailability(
      document.getDocument(AvailabilityKey).asScala.toMap
    ),
    Instant
      .ofEpochMilli(getDateTimestampValue(document, VotedKey))
  )

  private def toSnapshot(id: Id, document: BsonDocument, replayedEvents: Int) =
    ElectionSnapshot(
      id,
      Instant
        .ofEpochMilli(
          getDateTimestampValue(document, CreatedKey)
        ),
      Instant
        .ofEpochMilli(
          getDateTimestampValue(document, UpdatedKey)
        ),
      AccessToken(document.getBinary(OrganizerTokenKey).asUuid),
      AccessToken(document.getBinary(VoterTokenKey).asUuid),
      document.getString(NameKey).getValue,
      Option(document.getString(DescriptionKey, null)).map(_.getValue),
      Option(
        document
          .getString(TimeZoneKey, null)
      )
        .map(tz => TimeZone.getTimeZone(tz.getValue)),
      document
        .getArray(CandidatesKey)
        .getValues
        .asScala
        .toSet
        .map((bv: BsonValue) => LocalDateTime.parse(bv.asString.getValue)),
      document
        .getArray(VotesKey)
        .getValues
        .asScala
        .toSeq
        .map(bv => toVote(bv.asDocument)),
      Visibility.fromOrdinal(document.getInt32(VisibilityKey).getValue),
      toSubscriptions(
        document.getDocument(SubscriptionsKey)
      ),
      replayedEvents
    )

  override def readEvents(
      id: Id
  ): Future[(Option[ElectionSnapshot], Seq[ElectionEvent])] = toFutureDocSeq(
    mdb(
      Collection
    ).find(Filters.eq(IdKey, id.wert))
      .projection(Projections.exclude(EventsKey))
  )
    .flatMap(_ match {
      case Nil           => Future((None, Seq()))
      case Seq(document) =>
        val replayedEvents = document.getInt32(ReplayedEventsKey).getValue.toInt
        toFutureDocSeq(
          mdb(Collection)
            .find(Filters.eq(IdKey, id.wert))
            .projection(
              Projections.slice(EventsKey, replayedEvents, Int.MaxValue)
            )
        )
          .map(docs =>
            (
              if (replayedEvents > 0) {
                Some(
                  toSnapshot(
                    id,
                    document.getDocument(SnapshotKey),
                    replayedEvents
                  )
                )
              } else { None },
              docs.head
                .getArray(EventsKey)
                .getValues
                .asScala
                .map(eventDoc =>
                  toElectionEvent(
                    Id(document.getInt32(IdKey).getValue.toInt),
                    eventDoc.asDocument
                  )
                )
                .toSeq
            )
          )
      case documents =>
        val msg =
          s"DB corrupt! found ${documents.size} documents with supposedly unique id ${id}"
        logger.error(msg)
        Future.failed(new RuntimeException(msg))
    })

  private def fromCandidates(candidates: Set[LocalDateTime]): BsonArray = {
    val bsonArray = new BsonArray()
    candidates.foreach(candidate => bsonArray.add(new BsonString(candidate.toString)))
    bsonArray
  }

  private def fromAvailability(
      availabilities: Map[LocalDateTime, Availability]
  ): BsonDocument = {
    val bsonDocument = new BsonDocument()
    availabilities.foreach(_ match {
      case (ldt, a) => bsonDocument.append(ldt.toString, new BsonInt32(a.ordinal))
    })
    bsonDocument
  }

  private def toAvailability(document: Map[String, BsonValue]) = {
    document.map(_ match {
      case (ldt, a) =>
        (
          LocalDateTime.parse(ldt),
          Availability.fromOrdinal(a.asInt32.getValue)
        )
    })
  }

  private def fromVotes(votes: Seq[Vote]): BsonArray = {
    val bsonArray = new BsonArray()
    votes.foreach(vote => {
      val document = new BsonDocument(
        Map(
          NameKey -> new BsonString(vote.name),
          AvailabilityKey -> fromAvailability(vote.availability),
          VotedKey -> new BsonDateTime(vote.voted.toEpochMilli)
        ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
      )
      bsonArray.add(document)
    })
    bsonArray
  }

  private def fromSubscriptions(
      subscriptions: (
          Locale,
          Option[EmailAddress],
          Option[PhoneNumber],
          Option[URL]
      )
  ): BsonDocument = {
    val bsonDocument = new BsonDocument()
    bsonDocument.append(
      LocaleKey,
      new BsonString(subscriptions._1.toLanguageTag)
    )
    subscriptions._2.foreach(ea => bsonDocument.append(EmailAddressKey, new BsonString(ea.wert)))
    subscriptions._3.foreach(pn =>
      bsonDocument.append(
        PhoneNumberKey,
        new BsonString(
          PhoneNumberUtil
            .getInstance()
            .format(pn, PhoneNumberFormat.E164)
        )
      )
    )
    subscriptions._4.foreach(u => bsonDocument.append(UrlKey, new BsonString(u.toExternalForm)))
    bsonDocument
  }

  private def toSubscriptions(document: BsonDocument) = {
    (
      Locale.forLanguageTag(document.getString(LocaleKey).getValue),
      Option(
        document
          .getString(EmailAddressKey, null)
      )
        .map(ea => EmailAddress(ea.getValue)),
      Option(
        document
          .getString(PhoneNumberKey, null)
      )
        .map(pn => PhoneNumberUtil.getInstance().parse(pn.getValue, "CH")),
      Option(document.getString(UrlKey, null)).map(u => URI.create(u.getValue).toURL)
    )
  }

  override def fastForwardSnapshot(
      snapshot: ElectionSnapshot
  ): Future[Unit] = {
    val document = new BsonDocument(
      Map(
        CreatedKey -> new BsonDateTime(snapshot.created.toEpochMilli),
        UpdatedKey -> new BsonDateTime(snapshot.updated.toEpochMilli),
        OrganizerTokenKey -> new BsonBinary(snapshot.organizerToken.wert),
        VoterTokenKey -> new BsonBinary(snapshot.voterToken.wert),
        VisibilityKey -> new BsonInt32(snapshot.visibility.ordinal),
        NameKey -> new BsonString(snapshot.name),
        CandidatesKey -> fromCandidates(snapshot.candidates),
        VotesKey -> fromVotes(snapshot.votes),
        SubscriptionsKey -> fromSubscriptions(snapshot.subscriptions)
      ).toList.map(entry => new BsonElement(entry._1, entry._2)).asJava
    )
    snapshot.description.foreach(d => document.append(DescriptionKey, new BsonString(d)))
    snapshot.timeZone.foreach(tz => document.append(TimeZoneKey, new BsonString(tz.getID)))
    toFutureResult(
      mdb(Collection)
        .updateOne(
          Filters.and(
            Filters.eq(IdKey, snapshot.id.wert),
            Filters.lt(ReplayedEventsKey, snapshot.replayedEvents)
          ),
          Updates.combine(
            Updates.set(ReplayedEventsKey, snapshot.replayedEvents),
            Updates.set(SnapshotKey, document)
          )
        )
    )
      .map(_ => ())
  }

  override def deleteEvents(id: Id): Future[Unit] = toFutureResult(
    mdb(
      Collection
    ).deleteOne(Filters.eq(IdKey, id.wert))
  )
    .map(_ => ())
}
