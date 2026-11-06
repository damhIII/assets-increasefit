import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Si el entorno no puede descargar Chrome Headless Shell, usa un Chrome local:
// Config.setBrowserExecutable("/usr/bin/google-chrome");
