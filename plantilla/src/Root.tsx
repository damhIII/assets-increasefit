import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { datos } from "./marco/datos";

export const Root: React.FC = () => (
  <Composition id="Video" component={Video} durationInFrames={datos.video.frames} fps={datos.video.fps} width={datos.video.width} height={datos.video.height} />
);
