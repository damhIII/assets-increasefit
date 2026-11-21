import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Si el entorno no puede descargar Chrome Headless Shell, usa un Chrome local: export REMOTION_BROWSER=/usr/bin/google-chrome
// (lo leen npm run render y también npm run revisar / stills).
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
