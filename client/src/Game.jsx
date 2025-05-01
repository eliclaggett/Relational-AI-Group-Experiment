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
  const stage = useStage();
  const stageName = stage?.get("name") || "";

  let ui = <End />;

  if (stageName == "ready") {
    ui = <Ready />;
  } else if (stageName.startsWith("group-discussion-")) {
    ui = <Chat />;
  } else if (stageName == "summary-task") {
    ui = <Summary />;
  }

  // also need to include Summary task here.
  return ui;
}
