/*
 * Filename: Survey.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps the "Survey" step of the experiment.
 */

// Imports
import React, { useState, useEffect } from "react";
import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import { Button, Stack, Typography } from "@mui/material";
import ProgressList from "../../components/ProgressList.jsx";
import LikertQuestion from "../../components/LikertQuestion.jsx";

export default function Survey({ next }) {
  const player = usePlayer();
  const game = useGame();
  const gameParams = game.get("gameParams");

  const surveyAnswersInit = {};
  gameParams.topics.forEach((_, index) => {
    surveyAnswersInit[index] = "";
  });
  const [surveyAnswers, setSurveyAnswers] = useState(surveyAnswersInit);

  useEffect(() => {
    document.querySelector(".parentContainer").scrollIntoView();
  }, []);

  const questions = gameParams.topics.map((value, index) => ({
    idx: index,
    val: value,
  }));

  function updateSurveyAnswers(ev, qIdx) {
    const answer = {};
    answer[qIdx] = ev.target.value;
    setSurveyAnswers({ ...surveyAnswers, ...answer });
  }

  function handleNext() {
    player.set("surveyAnswers", surveyAnswers);
    next();
  }

  const renderQuestions = () => {
    return questions.map((q) => {
      return (
        <div className="surveyQ" key={"q-" + q.idx}>
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
            {
              name: "Survey",
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
          active={0}
        />

        <Typography variant="h1" sx={{ mb: "1rem" }}>
          Survey
        </Typography>
        <Typography variant="body1">
          Please react to all of the statements below before the timer elapses.
        </Typography>

        {renderQuestions()}

        <div>
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{ mt: "3rem", mb: "6rem" }}
            disabled={Object.values(surveyAnswers).includes("") ? true : false}
          >
            Submit Answers
          </Button>
        </div>
      </Stack>
    </Stack>
  );
}
