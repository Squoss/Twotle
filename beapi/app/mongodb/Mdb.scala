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

package mongodb

// Replaces the default UuidCodec with one that uses the new standard UUID representation
// cf. https://mongodb.github.io/mongo-java-driver/4.11/driver-reactive/tutorials/databases-collections/#codecregistry
import com.mongodb.MongoClientSettings
import com.mongodb.reactivestreams.client.MongoClients
import com.mongodb.reactivestreams.client.MongoCollection
import jakarta.inject.Inject
import jakarta.inject.Singleton
import org.bson.BsonDocument
import org.bson.UuidRepresentation
import org.bson.codecs.UuidCodec
import org.bson.codecs.configuration.CodecRegistries
import play.api.Configuration
import play.api.Logging
import play.api.inject.ApplicationLifecycle

import scala.concurrent.Future

@Singleton
class Mdb @Inject() (
    applicationLifecycle: ApplicationLifecycle,
    config: Configuration
) extends Logging {

  val codecRegistry = CodecRegistries.fromRegistries(
    CodecRegistries.fromCodecs(new UuidCodec(UuidRepresentation.STANDARD)),
    MongoClientSettings.getDefaultCodecRegistry
  )

  logger.info("opening connection to MongoDB")
  private val client = MongoClients.create(config.get[String]("mongodb.uri"))
  private val database = client
    .getDatabase(config.get[String]("mongodb.db"))
    .withCodecRegistry(codecRegistry)
  logger.info("opened connection to MongoDB")

  applicationLifecycle.addStopHook(() => {
    logger.info("closing connection to MongoDB")
    Future.successful(client.close())
  })

  def apply(collection: String): MongoCollection[BsonDocument] =
    database.getCollection(collection, classOf[BsonDocument])
}
