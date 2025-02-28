/*
 * Filename: Summary.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps the "Summary" step of the experiment.
 */

// Imports
import React, { useState, useEffect } from "react";
import {
  usePlayer,
  useGame,
  useStageTimer,
} from "@empirica/core/player/classic/react";
import {
  Avatar,
  Button,
  FormControlLabel,
  FormGroup,
  ListItem,
  ListItemAvatar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ProgressList from "../components/ProgressList.jsx";
import LikertQuestion from "../components/LikertQuestion.jsx";

export default function Summary({}) {
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get("gameParams");
  const participantIdx = player.get("participantIdx") || 0;
  const viewingRoom = player.get("viewingRoom") || 0; // TODO: Remove else
  const chatParticipants = game.get("chatParticipants"); // TODO: Change to game parameter
  const summary = player.get("summary");
  const [summaryText, setSummaryText] = useState("");

  let self = {};
  const [userAgreeVal, setUserAgreeVal] = useState({});
  for (const idx in chatParticipants) {
    if (idx == participantIdx) {
      self = chatParticipants[idx];
    }
  }

  useEffect(() => {
    let tmp = userAgreeVal;
    for (const idx in chatParticipants) {
      if (
        chatParticipants[idx].room == viewingRoom &&
        chatParticipants[idx].name != self.name
      ) {
        tmp[chatParticipants[idx].name] == "";
      }
    }
    setUserAgreeVal(tmp);
  }, []);

  function generateUserListItems() {
    const roomParticipants = [];
    for (const idx in chatParticipants) {
      if (
        chatParticipants[idx].room == viewingRoom &&
        chatParticipants[idx].name != self.name
      ) {
        roomParticipants.push(chatParticipants[idx]);
      }
    }

    if (roomParticipants.length == 0) {
      return (
        <Typography variant="body-sm" className="note">
          <b>
            There were no other members of your chat room, you may skip this
            step.
          </b>
        </Typography>
      );
    }
    return roomParticipants.map((user) => {
      return (
        <ListItem key={"user-" + user.name} sx={{ p: 0 }}>
          <div>
            <Typography variant="h4" sx={{ mt: 6, mb: 4 }}>
              How did you feel about the opinions of the participant labeled{" "}
              <ListItemAvatar>
                <Avatar
                  alt={user.name}
                  src={"/assets/animal_icons/" + user.name + ".svg"}
                  sx={{ bgcolor: user.color }}
                />
                &nbsp;
                <span style={{ color: "rgb(145,145,145)" }}>{user.name}</span>
              </ListItemAvatar>
              ?
            </Typography>
            <LikertQuestion
              name="userAgree"
              value={userAgreeVal[user.name]}
              onChange={(ev) => {
                const answer = {};
                answer[user.name] = ev.target.value;
                setUserAgreeVal({ ...userAgreeVal, ...answer });
              }}
            />
          </div>
        </ListItem>
      );
    });
  }

  function handleSubmitSummary() {
    player.set("summaryText", summaryText);
    player.set("summaryAgreement", userAgreeVal);
    player.set("summary", true);
  }
  let ui = (
    <>
      <Typography variant="h1">Summary Task</Typography>
      <Typography variant="body1">
        Please answer the questions below to the best of your ability before the
        timer elapses. This is the final task of the study
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<></>}
          label={
            "Summarize the main themes of the discussion in the room you ended in, from start to end"
          }
        />
        <TextField
          multiline
          value={summaryText}
          onChange={(ev) => {
            setSummaryText(ev.target.value);
          }}
          rows={4}
          placeholder="Type answer here."
        />
      </FormGroup>

      <FormGroup>
        <Typography variant="body1" sx={{ my: 2 }}>
          For each member of the chat room you ended in, rate your level of
          agreement or disagreement with their opinions during the discussion.
          This will be compared with their answers about you to help determine
          the quality of your summary.
        </Typography>
        {generateUserListItems()}
      </FormGroup>
      <div>
        <Button
          onClick={handleSubmitSummary}
          variant={"contained"}
          sx={{ mt: "3rem", mb: "6rem" }}
        >
          Submit & Finish Study
        </Button>
      </div>
    </>
  );
  if (summary) {
    ui = (
      <>
        <Typography variant="h1">Thank you for your participation.</Typography>
        <Typography variant="body1">
          We are waiting on all other participants to finish writing their
          summaries before we can analyze them and calculate your final pay.
        </Typography>
      </>
    );
  }

  return (
    <Stack
      sx={{ minHeight: "100vh", width: "100vw" }}
      direction={"column"}
      className="parentContainer"
    >
      <Stack
        gap={2}
        sx={{
          width: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
        }}
        direction={"column"}
      >
        <ProgressList
          items={[
            {
              name: "Initial Survey",
              time: "~" + gameParams.lobbyTime.toString() + " min",
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
          active={2}
        />

        {ui}
      </Stack>
    </Stack>
  );
}
