/*
 * Filename: Lobby.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file is the waiting room displayed while we wait for all participants to finish onboarding.
 * Participants can use this time to become acquainted with pairing methodology and the features of the chat.
 */

// Imports
import * as React from "react";
import { Typography, Stack, IconButton, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import { msToTime } from "../../utils/formatting";
import ProgressList from "../../components/ProgressList.jsx";
// import TaskInstructions from "./components/TaskInstructions.jsx";

export default function Lobby() {
  // Useful variables
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get("gameParams");
  let lobbyTimeout = game.get("lobbyTimeout") || false;

  // State variables
  const [timeRemaining, setTimeRemaining] = useState("--:--");

  // Run on component load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Start a timer that we can show in the UI
    if (!lobbyTimeout) {
      game.set("startLobby", true);
      lobbyTimeout =
        Date.now() + parseInt(game.get("lobbyDuration")) / 1000 / 1000;
    } else {
      lobbyTimeout = new Date(lobbyTimeout);
    }

    // Poll the timer
    const interval = setInterval(() => {
      const now = new Date();
      const diffMS = lobbyTimeout - now;

      setTimeRemaining(msToTime(diffMS));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  const animalOptions = player.get("animalOptions") || [];
  const color = player.get("color");
  const selfIdentity = player.get("selfIdentity") || "";

  function selectIdentity(animal) {
    player.set("selfIdentity", animal);
  }

  function generateAnimalList(animals) {
    return animals.map((animal) => {
      return (
        <Stack
          direction={"column"}
          alignItems={"center"}
          className={
            selfIdentity == animal
              ? "identityChooser active"
              : "identityChooser"
          }
          key={animal}
        >
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

  // UI
  return (
    <Stack maxWidth="100vw" className="parentContainer">
      <Stack
        sx={{
          height: "100vh",
          width: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
        }}
        direction={"column"}
        gap={3}
      >
        <ProgressList
          items={[
            {
              name: "Survey",
              time: "~" + gameParams.surveyTime.toString() + " min",
            },
            {
              name: "Group Discussion",
              time: "~" + gameParams.chatTime.toString() + " min",
            },
            {
              name: "Summary Task",
              time: "~" + gameParams.summaryTime.toString() + " min",
            },
          ]}
          active={0}
        />

        <Typography variant="h1" sx={{ pt: 12 }}>
          Thank you for completing the survey.
        </Typography>
        <Typography variant="body1">
          Once all other participants to finish before we begin the group
          discussion task.
        </Typography>
        <Typography variant="body1">
          You will wait a maximimum of {timeRemaining}.
        </Typography>
        <Typography variant="body1">
          When all participants are finished with the survey, you will have 30
          seconds to click "Ready" to continue with the study.
        </Typography>
        <Typography variant="body1">
          While you wait, please select an identity to use for the group
          discussion.
        </Typography>
        <Typography variant="body1">
          <b>Click on the identity you would like to use during the chat.</b>
        </Typography>
        <Stack direction={"row"} gap={2}>
          {generateAnimalList(animalOptions)}
        </Stack>
        {/* <Button variant='contained' onClick={() => player.set('ready', true)}>Ready</Button> */}
      </Stack>
    </Stack>
  );
}
