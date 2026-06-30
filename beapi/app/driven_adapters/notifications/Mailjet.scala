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

package driven_adapters.notifications

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.Phonenumber
import domain.driven_ports.notifications.Email
import domain.driven_ports.notifications.Sms
import domain.value_objects.EmailAddress
import jakarta.inject.Inject
import play.api.Configuration
import play.api.Logging
import play.api.libs.json.JsArray
import play.api.libs.json.JsObject
import play.api.libs.json.Json
import play.api.libs.ws.WSAuthScheme
import play.api.libs.ws.WSBodyWritables.writeableOf_JsValue
import play.api.libs.ws.WSClient
import play.api.libs.ws.WSRequest
import play.api.libs.ws.WSResponse

import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class Mailjet @Inject() (implicit
    ec: ExecutionContext,
    config: Configuration,
    val ws: WSClient
) extends Email
    with Sms
    with Logging {

  // https://dev.mailjet.com/email/guides/#authentication
  val username = config.get[String]("mailjet.apiKey")
  val password = config.get[String]("mailjet.secretKey")
  val sender = config.get[String](
    "mailjet.sender"
  ) // needs to be on the allowlist at https://app.mailjet.com/account/sender
  // https://dev.mailjet.com/sms/guides/send-sms-api/#authentication
  val smsToken = config.get[String]("mailjet.smsToken")

  // https://dev.mailjet.com/email/guides/send-api-v31/#send-a-basic-email
  val emailUrl = "https://api.mailjet.com/v3.1/send"
  // https://dev.mailjet.com/sms/guides/send-sms-api/#send-transactional-sms
  val smsUrl = "https://api.mailjet.com/v4/sms-send"

  override def send(
      to: EmailAddress,
      subject: String,
      plainText: String
  ): Future[Unit] = {

    logger.debug(s"trying to send $subject to $to via Mailjet")

    val data = Json.obj(
      "Messages" -> Json.arr(
        Json.obj(
          "From" -> Json.obj(
            "Email" -> sender,
            "Name" -> "Twotle"
          ),
          "To" -> Json.arr(
            Json.obj(
              "Email" -> to.wert
            )
          ),
          "Subject" -> subject,
          "TextPart" -> plainText
        )
      )
    )

    val responseFuture: Future[WSResponse] = ws
      .url(emailUrl)
      .withAuth(username, password, WSAuthScheme.BASIC)
      .addHttpHeaders(
        "Content-Type" -> "application/json"
      )
      .post(data)

    responseFuture.transform(
      response => {
        logger.debug(response.json("Status").toString)
      },
      exception => {
        logger.error("e-mailing failed", exception)
        exception
      }
    )
  }

  override def send(to: Phonenumber.PhoneNumber, text: String): Future[Unit] = {

    logger.debug(s"trying to send to $to via Mailjet")

    val data = Json.obj(
      "From" -> "Twotle",
      "To" -> PhoneNumberUtil
        .getInstance()
        .format(to, PhoneNumberUtil.PhoneNumberFormat.E164),
      "Text" -> text
    )

    val responseFuture: Future[WSResponse] =
      ws.url(smsUrl)
        .addHttpHeaders(
          "Authorization" -> s"Bearer $smsToken",
          "Content-Type" -> "application/json"
        )
        .post(data)

    responseFuture.transform(
      response => {
        logger.debug(response.json("Status").toString)
      },
      exception => {
        logger.error("texting failed", exception)
        exception
      }
    )
  }
}
