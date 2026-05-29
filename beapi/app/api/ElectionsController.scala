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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO election SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package api

import api.TransferObjects.*
import domain.driving_ports.Elections
import domain.driving_ports.Factory
import domain.value_objects.AccessToken
import domain.value_objects.Error
import domain.value_objects.Error.*
import domain.value_objects.Id
import domain.value_objects.Visibility
import domain.value_objects.Visibility.*
import jakarta.inject.Inject
import play.api.Environment
import play.api.i18n.I18nSupport
import play.api.libs.json.JsError
import play.api.libs.json.JsObject
import play.api.libs.json.Json
import play.api.libs.json.Reads
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request

import java.time.Instant
import java.time.ZoneId
import java.util.TimeZone
import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success
import scala.util.Try

class ElectionsController @Inject() (implicit
    ec: ExecutionContext,
    val controllerComponents: ControllerComponents,
    val factory: Factory,
    val elections: Elections
) extends BaseController
    with I18nSupport {

  val xAccessToken = "X-Access-Token"

  def postElection() = Action.async {

    factory
      .publishElection()
      .map(res =>
        Created(
          Json.obj(
            "id" -> res._1.wert,
            "organizerToken" -> res._2.wert.toString
          )
        )
      )
  }

  private def toErrorResponse(error: Error): Status = error match {
    case domain.value_objects.Error.NotFound => NotFound
    case AccessDenied                        => Forbidden
    case PrivateAccess                       => Gone
    case ProtectedAccess                     => Conflict
    case CommandIncomplete                   => BadRequest
  }

  def getElection(id: Id, timeZone: Option[String]) =
    Action.async { request =>
      Try(UUID.fromString(request.headers(xAccessToken))) match {
        case Success(accessToken) =>
          Try(timeZone.map(ZoneId.of(_))) match { // TimeZone.getTimeZone(_) would resort to GMT in case of an unknown time zone
            case Success(timeZone) =>
              elections
                .readElection(
                  id,
                  AccessToken(accessToken),
                  timeZone
                )
                .map(
                  _.fold(
                    toErrorResponse(_),
                    election =>
                      Ok(
                        Json.toJson(
                          ElectionTransferObject(
                            election.id,
                            election.created,
                            election.updated,
                            election.organizerToken,
                            election.voterToken,
                            election.visibility,
                            election.name,
                            election.description,
                            election.timeZone,
                            election.candidates,
                            election.votes,
                            Subscriptions(
                              election.subscriptions._2,
                              election.subscriptions._3,
                              election.subscriptions._4
                            )
                          )
                        )
                      )
                  )
                )
            case Failure(exception) =>
              Future(BadRequest(exception.getMessage))
          }
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
    }

  private def validateJson[A: Reads] = parse.json.validate(
    _.validate[A].asEither.left.map(e => BadRequest(JsError.toJson(e)))
  )

  def putVisibility(election: Id) = Action.async(validateJson[P]) { request =>
    Try(UUID.fromString(request.headers(xAccessToken))) match {
      case Success(accessToken) =>
        (request.body.visibility match {
          case Public =>
            elections
              .republishElection(
                election,
                AccessToken(accessToken)
              )
          case Protected =>
            elections
              .protectElection(
                election,
                AccessToken(accessToken)
              )
          case Private =>
            elections
              .privatizeElection(
                election,
                AccessToken(accessToken)
              )
        })
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def putText(election: Id) = Action.async(validateJson[Text]) { request =>
    Try(UUID.fromString(request.headers(xAccessToken))) match {
      case Success(accessToken) =>
        elections
          .retextElection(
            election,
            AccessToken(accessToken),
            request.body.name,
            request.body.description
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def putNominees(election: Id) = Action.async(validateJson[Nominations]) { request =>
    Try(UUID.fromString(request.headers(xAccessToken))) match {
      case Success(accessToken) =>
        elections
          .nominateCandidates(
            election,
            AccessToken(accessToken),
            request.body.timeZone,
            request.body.candidates
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def deleteElection(election: Id) = Action.async { request =>
    Try(UUID.fromString(request.headers(xAccessToken))) match {
      case Success(accessToken) =>
        elections
          .deleteElection(
            election,
            AccessToken(accessToken)
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def postVote(election: Id) =
    Action.async { validateJson[VoteTransferObject] } { request =>
      Try(UUID.fromString(request.headers(xAccessToken))) match {
        case Success(accessToken) =>
          elections
            .vote(
              election,
              AccessToken(accessToken),
              request.host,
              request.lang.locale,
              request.body.name,
              request.body.timeZone,
              request.body.availability,
              messagesApi("votes.voted.subject")(request.lang),
              messagesApi("votes.voted.plainText")(request.lang),
              messagesApi("votes.voted.text")(request.lang)
            )
            .map(
              _.fold(
                toErrorResponse(_),
                _ => NoContent
              )
            )
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
    }

  def deleteVote(election: Id, name: String, voted: String) = Action.async { request =>
    Try(UUID.fromString(request.headers(xAccessToken))) match {
      case Success(accessToken) =>
        elections
          .deleteVote(
            election,
            AccessToken(accessToken),
            request.host,
            name,
            Instant.parse(voted),
            messagesApi("votes.revoked.subject")(request.lang),
            messagesApi("votes.revoked.plainText")(request.lang),
            messagesApi("votes.revoked.text")(request.lang)
          )
          .map(
            _.fold(
              toErrorResponse(_),
              _ => NoContent
            )
          )
      case Failure(exception) => Future(Forbidden(exception.getMessage))
    }
  }

  def postReminder(election: Id) =
    Action.async(validateJson[Subscriptions]) { request =>
      Try(UUID.fromString(request.headers(xAccessToken))) match {
        case Success(accessToken) =>
          elections
            .sendLinksReminder(
              election,
              AccessToken(accessToken),
              request.host,
              request.body.emailAddress,
              messagesApi("links.byEmail.subject")(request.lang),
              messagesApi("links.byEmail.plainText")(request.lang),
              request.body.phoneNumber,
              messagesApi("links.bySms.text")(request.lang)
            )
            .map(
              _.fold(
                toErrorResponse(_),
                _ => NoContent
              )
            )
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
    }

  def patchSubscriptions(election: Id) =
    Action.async(validateJson[Subscriptions]) { request =>
      Try(UUID.fromString(request.headers(xAccessToken))) match {
        case Success(accessToken) =>
          elections
            .subscribe(
              election,
              AccessToken(accessToken),
              request.lang.locale,
              request.body.emailAddress,
              request.body.phoneNumber,
              request.body.url
            )
            .map(
              _.fold(
                toErrorResponse(_),
                _ => NoContent
              )
            )
        case Failure(exception) => Future(Forbidden(exception.getMessage))
      }
    }
}
