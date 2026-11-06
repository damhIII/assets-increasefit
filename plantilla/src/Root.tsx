import React from "react";
import { Composition, Still } from "remotion";
import { Video } from "./Video";
import { HojaRig } from "./HojaRig";
import { brief } from "./marco/datos";
import { MOVIMIENTOS } from "./rep/esqueleto";

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={brief.video.frames} fps={brief.video.fps} width={brief.video.width} height={brief.video.height} />
    <Still id="HojaRig" component={HojaRig} width={3240} height={Math.ceil(Object.keys(MOVIMIENTOS).length / 3) * 520} />
  </>
);
