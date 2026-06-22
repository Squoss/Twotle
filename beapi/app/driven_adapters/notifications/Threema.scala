/*
 * The MIT License
 *
 * Copyright (c) 2024-2026 Squeng AG
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
import domain.driven_ports.notifications.Sms
import jakarta.inject.Inject
import play.api.Configuration
import play.api.Logging
import play.api.libs.ws.WSBodyWritables.writeableOf_String
import play.api.libs.ws.WSClient
import play.api.libs.ws.WSResponse

import java.net.URLEncoder
import java.nio.charset.Charset
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class Threema @Inject() (implicit
    ec: ExecutionContext,
    config: Configuration,
    val ws: WSClient
) extends Sms
    with Logging {

  val utf8 = Charset.forName("UTF-8")

  // https://gateway.threema.ch/de/id
  val id = config.get[String]("threema.id")
  val secret = config.get[String]("threema.secret")

  // https://gateway.threema.ch/de/developer/api
  val smsUrl = "https://msgapi.threema.ch/send_simple"

  override def send(to: Phonenumber.PhoneNumber, text: String): Future[Unit] = {

    logger.debug(s"trying to send to $to via Threema")

    val data =
      s"from=${URLEncoder.encode(id, utf8)}&phone=${PhoneNumberUtil.getInstance().format(to, PhoneNumberUtil.PhoneNumberFormat.E164).substring(1)}&text=${URLEncoder
          .encode(text, utf8)}&secret=${URLEncoder.encode(secret, utf8)}"

    val responseFuture: Future[WSResponse] =
      ws.url(smsUrl)
        .addHttpHeaders(
          "Content-Type" -> "application/x-www-form-urlencoded; charset=utf-8"
        )
        .post(data)

    responseFuture.transform(
      response => {
        logger.debug(response.status.toString)
        logger.debug(response.body)
      },
      exception => {
        logger.error("texting failed", exception)
        exception
      }
    )
  }
}
