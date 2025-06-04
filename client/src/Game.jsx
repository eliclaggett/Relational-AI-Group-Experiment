import React from "react";
import Chat from "./steps/Chat.jsx";
import Summary from "./steps/Summary.jsx";
import {
  usePlayer,
  useGame,
  useStageTimer,
  useStage,
} from "@empirica/core/player/classic/react";
import Ready from "./steps/Ready.jsx";
import End from "./steps/exit/End.jsx";

export function Game() {
  const player = usePlayer();
  const stage = useStage();
  const stageName = stage?.get("name") || "";

  if (player?.get("ended")) {
    const endReason = player.get("endReason");
    console.log('this player was suspended before, throwing him out.');
    return <End endReason={endReason} />;
  }

  if (stageName == "ready") {
    return <Ready />;
  } else if (stageName.startsWith("group-discussion-")) {
    return <Chat />;
  } else if (stageName == "summary-task") {
    return <Summary />;
  }

  // Default fallback
  return <End />;
}
