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

package api

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberType
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber.CountryCodeSource
import jakarta.inject.Inject
import jakarta.inject.Singleton
import org.apache.commons.validator.routines.EmailValidator
import org.apache.commons.validator.routines.UrlValidator
import play.api.libs.json.Json
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents

import scala.util.Failure
import scala.util.Success
import scala.util.Try

@Singleton
class ValidationsController @Inject() (
    val controllerComponents: ControllerComponents
) extends BaseController {

  val pnu =
    PhoneNumberUtil
      .getInstance(); // it's a singleton anyway, but nevertheless improves legibility

  def cellPhoneNumbers(cellPhoneNumber: String) = Action {
    Try(
      pnu.parse(cellPhoneNumber, "CH")
    ) match {
      case Success(phoneNumber) =>
        Ok(
          Json.obj(
            "value" -> cellPhoneNumber,
            "valid" -> pnu.isValidNumber(phoneNumber)
          )
        )
      case Failure(exception) =>
        Ok(
          Json.obj(
            "value" -> cellPhoneNumber,
            "valid" -> false
          )
        )
    }
  }

  def emailAddresses(emailAddress: String) = Action {
    Ok(
      Json.obj(
        "value" -> emailAddress,
        "valid" -> EmailValidator.getInstance().isValid(emailAddress)
      )
    )
  }

  val schemes = Array("http", "https")
  val urlValidator = new UrlValidator(schemes)

  def urls(url: String) = Action {
    Ok(
      Json.obj(
        "value" -> url,
        "valid" -> urlValidator.isValid(url)
      )
    )
  }
}
