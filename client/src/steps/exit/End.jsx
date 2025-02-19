/*
 * Filename: End.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps the "End" step of the experiment.
 */

// Imports
import React, { useState, useEffect, useRef } from "react";
import {
  usePlayer,
  useGame,
  useStageTimer,
  useStage,
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
  Table,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { formatMoney, msToTime } from "../../utils/formatting.js";
import ProgressList from "../../components/ProgressList.jsx";
import LikertQuestion from "../../components/LikertQuestion.jsx";

export default function End({}) {
  const player = usePlayer();
  const game = useGame();
  const stage = useStage();
  const stageName = stage?.get('name') || "end";
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
  const summary = player.get("summary");
  const gameParams = game.get("gameParams");
  const endReason = player.get('endReason') || 'none';

  const roomBonus = [];

  let self = {};
  let totalPay = gameParams.basePay;
  const [userAgreeVal, setUserAgreeVal] = useState("");
  for (const idx in chatParticipants) {
    const p = chatParticipants[idx];
    if (p.room == activeRoom) {
      if (idx == participantIdx) {
        self = chatParticipants[idx];
        roomBonus.push(
          <tr key={p["name"]}>
            <td>@{p["name"]} (You)</td>
            <td>+{formatMoney(gameParams.bonusPerParticipant)}</td>
          </tr>
        );
        totalPay += gameParams.bonusPerParticipant;
      } else {
        roomBonus.push(
          <tr key={p["name"]}>
            <td>@{p["name"]}</td>
            <td>+{formatMoney(gameParams.bonusPerParticipant)}</td>
          </tr>
        );
        totalPay += gameParams.bonusPerParticipant;
      }
    }
  }

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
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              variant="dot"
              className={lastActiveDiff < 120 ? "active" : "idle"}
            >
              <Avatar
                alt={user.name}
                src={"/assets/animal_icons/" + user.name + ".svg"}
                sx={{ bgcolor: user.color }}
              />
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={user.name == self.name ? user.name + " (You)" : user.name}
            secondary={lastActiveDiff < 120 ? "Active" : "Idle"}
          />
          <LikertQuestion
            name="userAgree"
            value={userAgreeVal}
            onChange={(ev) => setUserAgreeVal(ev.target.value)}
          />
        </ListItem>
      );
    });
  }

  function handleSubmitSummary() {
    player.set("summary", true);
  }
  let ui = (
    <>
      <Typography variant="h1"></Typography>
      <Typography variant="body1">
        Study ended.
      </Typography>
    </>
  );

  const roomTitle = rooms && activeRoom && rooms[activeRoom] ? rooms[activeRoom].title : '';
  const completeUI = <>
  <Typography variant="h1">Study Complete</Typography>
        <Typography variant="body1">
          Thank you for your patience. We have finished analyzing all
          participants' summaries and calculated your final pay.
        </Typography>
        <Typography variant="body1">
          Your pay was calculated as follows:
        </Typography>

        <Table
          borderAxis="none"
          variant="plain"
          sx={{
            py: 3,
            maxWidth: "45rem",
            // mx: "auto",
            "& tbody td:nth-child(1)": { width: "75%" },
            tfoot: { fontWeight: "bold" },
          }}
        >
          <tbody>
            <tr>
              <td>
                <b>Base Pay</b>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Study Pay</td>
              <td>+{formatMoney(gameParams.basePay)}</td>
            </tr>
            <tr>
              <td>
                <b>
                  Bonus from the other members in room #
                  {roomTitle}
                </b>
                <br />
                <span style={{color: 'rgba(0,0,0,0.3)'}}>(+$1 for every accepted summary, -$0.5 for every rejected
                summary)</span>
              </td>
              <td></td>
            </tr>
            {roomBonus}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{formatMoney(totalPay)}</td>
            </tr>
          </tfoot>
        </Table>
        <Typography variant="body1">
          Please submit this study using the completion code below. We have
          recorded your bonus in our records and will pay it via a Prolific
          completion bonus within 24 hours. If you do not see your bonus by
          then, please do not hesitate to contact us.
        </Typography>
        <Typography variant="h1">
          <b>{gameParams.completionCode}</b>
        </Typography>
        <Typography variant="body1">
          Thank you again for your participation.
        </Typography>
  </>;

  const timeoutUI = <>
  <Typography variant="h1">You timed out</Typography>
        <Typography variant="body1">
          You were inactive for over 2 minutes during the group discussion task of the study. Per the policies described in our consent form, we are required to end your participation in the study. Please cancel your participation and/or return the study now.
        </Typography>
        <Typography variant="body1">
        We apologize for the inconvenience and thank you again for your participation.
        </Typography>
  </>;
  const failedTutorialUI = <>
  <Typography variant="h1">You failed the tutorial</Typography>
        <Typography variant="body1">
          You answered two questions incorrectly in the tutorial. Per the policies described in our consent form, we are required to end your participation in the study. Please cancel your participation and/or return the study now.
        </Typography>
        <Typography variant="body1">
        We apologize for the inconvenience and thank you again for your participation.
        </Typography>
  </>;

  if (endReason == 'timeout') {
    ui = timeoutUI;
  } else if (endReason == 'failedTutorial') {
    ui = failedTutorialUI;
  }

  return (
    <Stack className="parentContainer">
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
            { name: "Initial Survey", time: "~"+gameParams.lobbyTime.toString() +" min" },
      { name: "Group Discussion", time: "~"+gameParams.chatTime.toString() +" min" },
      { name: "Summary Task", time: "~"+gameParams.summaryTime.toString() +" min" },
          ]}
          active={3}
        />
        {ui}
      </Stack>
    </Stack>
  );
}
