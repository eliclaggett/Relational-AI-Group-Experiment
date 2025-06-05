/*
 * Filename: ProgressList.jsx
 * Author: Elijah Claggett, Faria Huq
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

export default function ProgressList({
  items = [],
  active = "0",
  beforeStart = false,
}) {
  const player = usePlayer();
  const game = useGame();
  const stage = useStage();
  const startedGame = game.get("started") || false;
  const stageName = stage ? stage.get("name") : startedGame ? "end" : "intro";
  const stageTimer = useStageTimer();
  const participantStep = player.get("step");
  const gameParams = game.get("gameParams");

  let lobbyTimeout = game.get("lobbyTimeout") || false;
  const [lobbyTimeRemaining, setTimeRemaining] = useState("No time limit");
  const [showWarning, setShowWarning] = useState(false);

  const timeLeft = stageTimer?.remaining ? stageTimer.remaining : 0;
  let timeLeftClass = "timeRemaining";
  if (showWarning && stageName == "intro") timeLeftClass += " warning";
  else timeLeftClass = "timeRemaining";
  let timeRemaining = msToTime(timeLeft, true);
  let remainingTxt = "until next task";
  if (stageName == "summary-task") {
    remainingTxt = "to complete the summary";
  } else if (stageName == "intro") {
    remainingTxt = "to complete tutorial";
    timeRemaining = lobbyTimeRemaining;
  } else if (stageName == "end") {
    remainingTxt = "Study complete";
    timeRemaining = "";
  }

  if (player.get('ended')) {
    remainingTxt = "Study ended";
    timeRemaining = "";
  }

  // Run on component load
  useEffect(() => {
    // Start a timer that we can show in the UI
    if (!startedGame) {
      const interval = setInterval(() => {
        const now = new Date();
        const startTimeStr = game.get("sharedStartTime");
        if (startTimeStr) {
          const startTime = new Date(startTimeStr);
          const elapsedTime = (now - startTime) / 1000 / 60; // in minutes
          const totalDuration = game.get("sharedTutorialLobbyDuration");
          const remainingTime = Math.max(totalDuration - elapsedTime, 0);
          setTimeRemaining(msToTime(remainingTime * 60 * 1000, true));
          setShowWarning(remainingTime < 4);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startedGame]);

  let listItemUI = [];
  let itemIdx = 0;
  for (const item of items) {
    itemIdx++;
    const numberUI = beforeStart ? (
      ""
    ) : (
      <div className="number">
        <span>{itemIdx}</span>
        <NavigateNext />
      </div>
    );
    const isActive = active + 1 == itemIdx ? "active" : "";
    listItemUI.push(
      <Stack
        className={"progressListItem " + isActive}
        key={item["name"]}
        direction="row"
      >
        {numberUI}
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
        fontSize: "0.9rem",
      }}
    >
      {listItemUI}
      <div className="vert-divider"></div>
      <div className={"timeLeft-txt " + timeLeftClass}>
        {!startedGame || stageName == "end"
          ? timeRemaining
          : msToTime(timeLeft, true)}
        {stageName != "end" ? <br /> : ""}
        {remainingTxt}
      </div>
    </Stack>
  );
}
