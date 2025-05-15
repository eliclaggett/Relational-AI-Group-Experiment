/*
 * Filename: Ready.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file displays a chat window for participants to discuss with each other about assigned topics.
 */

// Imports
import React, { useEffect } from "react";
import ProgressList from "../components/ProgressList.jsx";
import {
  Alert,
  Avatar,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  usePlayer,
  useGame,
  useStageTimer,
} from "@empirica/core/player/classic/react";
import { msToTime } from "../utils/formatting.js";

const keyframes = `
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }
`;

export default function Ready({}) {
  // Useful variables
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get("gameParams");
  const stageTimer = useStageTimer();

  const animalOptions = player.get("animalOptions") || [];
  const color = player.get("color");
  const selfIdentity = player.get("selfIdentity") || "";
  const ready = player.get("ready");
  let disabled = selfIdentity == "" || ready;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function selectIdentity(animal) {
    player.set("selfIdentity", animal);
  }

  function continueToChat() {
    if (player.selfIdentity != "") {
      player.set("ready", true);
      player.set("step", "group-discussion");
      player.stage.set("submit", true);
    }
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

  return (
    <Stack alignItems={"center"}>
      <style>{keyframes}</style>
      <Stack
        sx={{
          width: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
        }}
        gap={6}
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

        <Typography variant="h1">The study has started!</Typography>

        <Typography variant="h4">
          First, please select an identity to use during the chat.
        </Typography>
        <Stack direction={"row"} gap={2}>
          {generateAnimalList(animalOptions)}
        </Stack>

        <Typography variant="h4">
          Next, click "Ready" to continue to the next task before the timer runs
          out.
          <br />
          <br />
          <b>
            {stageTimer ? msToTime(stageTimer.remaining) : "No time"} remaining.
          </b>
        </Typography>
        <div>
          <Alert
            variant="standard"
            sx={{ mb: 6, display: ready ? "flex" : "none" }}
          >
            Thank you for your attention! We will start the group discussion
            shortly.
          </Alert>
          <Button
            variant="contained"
            disabled={disabled}
            onClick={continueToChat}
            className={!disabled ? "ripple-effect-button" : ""}
            sx={{
              position: "relative",
              overflow: "visible",
              "&.ripple-effect-button::before": !disabled
                ? {
                    content: '""',
                    position: "absolute",
                    display: "block",
                    width: "200%",
                    height: "200%",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 123, 255, 0.3)",
                    left: "-50%",
                    top: "-50%",
                    pointerEvents: "none",
                    animation: "ripple 1.5s infinite linear",
                    zIndex: -1,
                  }
                : {},
            }}
          >
            Ready
          </Button>
        </div>
      </Stack>
    </Stack>
  );
}
