scalaVersion := "3.3.8"
scalacOptions += "-no-indent" // https://docs.scala-lang.org/scala3/reference/other-new-features/indentation.html
// scalacOptions += "-Yexplicit-nulls" // https://docs.scala-lang.org/scala3/reference/experimental/explicit-nulls.html
// but waiting for Scala LTS with https://docs.scala-lang.org/scala3/reference/experimental/explicit-nulls.html#java-interoperability-and-flexible-types

libraryDependencies += "jakarta.inject" % "jakarta.inject-api" % "2.0.1"
libraryDependencies += "com.googlecode.libphonenumber" % "libphonenumber" % "9.0.34"
libraryDependencies += "commons-validator" % "commons-validator" % "1.10.1"

// using https://scalameta.org/munit/ from the https://docs.scala-lang.org/toolkit/introduction.html#what-is-the-scala-toolkit
// previously (yes, not scalatestplus-play): libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.20" % Test
// alternative: https://github.com/com-lihaoyi/utest from the https://github.com/com-lihaoyi#the-lihaoyi-scala-platform-
libraryDependencies += "org.scalameta" %% "munit" % "1.3.4" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "1.4.2" % Test
