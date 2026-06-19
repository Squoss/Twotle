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

package controllers.api

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import domain.value_objects.AccessToken
import domain.value_objects.Availability
import domain.value_objects.Availability.*
import domain.value_objects.EmailAddress
import domain.value_objects.Id
import domain.value_objects.Visibility
import domain.value_objects.Visibility.*
import domain.value_objects.Vote
import play.api.libs.json.*

import java.net.URI
import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.util.TimeZone
import java.util.UUID
import scala.collection.mutable
import scala.util.Failure
import scala.util.Success
import scala.util.Try

case class ElectionTransferObject(
    id: Id,
    created: Instant,
    updated: Instant,
    organizerToken: AccessToken,
    voterToken: AccessToken,
    visibility: Visibility,
    name: String,
    description: Option[String],
    timeZone: Option[TimeZone],
    candidates: Set[LocalDateTime],
    votes: Seq[Vote],
    subscriptions: Subscriptions
)

case class P(visibility: Visibility)

case class Text(name: String, description: Option[String])

case class Nominations(
    timeZone: Option[TimeZone],
    candidates: Set[LocalDateTime]
)

case class Subscriptions(
    emailAddress: Option[EmailAddress],
    phoneNumber: Option[PhoneNumber],
    url: Option[URL]
)

case class VoteTransferObject(
    name: String,
    timeZone: Option[TimeZone],
    availability: Map[LocalDateTime, Availability],
    voted: Option[Instant]
)

object TransferObjects {

  implicit val idReads: Reads[Id] = new Reads[Id] {
    def reads(json: JsValue): JsResult[Id] = Try(Id(json.as[Int])) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val idWrites: Writes[Id] = new Writes[Id] {
    def writes(id: Id): JsValue = JsNumber(id.wert)
  }
  implicit val idFormat: Format[Id] = Format(idReads, idWrites)

  implicit val atReads: Reads[AccessToken] = new Reads[AccessToken] {
    def reads(json: JsValue): JsResult[AccessToken] = Try(
      AccessToken(UUID.fromString(json.as[String]))
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val atWrites: Writes[AccessToken] = new Writes[AccessToken] {
    def writes(at: AccessToken): JsValue = JsString(at.wert.toString)
  }
  implicit val atFormat: Format[AccessToken] = Format(atReads, atWrites)

  implicit val veReads: Reads[Visibility] = new Reads[Visibility] {
    def reads(json: JsValue): JsResult[Visibility] = Try(
      Visibility.valueOf(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val veWrites: Writes[Visibility] = new Writes[Visibility] {
    def writes(ve: Visibility): JsValue = JsString(
      ve.toString
    )
  }
  implicit val veFormat: Format[Visibility] =
    Format(veReads, veWrites)

  implicit val tzReads: Reads[TimeZone] = new Reads[TimeZone] {
    def reads(json: JsValue): JsResult[TimeZone] = Try(
      TimeZone.getTimeZone(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val tzWrites: Writes[TimeZone] = new Writes[TimeZone] {
    def writes(tz: TimeZone): JsValue = JsString(tz.getID)
  }
  implicit val tzFormat: Format[TimeZone] = Format(tzReads, tzWrites)

  implicit val aeReads: Reads[Availability] = new Reads[Availability] {
    def reads(json: JsValue): JsResult[Availability] = Try(
      Availability.valueOf(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val aeWrites: Writes[Availability] = new Writes[Availability] {
    def writes(ae: Availability): JsValue = JsString(
      ae.toString
    )
  }
  implicit val aeFormat: Format[Availability] =
    Format(aeReads, aeWrites)

  implicit val amReads: Reads[Map[LocalDateTime, Availability]] = new Reads[Map[LocalDateTime, Availability]] {
    def reads(json: JsValue): JsResult[Map[LocalDateTime, Availability]] = {
      Try(json.as[JsObject]).map(obj => {
        val availabilities = mutable.Map[LocalDateTime, Availability]()
        obj.value.foreach(v =>
          availabilities += LocalDateTime.parse(
            v._1
          ) -> Availability.valueOf(v._2.as[String])
        )
        availabilities.toMap
      }) match {
        case Success(value)     => JsSuccess(value)
        case Failure(exception) => JsError(exception.getMessage)
      }
    }
  }
  implicit val amWrites: Writes[Map[LocalDateTime, Availability]] = new Writes[Map[LocalDateTime, Availability]] {
    def writes(am: Map[LocalDateTime, Availability]): JsValue = JsObject(
      am.map(a => a._1.toString -> JsString(a._2.toString)).toSeq
    )
  }
  implicit val amFormat: Format[Map[LocalDateTime, Availability]] =
    Format(amReads, amWrites)

  implicit val voteVOReads: Reads[Vote] = Json.reads[Vote]
  implicit val voteVOWrites: Writes[Vote] = Json.writes[Vote]
  implicit val voteVOFormat: Format[Vote] = Json.format[Vote]
  implicit val voteTOReads: Reads[VoteTransferObject] = Json.reads[VoteTransferObject]
  implicit val voteTOWrites: Writes[VoteTransferObject] = Json.writes[VoteTransferObject]
  implicit val voteTOFormat: Format[VoteTransferObject] = Json.format[VoteTransferObject]

  implicit val eaReads: Reads[EmailAddress] = new Reads[EmailAddress] {
    def reads(json: JsValue): JsResult[EmailAddress] = Try(
      EmailAddress(json.as[String])
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val eaWrites: Writes[EmailAddress] = new Writes[EmailAddress] {
    def writes(ea: EmailAddress): JsValue = JsString(ea.wert)
  }
  implicit val eaFormat: Format[EmailAddress] = Format(eaReads, eaWrites)

  implicit val pnReads: Reads[PhoneNumber] = new Reads[PhoneNumber] {
    def reads(json: JsValue): JsResult[PhoneNumber] = Try(
      PhoneNumberUtil.getInstance().parse(json.as[String], "CH")
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val pnWrites: Writes[PhoneNumber] = new Writes[PhoneNumber] {
    def writes(pn: PhoneNumber): JsValue = JsString(
      PhoneNumberUtil.getInstance().format(pn, PhoneNumberFormat.E164)
    )
  }
  implicit val pnFormat: Format[PhoneNumber] = Format(pnReads, pnWrites)

  implicit val urlReads: Reads[URL] = new Reads[URL] {
    def reads(json: JsValue): JsResult[URL] = Try(
      URI.create(json.as[String]).toURL
    ) match {
      case Success(value)     => JsSuccess(value)
      case Failure(exception) => JsError(exception.getMessage)
    }
  }
  implicit val urlWrites: Writes[URL] = new Writes[URL] {
    def writes(url: URL): JsValue = JsString(url.toString)
  }
  implicit val urlFormat: Format[URL] = Format(urlReads, urlWrites)

  implicit val subscriptionsReads: Reads[Subscriptions] = Json.reads[Subscriptions]
  implicit val subscriptionsWrites: Writes[Subscriptions] = Json.writes[Subscriptions]
  implicit val subscriptionsFormat: Format[Subscriptions] = Json.format[Subscriptions]

  implicit val pReads: Reads[P] = Json.reads[P]
  implicit val textReads: Reads[Text] = Json.reads[Text]
  implicit val nominationsReads: Reads[Nominations] = Json.reads[Nominations]

  implicit val electionReads: Reads[ElectionTransferObject] = Json.reads[ElectionTransferObject]
  implicit val electionWrites: Writes[ElectionTransferObject] = Json.writes[ElectionTransferObject]
  implicit val electionFormat: Format[ElectionTransferObject] = Json.format[ElectionTransferObject]
}
