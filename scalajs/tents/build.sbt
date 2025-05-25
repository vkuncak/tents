enablePlugins(ScalaJSPlugin)

name := "Tents"

version := "0.1.0"

scalaVersion := "3.3.0"

libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "2.3.0"
)

scalaJSUseMainModuleInitializer := true

//scalaJSMainModuleInitializer := Some("tents.Main.main")

/*
scalaJSLinkerConfig := {
  scalaJSLinkerConfig.value
    .withExperimentalUseWebAssembly(true) // use the Wasm backend
    .withModuleKind(ModuleKind.ESModule)  // required by the Wasm backend
}
*/