/*
 * Filename: Survey.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps the "Survey" step of the experiment.
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
} from "@mui/material";

import { msToTime } from "../../utils/formatting.js";
import ProgressList from "../../components/ProgressList.jsx";
import LikertQuestion from "../../components/LikertQuestion.jsx";

export default function Survey({ next }) {
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
  const [surveyAnswers, setSurveyAnswers] = useState({0: '', 1: '', 2: '', 3: '', 4: '', 5:'', 6:''})

  const questions = [
    {
      idx: 0,
      val: "I would want my kids to be taught evolution as a fact of biology",
    },
    {
      idx: 1,
      val: "My second amendment right to bear arms should be protected",
    },
    { idx: 2, val: "I support funding the military" },
    {
      idx: 3,
      val: "Our children are being indoctrinated at school with LGBT messaging",
    },
    {
      idx: 4,
      val: "I would pay higher taxes to support climate change research",
    },
    { idx: 5, val: "Restrictions to stop the spread of COVID-19 went too far" },
    { idx: 6, val: "I want stricter immigration requirements into the U.S." },
  ];

  function updateSurveyAnswers(ev, qIdx) {
    const answer = {};
    answer[qIdx] = ev.target.value;
    setSurveyAnswers({...surveyAnswers, ...answer});
  }

  function handleNext() { 
    player.set('surveyAnswers', surveyAnswers);
    console.log('next');
    next();
  }

  const renderQuestions = () => {
    return questions.map((q) => {
      return (
        <div className="surveyQ" key={'q-'+q.idx}>
          <span className="surveyLabel">{q.val}</span>
          <LikertQuestion
            name="userAgree"
            value={surveyAnswers[q.idx]}
            onChange={(ev) => updateSurveyAnswers(ev, q.idx)}
          />
        </div>
      );
    });
  };

  return (
    <Stack maxWidth="100vw" direction="column" className="parentContainer">
      <Stack
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
          active={0}
        />

        <Typography variant="h1" sx={{ mb: "1rem" }}>
          Stance Survey
        </Typography>
        <Typography variant="body1">
          Please react to all of the statements below before the timer elapses.
          The timer will start when all participants have joined the study.
        </Typography>

        {renderQuestions()}

        <div>
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{ mt: "3rem", mb: "6rem" }}
            disabled={Object.values(surveyAnswers).includes('') ? true : false}
          >
            Submit Answers
          </Button>
        </div>
      </Stack>
    </Stack>
  );
}
