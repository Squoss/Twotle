name := "Fixadat"

version := "ToBeDetermined"

organization := "com.squeng"
organizationName := "Squeng AG"
organizationHomepage := Some(url("https://www.squeng.com/"))

homepage := Some(url("https://fixadat.com"))
startYear := Some(2021)
description := "a tip of the hat to classic Doodle"
licenses += "MIT" -> url("https://choosealicense.com/licenses/mit/")

lazy val root = (project in file("."))
    .enablePlugins(PlayScala)
// https://www.playframework.com/documentation/latest/SBTSubProjects#Adding-a-simple-library-sub-project
    .aggregate(hexagon)
    .dependsOn(hexagon)
lazy val hexagon = project

scalaVersion := "3.3.7"
scalacOptions += "-no-indent" // https://docs.scala-lang.org/scala3/reference/other-new-features/indentation.html

libraryDependencies += guice
libraryDependencies += ws
libraryDependencies += "org.mongodb" % "mongodb-driver-reactivestreams" % "5.8.0"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.2" % Test
libraryDependencies += "com.tngtech.archunit" % "archunit" % "1.4.2" % Test

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.squeng.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.squeng.binders._"

Compile / doc / sources                := Seq.empty
Compile / packageDoc / publishArtifact := false
