/*
 * Filename: ProgressList.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps the study completion progress indicator in a list
 */

// Imports
import React, { useState, useEffect, useRef } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import {
  usePlayer,
  useGame,
  useStageTimer,
  useStage,
} from "@empirica/core/player/classic/react";
import { NavigateNext } from "@mui/icons-material";
import "./ProgressList.scss";
import { msToTime } from "../utils/formatting.js";

export default function ProgressList({ items = [], active = "0" }) {
  const player = usePlayer();
  const game = useGame();
  const stage = useStage();
  const startedGame = game.get("started") || false;
  const stageName = stage ? stage.get('name') : startedGame ? 'end' : 'intro';
  const stageTimer = useStageTimer();
  const participantStep = player.get('step');
  const gameParams = game.get('gameParams');

  let lobbyTimeout = game.get("lobbyTimeout") || false;
  const [lobbyTimeRemaining, setTimeRemaining] = useState(
    "No time limit"
  );

  const timeLeft = stageTimer?.remaining ? stageTimer.remaining : 0;
  let timeLeftClass =
    timeLeft > 5 * 1000 * 60 ? "timeRemaining" : "timeRemaining low";
  if (timeLeft <= 0) {
    timeLeftClass = "";
  }
  let timeRemaining = msToTime(stageTimer?.remaining ? stageTimer.remaining : 0);
  let remainingTxt = 'until next task';
  if (stageName == 'summary-task') {
    remainingTxt = 'until study ends';
  } else if (stageName == 'intro') {
    remainingTxt = 'until study starts';
    timeRemaining = lobbyTimeRemaining;
  } else if (stageName == 'end') {
    remainingTxt = 'Study complete';
    timeRemaining = '';
  }

  // Run on component load
  useEffect(() => {
    // Start a timer that we can show in the UI
    if (!startedGame) {
      // Poll the timer
      const interval = setInterval(() => {
        let lobbyTimeoutDt = 0;
        if (!lobbyTimeout) {
          return;
        } else {
          lobbyTimeoutDt = new Date(lobbyTimeout);
        }

        const now = new Date();
        const diffMS = lobbyTimeoutDt - now;

        setTimeRemaining(msToTime(diffMS));
      }, 1000);
      return () => clearInterval(interval);
    } else {

    }
    
  }, [startedGame, lobbyTimeout]);

  let listItemUI = [];
  let itemIdx = 0;
  for (const item of items) {
    itemIdx++;
    const isActive = active + 1 == itemIdx ? "active" : "";
    listItemUI.push(
      <Stack
        className={"progressListItem " + isActive}
        key={item["name"]}
        direction="row"
      >
        <div className="number">
          <span>{itemIdx}</span>
          <NavigateNext />
        </div>
        <Stack direction="column" className="progressListDesc">
          <strong>{item["name"]}</strong>
          <span>{item["time"]}</span>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      className="progressList"
      sx={{
        justifyContent: "center",
        alignItems: "center",
        mt: "1rem",
        mb: "1rem",
        fontSize: '0.9rem'
      }}
    >
      {listItemUI}
      <div className="vert-divider"></div>
      <div className={"timeLeft-txt " + timeLeftClass}>
        {!startedGame || stageName == 'end' ? timeRemaining : msToTime(timeLeft)}
        {stageName != 'end' ? <br/> : ''}
        {remainingTxt}
      </div>
    </Stack>
  );
}
