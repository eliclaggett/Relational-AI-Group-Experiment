/*
 * Filename: End.jsx
 * Author: Elijah Claggett, Faria Huq
 *
 * Description:
 * This ReactJS component wraps the "End" step of the experiment.
 */

// Imports
import React, { useState, useEffect } from "react";
import {
  usePlayer,
  useGame,
} from "@empirica/core/player/classic/react";
import {
  Alert,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { formatMoney, msToTime } from "../../utils/formatting.js";
import ProgressList from "../../components/ProgressList.jsx";

export default function End({ endReason: propEndReason }) {
  const player = usePlayer();
  const endReason = propEndReason || player.get("endReason") || "none";
  const game = useGame();
  const participantIdx = player.get("participantIdx") || 0;
  const activeRoom = player.get("activeRoom") || 0;
  const rooms = game.get("chatRooms"); // TODO: Change to game parameter
  const chatParticipants = game.get("chatParticipants"); // TODO: Change to game parameter
  const summary = player.get("summary");
  const gameParams = game.get("gameParams");
  const [feedback, setFeedback] = useState("");
  const hasFeedback = player.get("submitFeedback") || false;

  const roomBonus = [];

  let totalPay = gameParams.basePay + gameParams.discussionPay;
  let bonusPay = 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  for (const idx in chatParticipants) {
    const p = chatParticipants[idx];
    if (p.room === activeRoom) {
      if (parseInt(idx) !== parseInt(participantIdx)) {
        console.log('idx', idx, 'participantIdx', participantIdx);
        roomBonus.push(
          <tr key={p["name"]}>
            <td>{p["name"]}</td>
            <td>+{formatMoney(gameParams.bonusPerParticipant)}</td>
          </tr>
        );
        totalPay += gameParams.bonusPerParticipant;
        bonusPay += gameParams.bonusPerParticipant;
      } else {
        roomBonus.push(
          <tr key={p["name"]}>
            <td>{p["name"]} (You)</td>
            <td>+{formatMoney(gameParams.bonusPerParticipant)}</td>
          </tr>
        );
        totalPay += gameParams.bonusPerParticipant;
        bonusPay += gameParams.bonusPerParticipant;
      }
    }
  }

  let ui = (
    <>
      <Typography variant="h1">You have been removed from the study.</Typography>
      <Typography variant="body1">
        Thank you for participating. Please cancel your participation in this
        study as the study timed out.
      </Typography>
    </>
  );
  const notReadyUI = (
    <>
      <Typography variant="h1">
        You have been removed from the study.
      </Typography>
      <Typography variant="body1">
        Thank you for participating. Please cancel your participation in this
        study as you were unable to press the "Ready" button within 30 seconds
        of the group discussion task starting.
      </Typography>
    </>
  );
  const notinlobbyUI = (
    <>
      <Typography variant="h1">
        You have been removed from the study.
      </Typography>
      <Typography variant="body1">
        Thank you for participating. Please cancel your participation in this
        study as the lobby timed out.
      </Typography>
    </>
  );

  console.log(rooms);
  const roomTitle =
    rooms && rooms[activeRoom] ? rooms[activeRoom].title : "none";
  const completeUI = (
    <>
      <Typography variant="h1">Study Complete</Typography>
      {/* <Typography variant="body1">
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
          maxWidth: "36rem",
          width: "auto",
          "& td:nth-child(1)": { width: "33em" },
          "& td:nth-child(2)": { width: "3em", textAlign: "right" },
          tfoot: { fontWeight: "bold" },
        }}
      >
        <tbody>
          <tr style={{ borderBottom: "solid 1px #ccc" }}>
            <td>
              <b>Base Pay</b>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>Study Pay</td>
            <td>{formatMoney(gameParams.basePay)} + {formatMoney(gameParams.discussionPay)}</td>
          </tr>
          <tr style={{ borderBottom: "solid 1px #ccc" }}>
            <td>
              <br />
              <b>Bonus from the other members in room #{roomTitle}</b>
              <br />
              <span style={{ color: "rgba(0,0,0,0.3)" }}>
                (+$1 for every accepted summary, -$0.5 for every rejected
                summary)
              </span>
            </td>
            <td></td>
          </tr>
          {roomBonus}
          <tr>
            <td>
              Bonus Pay
              <br />
            </td>
            <td>{formatMoney(bonusPay)}</td>
          </tr>
          <tr>
            <td>
              <br />
            </td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr
            style={{
              borderTop: "solid 1px #ccc",
              borderBottom: "solid 1px #ccc",
            }}
          >
            <td>Total</td>
            <td>{formatMoney(totalPay)}</td>
          </tr>
        </tfoot>
      </Table> */}
      <Typography variant="body1">
        <b>Please submit this study using the completion code below.</b> We have
        recorded your bonus in our records and will pay it via a Prolific
        completion bonus within 24 hours. If you do not see your bonus by then,
        please do not hesitate to contact us.
      </Typography>
      <Typography variant="h1">
        <b>{gameParams.completionCode}</b>
      </Typography>
      <Typography variant="body1">
        Thank you again for your participation.
      </Typography>
    </>
  );

  const timeoutUI = (
    <>
      <Typography variant="h1">You timed out</Typography>
      <Typography variant="body1">
        You were inactive for over {msToTime(gameParams.inactivityMax * 1000)}{" "}
        minutes during the group discussion task of the study. Per the policies
        described in our consent form, we are required to end your participation
        in the study. Please cancel your participation and/or return the study
        now.
      </Typography>
      <Typography variant="body1">
        We apologize for the inconvenience and thank you again for your
        participation.
      </Typography>
    </>
  );
  const failedTutorialUI = (
    <>
      <Typography variant="h1">You failed the tutorial</Typography>
      <Typography variant="body1">
        You answered two questions incorrectly in the tutorial. Per the policies
        described in our consent form, we are required to end your participation
        in the study. Please cancel your participation and/or return the study
        now.
      </Typography>
      <Typography variant="body1">
        We apologize for the inconvenience and thank you again for your
        participation.
      </Typography>
    </>
  );

  if (endReason == "timeout") {
    ui = timeoutUI;
  } else if (endReason == "failedTutorial") {
    ui = failedTutorialUI;
  } else if (summary) {
    ui = completeUI;
  } else if (endReason == "not-ready") {
    ui = notReadyUI;
  } else if (endReason == "not-in-lobby") {
    ui = notinlobbyUI;
  }

  function submitFeedback() {
    player.set("submitFeedback", feedback);
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
          active={3}
        />
        {ui}
        <Typography variant="h4">
          If you have extra time, we would really appreciate your feedback to
          make this study better. What can we do to improve?
        </Typography>
        <TextField
          multiline
          rows={4}
          placeholder="Enter feedback here."
          value={feedback}
          onChange={(ev) => {
            setFeedback(ev.target.value);
          }}
        />
        <div>
          <Button variant="contained" onClick={submitFeedback}>
            Submit Feedback
          </Button>
        </div>
        <Alert sx={{ display: hasFeedback ? "flex" : "none" }}>
          We received your comments. Thank you for your feedback!
        </Alert>
      </Stack>
    </Stack>
  );
}
