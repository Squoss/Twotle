/*
 * The MIT License
 *
 * Copyright (c) 2026 Squeng AG
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

package domain

import dev.{DevEmail, DevRepository, DevSms}
import domain.services.ElectionsService
import domain.value_objects.*
import domain.value_objects.Error.*
import munit.FunSuite

import java.time.LocalDateTime
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

class ElectionsServiceTest extends FunSuite {

  private given ExecutionContext = ExecutionContext.global

  private def newService(): ElectionsService = {
    given DevRepository = new DevRepository()
    given DevEmail = new DevEmail()
    given DevSms = new DevSms()
    new ElectionsService()
  }

  private def voterTokenOf(
      service: ElectionsService,
      id: Id,
      organizerToken: AccessToken
  ): Future[AccessToken] =
    service.readElection(id, organizerToken, None).map(_.toOption.get.voterToken)

  // ─── Group 1: publishElection ────────────────────────────────────────────

  test("publishElection returns a non-canary organizer token") {
    newService().publishElection().map { (_, organizerToken) =>
      assertNotEquals(organizerToken, AccessToken(new UUID(0, 0)))
    }
  }

  test("publishElection twice on the same service returns different Ids") {
    val service = newService()
    for {
      (id1, _) <- service.publishElection()
      (id2, _) <- service.publishElection()
    } yield assertNotEquals(id1, id2)
  }

  // ─── Group 2: readElection — access control ──────────────────────────────

  test("organizer token reads election with real organizer token") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      result <- service.readElection(id, organizerToken, None)
    } yield assertEquals(result.map(_.organizerToken), Right(organizerToken))
  }

  test("voter token reads election with canary replacing organizer token") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      result <- service.readElection(id, voterToken, None)
    } yield assertEquals(result.map(_.organizerToken), Right(AccessToken(new UUID(0, 0))))
  }

  test("wrong token returns AccessDenied") {
    val service = newService()
    for {
      (id, _) <- service.publishElection()
      result <- service.readElection(id, AccessToken(UUID.randomUUID()), None)
    } yield assertEquals(result, Left(AccessDenied))
  }

  test("unknown Id returns NotFound") {
    newService()
      .readElection(Id(0), AccessToken(UUID.randomUUID()), None)
      .map(result => assertEquals(result, Left(NotFound)))
  }

  // ─── Group 3: readElection — visibility rules ────────────────────────────

  test("voter can read a public election") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      result <- service.readElection(id, voterToken, None)
    } yield assert(result.isRight)
  }

  test("voter can still read a protected election") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      _ <- service.protectElection(id, organizerToken)
      result <- service.readElection(id, voterToken, None)
    } yield assert(result.isRight)
  }

  test("voter is denied access to a private election") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      _ <- service.privatizeElection(id, organizerToken)
      result <- service.readElection(id, voterToken, None)
    } yield assertEquals(result, Left(PrivateAccess))
  }

  test("voter can read again after republishing") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      _ <- service.privatizeElection(id, organizerToken)
      _ <- service.republishElection(id, organizerToken)
      result <- service.readElection(id, voterToken, None)
    } yield assert(result.isRight)
  }

  // ─── Group 4: organizer-only operations reject voter token ───────────────

  test("retextElection with voter token returns AccessDenied") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      result <- service.retextElection(id, voterToken, "name", None)
    } yield assertEquals(result, Left(AccessDenied))
  }

  test("nominateCandidates with voter token returns AccessDenied") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      result <- service.nominateCandidates(id, voterToken, None, Set.empty)
    } yield assertEquals(result, Left(AccessDenied))
  }

  test("protectElection with voter token returns AccessDenied") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      result <- service.protectElection(id, voterToken)
    } yield assertEquals(result, Left(AccessDenied))
  }

  // ─── Group 5: state mutations reflected on read-back ────────────────────

  test("retextElection updates name and description on read-back") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      _ <- service.retextElection(id, organizerToken, "My Poll", Some("Pick a date"))
      snapshot <- service.readElection(id, organizerToken, None).map(_.toOption.get)
    } yield {
      assertEquals(snapshot.name, "My Poll")
      assertEquals(snapshot.description, Some("Pick a date"))
    }
  }

  test("nominateCandidates updates candidates on read-back") {
    val service = newService()
    val candidates = Set(
      LocalDateTime.of(2026, 6, 1, 10, 0),
      LocalDateTime.of(2026, 6, 2, 14, 0)
    )
    for {
      (id, organizerToken) <- service.publishElection()
      _ <- service.nominateCandidates(id, organizerToken, None, candidates)
      snapshot <- service.readElection(id, organizerToken, None).map(_.toOption.get)
    } yield assertEquals(snapshot.candidates, candidates)
  }

  test("vote appears in snapshot on read-back") {
    val service = newService()
    for {
      (id, organizerToken) <- service.publishElection()
      voterToken <- voterTokenOf(service, id, organizerToken)
      _ <- service.vote(
        id,
        voterToken,
        "localhost",
        java.util.Locale.ENGLISH,
        "Alice",
        None,
        Map.empty,
        "subject",
        "plainText",
        "text"
      )
      snapshot <- service.readElection(id, organizerToken, None).map(_.toOption.get)
    } yield {
      assertEquals(snapshot.votes.size, 1)
      assertEquals(snapshot.votes.head.name, "Alice")
    }
  }
}
