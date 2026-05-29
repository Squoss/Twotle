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
import munit.FunSuite

class DependencyRulesTestSuite extends FunSuite {

  // val DEFAULT = ""
  val DRIVEN_PORTS = "domain.driven_ports.."
  val DRIVING_PORTS = "domain.driving_ports.."
  val ENTITIES = "domain.entities.."
  val NOTIFICATIONS = "domain.driven_ports.notifications.."
  val PERSISTENCE = "domain.driven_ports.persistence.."
  val SERVICES = "domain.services.."
  val VALUE_OBJECTS = "domain.value_objects.."
  val JAVA = "java.."
  val JAVAX = "jakarta.."
  val PHONENUMBERS = "com.google.i18n.phonenumbers.."
  val SCALA = "scala.."

  val NOT_THE_APP =
    Seq(JAVA, JAVAX, SCALA, PHONENUMBERS)
  val THE_APP_INSIDE_THE_DOMAIN =
    Seq(
      ENTITIES,
      DRIVEN_PORTS,
      DRIVING_PORTS,
      SERVICES,
      VALUE_OBJECTS
    )

  val classes =
    new ClassFileImporter().importPackages(
      (THE_APP_INSIDE_THE_DOMAIN): _*
    )

  test("the domain depends on itself and third-party APIs only") {

    noClasses()
      .that()
      .resideInAnyPackage(THE_APP_INSIDE_THE_DOMAIN: _*)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP ++ THE_APP_INSIDE_THE_DOMAIN): _*
      )
      .check(classes)
  }

  test(
    "the repositories port depends on itself and the domain types only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(PERSISTENCE)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ PERSISTENCE :+ VALUE_OBJECTS): _*
      )
      .check(classes)
  }

  test(
    "besides the repositories port, only the domain services and domain entities depend on the repositories port"
  ) {

    noClasses()
      .that()
      .resideOutsideOfPackages(
        PERSISTENCE,
        SERVICES,
        ENTITIES
      )
      .should()
      .dependOnClassesThat()
      .resideInAPackage(PERSISTENCE)
      .check(classes)
  }

  test("the services port depends on itself and the domain types only") {

    noClasses()
      .that()
      .resideInAPackage(DRIVING_PORTS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ DRIVING_PORTS :+ VALUE_OBJECTS): _*
      )
      .check(classes)
  }

  test("only the domain services depend on the services port") {

    noClasses()
      .that()
      .resideOutsideOfPackages(SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(DRIVING_PORTS)
      .check(classes)
  }

  test("the notifications port depends on itself only") {

    noClasses()
      .that()
      .resideInAPackage(NOTIFICATIONS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages((NOT_THE_APP :+ NOTIFICATIONS): _*)
      .check(classes)
  }

  test("only the domain services depend on the notifications port") {

    noClasses()
      .that()
      .resideOutsideOfPackages(SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(NOTIFICATIONS)
      .check(classes)
  }

  test(
    "the domain services depend on themselves, the domain entities, the domain types, and the ports only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(SERVICES)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ ENTITIES :+ VALUE_OBJECTS :+ DRIVEN_PORTS :+ DRIVING_PORTS): _*
      )
      .check(classes)
  }

  test("nothing depends on the domain services") {

    noClasses()
      .that()
      .resideOutsideOfPackage(SERVICES)
      .should()
      .dependOnClassesThat()
      .resideInAPackage(SERVICES)
      .check(classes)
  }

  test(
    "the entities depend on the domain types and the domain (persistence) events only"
  ) {

    noClasses()
      .that()
      .resideInAPackage(ENTITIES)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ ENTITIES :+ VALUE_OBJECTS :+ PERSISTENCE): _*
      )
      .check(classes)
  }

  test("the value objects depend on themselves only") {

    noClasses()
      .that()
      .resideInAPackage(VALUE_OBJECTS)
      .should()
      .dependOnClassesThat()
      .resideOutsideOfPackages(
        (NOT_THE_APP :+ VALUE_OBJECTS): _*
      )
      .check(classes)
  }
}
