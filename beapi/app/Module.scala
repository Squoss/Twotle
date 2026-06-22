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

import com.google.inject.AbstractModule
import domain.driven_ports.notifications.Email
import domain.driven_ports.notifications.Sms
import domain.driven_ports.persistence.Repository
import domain.driving_adapters.ElectionsService
import domain.driving_ports.Elections
import domain.driving_ports.Factory
import driven_adapters.persistence.Mdb
import play.api.Configuration
import play.api.Environment
import play.api.Logging

// the configurator in Ports & Adapters (https://alistaircockburn.company.site/Epub-Hexagonal-Architecture-Explained-Updated-1st-ed-p751233517) terminology
class Module(
    env: Environment,
    config: Configuration
) extends AbstractModule
    with Logging {
  override def configure() = {

    // https://www.playframework.com/documentation/3.0.x/ScalaDependencyInjection#Eager-bindings
    bind(classOf[Mdb]).asEagerSingleton
    // we may not need it when env.mode == play.api.Mode.Dev, but it won't cause any problem as long as nobody invokes Mdb.apply()

    val dbImplementationName = config.get[String]("di.db")
    val dbImplementationClass: Class[_ <: Repository] = env.classLoader
      .loadClass(dbImplementationName)
      .asSubclass(classOf[Repository])
    logger.debug(s"db implementation class is $dbImplementationClass")
    bind(classOf[Repository]).to(dbImplementationClass)

    val emailImplementationName = config.get[String]("di.email")
    val emailImplementationClass: Class[_ <: Email] = env.classLoader
      .loadClass(emailImplementationName)
      .asSubclass(classOf[Email])
    logger.debug(s"email implementation class is $emailImplementationClass")
    bind(classOf[Email]).to(emailImplementationClass)

    val smsImplementationName = config.get[String]("di.sms")
    val smsImplementationClass: Class[_ <: Sms] = env.classLoader
      .loadClass(smsImplementationName)
      .asSubclass(classOf[Sms])
    logger.debug(s"SMS implementation class is $smsImplementationClass")
    bind(classOf[Sms]).to(smsImplementationClass)

    bind(classOf[Factory]).to(classOf[ElectionsService])
    bind(classOf[Elections]).to(classOf[ElectionsService])
  }
}
