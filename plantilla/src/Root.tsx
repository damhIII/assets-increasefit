import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { brief } from "./marco/datos";

export const Root: React.FC = () => (
  <Composition id="Video" component={Video} durationInFrames={brief.video.frames} fps={brief.video.fps} width={brief.video.width} height={brief.video.height} />
);
