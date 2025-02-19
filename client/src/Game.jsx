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
  const game = useGame();
  const stage = useStage();
  const stageName = stage?.get('name') || '';
  const step = player.get('step');

  // let ui = <End/>;
  let ui = '';
  // if (step != 'end') {
    if (stageName == 'group-discussion') { ui = <Chat/>; }
    else if (stageName == 'summary-task') { ui = <Summary/>; }
    else if (stageName == 'ready') { ui = <Ready/>; }
  // }

  // also need to include Summary task here.
  return ui;
}
