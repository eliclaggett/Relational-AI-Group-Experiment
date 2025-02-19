/*
 * Filename: Chat.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file displays a chat window for participants to discuss with each other about assigned topics.
 */

// Imports
import { usePlayer } from "@empirica/core/player/classic/react";
import { Avatar, Button, IconButton, Stack } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";

export default function IdentitySelect({next}) {
  // Useful variables
  const player = usePlayer();
  const animalOptions = player.get('animalOptions') || [];
  const color = player.get('color');
  const selfIdentity = player.get('selfIdentity') || '';
  let disabled = selfIdentity == '';

  function selectIdentity(animal) {
    player.set('selfIdentity', animal);
  }

  function continueToChat() {
    next();
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
    <>
      <Stack
        sx={{
          height: "100vh",
          width: "100vw",
          justifyContent: "center",
          alignItems: "center",
        }}
        direction={"column"}
        gap={4}
      >
        <h2>Select an identity to use during the chat.</h2>
        <Stack direction={"row"} gap={2}>
          {generateAnimalList(animalOptions)}
        </Stack>
        <Button variant="outlined" disabled={disabled} onClick={continueToChat}>Continue</Button>
      </Stack>
    </>
  );
}
