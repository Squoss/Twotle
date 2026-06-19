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

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import org.scalatest.funsuite.AnyFunSuite

class DependencyRulesTestSuite extends AnyFunSuite {

  val PEKKO = "org.apache.pekko.."
  val API = "controllers.api.."
  // val DEFAULT = ""
  val DEV = "dev.."
  val DOMAIN_ENTITYINTS = "domain.entity_interfaces.."
  val DOMAIN_SERVICEINTS = "domain.driving_ports.."
  val DOMAIN_PERSISTENCE = "domain.driven_ports.persistence.."
  val DOMAIN_VALUEOBJECTS = "domain.value_objects.."
  val FILTERS = "filters.."
  val GUI = "controllers.gui.."
  val JAVA = "java.."
  val JAVAX = "jakarta.."
  val MAILJET = "com.mailjet.."
  val MONGODB_ADAPTER =
    "mongodb.." // the MongoDB driver starts its packages with com or org
  val MONGODB_DRIVER =
    Seq("com.mongodb..", "org.bson..", "org.mongodb..", "org.reactivestreams..")
  val PLAY_API = "play.api.." // "play.." would also include Play's Java API
  val PLAY_CORE = "play.core.."
  val PLAY_FILTERS = "play.filters.."
  val PHONENUMBERS = "com.google.i18n.phonenumbers.."
  val ROUTER = "router.."
  val SCALA = "scala.."
  val THIRDPARTY_APIS = "domain.driven_ports.notifications.."
  val THIRDPARTY_SERVICES = "thirdparty_services.."
  val VALIDATORS = "org.apache.commons.validator.."

  val NOT_THE_APP =
    Seq(
      JAVA,
      JAVAX,
      SCALA,
      PEKKO,
      PLAY_API,
      PLAY_CORE,
      PLAY_FILTERS,
      ROUTER,
      PHONENUMBERS,
      VALIDATORS
    )
  val THE_APP_OUTSIDE_OF_THE_DOMAIN =
    Seq( /*DEFAULT,*/ API, DEV, FILTERS, GUI, MONGODB_ADAPTER, THIRDPARTY_SERVICES)

  val classes =
    new ClassFileImporter().importPackages(THE_APP_OUTSIDE_OF_THE_DOMAIN: _*)

  test(
    "the controllers depend on themselves, the SPI, the (abstract) types, and the value objects only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(API)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ API :+ DOMAIN_SERVICEINTS :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS): _*
      )
      .check(classes)
  }

  test("nothing depends on the controllers") {

    noClasses()
      .that()
      .resideOutsideOfPackages(API, ROUTER)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(API)
      .check(classes)
  }

  // we don't care what DEV implementations depend on

  test("nothing depends on DEV implementations") {

    noClasses()
      .that()
      .resideOutsideOfPackage(DEV)
      .and()
      .doNotHaveSimpleName("Module")
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DEV)
      .check(classes)
  }

  test("the filters depend on themselves only") {

    noClasses()
      .that()
      .resideInAPackage(FILTERS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ "play.mvc.."): _*
      ) // "play.mvc.." covers play.mvc.EssentialFilter
      .check(classes)
  }

  test("nothing depends on the filters") {

    noClasses()
      .that()
      .resideOutsideOfPackage(FILTERS)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(FILTERS)
      .check(classes)
  }

  test(
    "the MongoDB adapter depends on itself and the repositories only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(MONGODB_ADAPTER)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP ++ MONGODB_DRIVER :+ MONGODB_ADAPTER :+ DOMAIN_ENTITYINTS :+ DOMAIN_VALUEOBJECTS :+ DOMAIN_PERSISTENCE): _*
      )
      .check(classes)
  }

  test("nothing depends on the MongoDB adapter") {

    noClasses()
      .that()
      .resideOutsideOfPackage(MONGODB_ADAPTER)
      .and()
      .doNotHaveSimpleName("Module")
      .should()
      .dependOnClassesThat()
      .resideInAPackage(MONGODB_ADAPTER)
      .check(classes)
  }

  test(
    "third-party services depend on themselves and the third-party APIs only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(THIRDPARTY_SERVICES)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DOMAIN_VALUEOBJECTS :+ MAILJET :+ THIRDPARTY_APIS :+ THIRDPARTY_SERVICES): _*
      )
      .check(classes)
  }

  test("nothing depends on third-party services") {

    noClasses()
      .that()
      .resideOutsideOfPackage(THIRDPARTY_SERVICES)
      .and()
      .doNotHaveSimpleName("Module")
      .should()
      .dependOnClassesThat()
      .resideInAPackage(THIRDPARTY_SERVICES)
      .check(classes)
  }
}
