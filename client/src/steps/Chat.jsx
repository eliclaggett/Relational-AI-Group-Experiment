/*
 * Filename: Chat.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file displays a chat window for participants to discuss with each other about assigned topics.
 */

// Imports
import React, { useState, useEffect, useRef } from "react";
import ChatRoom from "../components/ChatRoom.jsx";
import ProgressList from "../components/ProgressList.jsx";
import { Stack } from "@mui/material";
import {
  usePlayer,
  useGame,
  useStageTimer,
} from "@empirica/core/player/classic/react";

export default function Chat({}) {
  // Useful variables
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get('gameParams');

  return <Stack sx={{height: '100vh', backgroundColor: 'rgb(245, 245, 245)', overflow: 'auto'}}>
  <ProgressList
    items={[
      { name: "Initial Survey", time: "~"+gameParams.lobbyTime.toString() +" min" },
      { name: "Group Discussion", time: "~"+gameParams.chatTime.toString() +" min" },
      { name: "Summary Task", time: "~"+gameParams.summaryTime.toString() +" min" },
    ]}
    active={1}
  />
  <ChatRoom />
  </Stack>;
}
