/*
 * Filename: Ready.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file displays a chat window for participants to discuss with each other about assigned topics.
 */

// Imports
import React, { useState, useEffect, useRef } from "react";
import ChatRoom from "../components/ChatRoom.jsx";
import ProgressList from "../components/ProgressList.jsx";
import { Avatar, Button, IconButton, Stack, Typography } from "@mui/material";
import {
  usePlayer,
  useGame,
  useStageTimer,
} from "@empirica/core/player/classic/react";
import { msToTime } from "../utils/formatting.js";

export default function Ready({}) {
  // Useful variables
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get('gameParams');
  const stageTimer = useStageTimer();

  const animalOptions = player.get('animalOptions') || [];
  const color = player.get('color');
  const selfIdentity = player.get('selfIdentity') || '';
  let disabled = selfIdentity == '';

  function selectIdentity(animal) {
    player.set('selfIdentity', animal);
  }

  function continueToChat() {
    if (player.selfIdentity != '') {
      player.set('ready', true);
      player.set('step', 'group-discussion');
      player.stage.set('submit', true);
    }
  }

  function generateAnimalList(animals) {
    return animals.map((animal) => {
      return (
        <Stack direction={"column"} alignItems={"center"} className={selfIdentity == animal ? 'identityChooser active' :'identityChooser'} key={animal}>
          <IconButton onClick={() => selectIdentity(animal)}>
            <Avatar
              alt={animal}
              src={"/assets/animal_icons/" + animal + ".svg"}
              sx={{ bgcolor: color }}
            />
          </IconButton>
          @{animal}
        </Stack>
      );
    });
  }

  return (
    <Stack alignItems={'center'}>
    <Stack sx={{ width: {
      xs: '40rem',
      md: '50rem',
      lg: '70rem',
    } }} gap={6}>
      <ProgressList
        items={[
          { name: "Initial Survey", time: "~"+gameParams.lobbyTime.toString() +" min" },
      { name: "Group Discussion", time: "~"+gameParams.chatTime.toString() +" min" },
      { name: "Summary Task", time: "~"+gameParams.summaryTime.toString() +" min" },
        ]}
        active={0}
      />

<Typography variant="h2">
        The study has started!
      </Typography>

      <Typography variant="h2">
        First, please select an identity to use during the chat.
      </Typography>
      <Stack direction={"row"} gap={2}>
        {generateAnimalList(animalOptions)}
      </Stack>

      <Typography variant="h2">
        Next, click "Ready" to continue to the next task before the timer runs out.<br/><br/>
        <b>{stageTimer? msToTime(stageTimer.remaining): 'No time'} remaining.</b>
      </Typography>
      <div>
      <Button variant="contained" disabled={disabled} onClick={continueToChat}>
        Ready
      </Button>
      </div>
    </Stack>
    </Stack>
  );
}
