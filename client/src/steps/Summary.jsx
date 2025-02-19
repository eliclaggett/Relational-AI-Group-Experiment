/*
 * Filename: Summary.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps the "Summary" step of the experiment.
 */

// Imports
import React, { useState, useEffect, useRef } from "react";
import {
  usePlayer,
  useGame,
  useStageTimer,
} from "@empirica/core/player/classic/react";
import {
  Avatar,
  Badge,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Unstable_TrapFocus,
} from "@mui/material";

import { msToTime } from "../utils/formatting.js";
import ProgressList from "../components/ProgressList.jsx";
import LikertQuestion from "../components/LikertQuestion.jsx";

export default function Summary({}) {
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get('gameParams');
  const participantIdx = player.get("participantIdx") || 0;
  const selfIdentity = player.get("selfIdentity");
  const color = player.get("color");
  const viewingRoom = player.get("viewingRoom") || 0; // TODO: Remove else
  const activeRoom = player.get("activeRoom") || 0; // TODO: Remove else
  const [newRoomOpen, setNewRoomOpen] = React.useState(false);
  const rooms = game.get("chatRooms"); // TODO: Change to game parameter
  const chatParticipants = game.get("chatParticipants"); // TODO: Change to game parameter
  const messages = game.get("chatChannel-" + viewingRoom) || [];
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const stageTimer = useStageTimer();
  const timeLeft = stageTimer?.remaining ? stageTimer.remaining : 0;
  const summary = player.get('summary');

  let self = {};
  const [userAgreeVal, setUserAgreeVal] = useState({});
  for (const idx in chatParticipants) {
    if (idx == participantIdx) {
      self = chatParticipants[idx];
    }
  }
  
  useEffect(() => {
    const roomParticipants = [];
    let tmp = userAgreeVal;
    for (const idx in chatParticipants) {
      if (
        chatParticipants[idx].room == viewingRoom &&
        chatParticipants[idx].name != self.name
      ) {
        tmp[chatParticipants[idx].name] == '';
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
          None
        </Typography>
      );
    }
    return roomParticipants.map((user) => {
      const lastActiveDiff = (new Date().getTime() - user.active) / 1000;

      return (
        <ListItem key={"user-" + user.name}>
          <ListItemAvatar>
              <Avatar
                alt={user.name}
                src={"/assets/animal_icons/" + user.name + ".svg"}
                sx={{ bgcolor: user.color }}
              />
          </ListItemAvatar>
          <ListItemText
            primary={user.name == self.name ? user.name + " (You)" : user.name}
          />
          <div>
            <Typography variant='body1'><b>How did you feel about the opinions of the participant labeled @{user.name}?</b></Typography>
          <LikertQuestion
            name="userAgree"
            value={userAgreeVal[user.name]}
            onChange={(ev) => {
              const answer = {};
              answer[qIdx] = ev.target.value;
              setUserAgreeVal({...userAgreeVal, ...answer});
            }}
          />
          </div>
        </ListItem>
      );
    });
  }

  function handleSubmitSummary() {
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
          label="Summarize the main themes of the discussion in the room #room from start to end"
        />
        <TextField
          id="outlined-multiline-static"
          label=""
          multiline
          rows={4}
          placeholder="Type answer here."
        />
      </FormGroup>

      <FormGroup>
        <span>At the end of the discussion task, these were the other members of your chat room:</span>
        <span>
          For each member, rate your level of agreement or disagreement with
          their opinions during the discussion. This will be compared with their
          answers about you.
        </span>
        {generateUserListItems()}
      </FormGroup>
      <div>
      <Button onClick={handleSubmitSummary} variant={'contained'} sx={{mt: '3rem', mb: '6rem'}}>Submit & Finish Study</Button>
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
      <Stack gap={2} sx={{
          width: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
        }}
        direction={"column"}>
      <ProgressList
        items={[
          { name: "Initial Survey", time: "~"+gameParams.lobbyTime.toString() +" min" },
      { name: "Group Discussion", time: "~"+gameParams.chatTime.toString() +" min" },
      { name: "Summary Task", time: "~"+gameParams.summaryTime.toString() +" min" },
        ]}
        active={2}
      />

      {ui}
      </Stack>
    </Stack>
  );
}
