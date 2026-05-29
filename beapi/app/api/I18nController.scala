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

import jakarta.inject.Inject
import play.api.i18n.I18nSupport
import play.api.i18n.Lang
import play.api.libs.json.Json
import play.api.mvc.AnyContent
import play.api.mvc.BaseController
import play.api.mvc.ControllerComponents
import play.api.mvc.Request

import java.util.TimeZone

class I18nController @Inject() (
    val controllerComponents: ControllerComponents
) extends BaseController
    with I18nSupport {

  def l10nMessages = Action { implicit request: Request[AnyContent] =>
    val lang = request.lang
    val default = messagesApi.messages.get("default").getOrElse(Map())
    val language =
      messagesApi.messages.get(Lang(lang.language).code).getOrElse(Map())
    val country = messagesApi.messages
      .get(Lang(lang.language, lang.country).code)
      .getOrElse(Map())
    val script = messagesApi.messages
      .get(Lang(lang.language, lang.country, lang.script).code)
      .getOrElse(Map())
    val variant = messagesApi.messages
      .get(Lang(lang.language, lang.country, lang.script, lang.variant).code)
      .getOrElse(Map())
    Ok(Json.toJson(default ++ language ++ country ++ script ++ variant))
  }

  def timeZones = Action { implicit request: Request[AnyContent] =>
    val timeZones = TimeZone.getAvailableIDs
    Ok(Json.toJson(timeZones))
  }
}
