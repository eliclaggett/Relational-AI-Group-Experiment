/*
 * Filename: Tutorial.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file is the main tutorial of the experimental procedure.
 */

// Imports
import * as React from "react";
import {
  Alert,
  Button,
  Box,
  Container,
  FormControl,
  FormLabel,
  Typography,
  Stack,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { usePlayer } from "@empirica/core/player/classic/react";
import { useState, useEffect } from "react";
import { formatMoney } from "../../utils/formatting.js";
// import ProgressList from "../components/ProgressList";
import ProgressList from "../../components/ProgressList.jsx";
import ChatRoom from "../../components/ChatRoom.jsx";
import LikertQuestion from "../../components/LikertQuestion.jsx";

export default function Tutorial({ next }) {
  const player = usePlayer();
  const gameParams = player.get("gameParams");
  const remainingErrors = player.get("remainingErrors") || 0;
  if (!gameParams) window.location.reload();
  const correctAnswers = { 1: 1, 2: 1, 5: 1, 6: 1 };
  const [step, setStep] = useState(1);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [backButtonDisabled, setBackButtonDisabled] = useState(true);
  const [errorDisplay, setErrorDisplay] = useState("none");
  const passedTutorialMessage = player.get("passedTutorialMessage") || false;
  const [exampleSurveyVal, setExampleSurveyVal] = useState("");

  function shuffleArray(array) {
    // Reference: https://stackoverflow.com/questions/2450954
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const q2Answers = [
    [1, "To evaluate how productive groups form online"],
    [2, "To take a survey of my opinions"],
    [3, "To discuss news topics with others"],
  ];
  const q5Answers = [
    [1, formatMoney(gameParams.maxBonus)],
    [2, formatMoney(gameParams.bonusPerParticipant)],
    [3, "$0.00"],
  ];

  const q6Answers = [
    [1, "The last room you join"],
    [2, "The first room you join"],
    [3, "The room you spend the most time in"],
  ];

  const [q2RadioButtons, setQ2RadioButtons] = useState([]);
  const [q5RadioButtons, setQ5RadioButtons] = useState([]);
  const [q6RadioButtons, setQ6RadioButtons] = useState([]);

  useEffect(() => {
    const tmpQ2RadioButtons = [];
    const tmpQ5RadioButtons = [];
    const tmpQ6RadioButtons = [];

    shuffleArray(q2Answers);
    for (const q of q2Answers) {
      tmpQ2RadioButtons.push(
        <FormControlLabel
          value={q[0]}
          control={<Radio />}
          label={q[1]}
          key={"q2-" + q[0]}
        />
      );
    }

    shuffleArray(q5Answers);
    for (const q of q5Answers) {
      tmpQ5RadioButtons.push(
        <FormControlLabel
          value={q[0]}
          control={<Radio />}
          label={q[1]}
          key={"q2-" + q[0]}
        />
      );
    }

    shuffleArray(q6Answers);
    for (const q of q6Answers) {
      tmpQ6RadioButtons.push(
        <FormControlLabel
          value={q[0]}
          control={<Radio />}
          label={q[1]}
          key={"q2-" + q[0]}
        />
      );
    }

    setQ2RadioButtons(tmpQ2RadioButtons);
    setQ5RadioButtons(tmpQ5RadioButtons);
    setQ6RadioButtons(tmpQ6RadioButtons);

    window.scrollTo(0, 0);
  }, []);

  // Logic to handle interactions with this page
  const [radioButtonVals, setRadioButtonVals] = useState({
    q1: "1",
    q2: "",
    q5: "",
    q6: "",
  });

  const handleRadioButtonChange = (evt) => {
    setRadioButtonVals((radioButtonVals) => ({
      ...radioButtonVals,
      [evt.target.name]: evt.target.value,
    }));
    setNextButtonDisabled(false);
  };

  function handleBack() {
    if (step == 2) {
      setBackButtonDisabled(true);
    }

    if (step > 1) {
      setNextButtonDisabled(false);
      setStep(step - 1);
    }
  }

  useEffect(() => {
    document.querySelector("h1").scrollIntoView();
    if (step == 4 && !passedTutorialMessage) {
      setNextButtonDisabled(true);
    } else if (step == 4 && passedTutorialMessage) {
      setNextButtonDisabled(false);
    }
    if (step == 3) {
      if (exampleSurveyVal === "") {
        setNextButtonDisabled(true);
      } else {
        setNextButtonDisabled(false);
      }
    }
  }, [passedTutorialMessage, step, exampleSurveyVal]);

  function handleNext() {
    setErrorDisplay("none");

    if (
      !(step == 1 || step == 2 || step == 5 || step == 6) ||
      radioButtonVals["q" + step] == correctAnswers[step]
    ) {
      if (step == 7) {
        // Mark that the tutorial was finished
        player.set("passedTutorial", true);
        next();
      } else {
        setStep(step + 1);
        setBackButtonDisabled(false);
      }
    } else {
      setErrorDisplay("");
      if (step == 4) {
        Q6("none");
      }
      // setNextButtonDisabled(true);
      if (remainingErrors <= 1) {
        player.set("ended", "failedTutorial");
        player.set("endReason", "failedTutorial");
        player.set("step", "end");
      }
      player.set("remainingErrors", remainingErrors - 1);
      return;
    }
  }

  // Logic to move to next step or stop the experiment
  const passedTutorial = player.get("passedTutorial");
  if (passedTutorial === true) {
    next();
  }

  // Custom UI Elements
  const [warningDisplay, setWarningDisplay] = useState("none");

  // Step 1
  let tutorialStepUI = (
    <Stack gap={3}>
      <Typography variant="h1">Tutorial</Typography>
      <p>
        As you read through this short tutorial, please answer the three
        comprehension questions that look like this:
      </p>
      <FormControl>
        <FormLabel>
          Do you need to answer comprehension questions about this tutorial?
        </FormLabel>
        <RadioGroup
          name="q1"
          onChange={handleRadioButtonChange}
          defaultValue="1"
        >
          <FormControlLabel value="1" control={<Radio />} label="Yes" />
          <FormControlLabel value="2" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>
      <p>
        We only use these questions to ensure you understand the study details.
      </p>
    </Stack>
  );
  if (step == 2) {   
    tutorialStepUI = (
      <Stack gap={3}>
        <Typography variant="h1" sx={{}}></Typography>
        <img src="assets/overview.png" style={{ width: "80%", aspectRatio: "3", margin: "0 auto", display: "block" }} />
        {/* <Typography variant="h2" sx={{}}>
          Steps
        </Typography> */}
        <img src="assets/tutorial_study-steps.svg" style={{ height: "12em" }} />
        
        <Typography variant="body1">
          This study has three parts. Each part has a set timer, and the entire
          study will take {gameParams.studyTime} minutes to complete. You will
          have an opportunity to earn extra money based on your performance. The rest of this tutorial will guide you through each step of the study.
        </Typography>
        <FormControl sx={{ pt: 4 }}>
          <FormLabel>What is the purpose of this study?</FormLabel>
          <RadioGroup
            name="q2"
            onChange={handleRadioButtonChange}
            value={radioButtonVals["q2"]}
          >
            {q2RadioButtons}
          </RadioGroup>
        </FormControl>
      </Stack>
    );
  } else if (step == 3) {
    tutorialStepUI = (
      <Stack gap={3}>
        <Typography variant="h1">Step 1 Tutorial: Survey</Typography>
        <Typography variant="body1">
          First, you will complete a brief survey of your opinions.
        </Typography>

        {/* After you finish, you will be placed in a waiting room for a maximum of {gameParams.maxWaitTime} minutes. While you are
          waiting, you can pick out a unique name and icon to represent yourself
          in the group chat. */}

        <Typography variant="h3">
          Now, let's practice! Here is an example question:
        </Typography>
        <LikertQuestion
          value={exampleSurveyVal}
          onChange={(ev) => {
            setExampleSurveyVal(ev.target.value);
          }}
        />
        {/* <Typography variant="body1">
          We will assign discussion topics based on the survey results of all
          participants so that some participants agree and others disagree about
          the topic. At the start of the discussion task, participants will be
          randomly assigned to a chat room with other participants.
        </Typography> */}
      </Stack>
    );
  } else if (step == 4) {
    tutorialStepUI = (
      <Stack gap={3}>
        <Typography variant="h1">Step 2 Tutorial: Group Discussion</Typography>
        <Typography variant="body1">
          After all participants join in, you will be placed in a chat room with other participants and a
          chatbot moderator. Multiple rooms will be created by default and you
          can move about them freely.
          <br />
          <br />
          By clicking "Join" at the top of the chat window, you can join a room.
          <br />
        </Typography>
        <Container
          className="chatWindow-sm"
          sx={{
            transform: {
              xs: "scale(0.7)",
              md: "scale(1)",
            },
            width: {
              xs: "142%",
              md: "100%",
            },
            marginLeft: {
              xs: "-21% !important",
              md: "0 !important",
            },
            marginBottom: {
              xs: "-3.8em !important",
              md: "0 !important",
            },
            maxWidth: {
              md: "none",
            },
          }}
        >
          <Container className="chatWindowLeft">
            Chat rooms are listed on the left panel.
          </Container>
          <Container
            className="chatWindowCenter"
            sx={{
              height: "100%",
              width: {
                xs: "50%",
                md: "50%",
                lg: "40em",
              },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: "orange",
            }}
          >
            Messages in the chat room you're currently viewing (#tutorial-room)
            are shown in the middle.
          </Container>
          <Container className="chatWindowRight">
            The members of the chat room you're currently viewing are listed on
            the right panel.
          </Container>
        </Container>
        <Container
          id="chatWindow-sm"
          sx={{
            transform: {
              xs: "scale(0.7)",
              md: "scale(1)",
            },
            width: {
              xs: "142%",
              md: "100%",
            },
            marginLeft: {
              xs: "-21% !important",
              md: "0 !important",
            },
            maxWidth: {
              md: "none",
            },
            borderRadius: "1em",
            overflow: "hidden",
            boxShadow: "1px 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          <ChatRoom />
        </Container>
        <b style={{ display: !passedTutorialMessage ? "block" : "none" }}>
          Join the #tutorial-room and send a message that says: "Hello!"
        </b>
        <Alert
          variant="standard"
          severity="success"
          sx={{ display: passedTutorialMessage ? "flex" : "none" }}
        >
          Great job! We received your message. You may now proceed to the next
          step.
        </Alert>
      </Stack>
    );
  } else if (step == 5) {
    tutorialStepUI = (
      <Stack gap={3}>
        <Typography variant="h1">Step 3 Tutorial: Summary Task</Typography>
        <Typography variant="body1">
          After the timer elapses you will be asked to summarize the contents of
          your discussion, including the contributions of all other members of
          your room. Your bonus will be calculated as follows:
        </Typography>

        <img src="assets/tutorial_bonus.svg" style={{ height: "15em" }} />

        <Typography variant="body1">
          {/* Note that joining a chat room with many members has the highest
          potential bonus payment, but also carries risk if all members do not
          perform equally well.  */}
          If your bonus is calculated to be $0.00 or
          lower, we will provide only the base pay for this study.
          <br />
          <br />
          Regardless of the result of the calculation above,{" "}
          <b>
            the maximum bonus you can receive is{" "}
            {formatMoney(gameParams.maxBonus)}.
          </b>
        </Typography>
        <FormControl sx={{}}>
          <FormLabel>
            How high could your bonus reach if you are in a chat room with five
            members (including yourself)?
          </FormLabel>
          <RadioGroup
            name="q5"
            onChange={handleRadioButtonChange}
            value={radioButtonVals["q5"]}
          >
            {q5RadioButtons}
          </RadioGroup>
        </FormControl>
      </Stack>
    );
  } else if (step == 6) {
    tutorialStepUI = (
      <Stack gap={3} alignItems={"baseline"} id="tutorialTips">
        <Typography variant="h1">Strategy and Tips</Typography>
        <Typography variant="body1">
          You can move between chat rooms freely during the group discussion
          task of this study. Here are some tips to guide your choices:
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "baseline",
            gap: "1em",
          }}
        >
          <img
            src="assets/tutorial_tip-big-room.svg"
            style={{ height: "8em" }}
          />
          <Typography variant="h3">
            1. Bigger rooms are (sometimes) better
          </Typography>
          <Typography variant="body1">
            To get the highest reward for completing this study, it pays to join
            a bigger room. However, your bonus is also determined by the quality
            of the summary produced by the other members of your room.
          </Typography>
          
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "baseline",
            gap: "1em",
          }}
        >
          <img src="assets/tutorial_tip-alone.svg" style={{ height: "8em" }} />
          <Typography variant="h3">2. You can be alone</Typography>
          <Typography variant="body1">
            You may create a chat room with just you and a chatbot moderator,
            with a guaranteed bonus of
            {formatMoney(gameParams.bonusPerParticipant)} if you effectively
            summarize your discussion with the bot.
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "baseline",
            gap: "1em",
          }}
        >
          <img src="assets/tutorial_tip-last.svg" style={{ height: "8em" }} />
          <Typography variant="h3">
            3. Remember the last room you join
          </Typography>

          <Typography variant="body1">
            Your summary and bonus will be calculated based on the last chat room you join.
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "baseline",
            gap: "1em",
          }}
        >
          <img
            src="assets/tutorial_tip-summary2.svg"
            style={{ width: "100%" }}
          />
          <Typography variant="h3">
            4. Most importantly, write a good summary
          </Typography>
          <Typography variant="body1">
            To earn maximized bonus, please take care to thoroughly summarize the discussion of the last chat room
            you join. We expect summaries to be about 100 &ndash;150 words in
            length and to reiterate the viewpoints of all of the participants in
            the room.
          </Typography>
        </Paper>
        <FormControl sx={{ pt: 4 }}>
          <FormLabel>
            Which chat room will you be considered a member of when your summary
            is evaluated?
          </FormLabel>
          <RadioGroup
            name="q6"
            onChange={handleRadioButtonChange}
            value={radioButtonVals["q6"]}
          >
            {q6RadioButtons}
          </RadioGroup>
        </FormControl>
      </Stack>
    );
  } else if (step == 7) {
    tutorialStepUI = (
      <Stack gap={3} alignItems={"center"}>
        <Typography variant="h1">Congratulations!</Typography>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          You have completed the tutorial! Now, you will proceed to the first step of the game -- the survey.
        </Typography>
      </Stack>
    );
  }

  // UI
  return (
    <Stack maxWidth="100vw" direction="column">
      <ProgressList
        items={[
          { name: "Tutorial", time: "~3 min" },
          // { name: "Questionnaire", time: "~1 min" },
        ]}
        active={0}
        beforeStart={true}
      />

      <Stack
        sx={{
          width: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
          mx: "auto",
          mb: "2rem",
          py: 2,
        }}
        gap={1}
      >
        {tutorialStepUI}
        <Alert
          variant="outlined"
          severity="error"
          sx={{ display: errorDisplay }}
        >
          Oops, that's not right. Please try again. If you make{" "}
          {remainingErrors} more errors, we must ask you to return this study.
        </Alert>
        <Box
          sx={{
            display: "flex",
            // justifyContent: "center",
            width: "100%",
            flexDirection: "row",
          }}
        >
          <Button
            sx={{ my: 2, mr: 1 }}
            onClick={handleBack}
            disabled={backButtonDisabled}
            variant="contained"
          >
            Back
          </Button>
          <Button
            sx={{ my: 2, mr: 1 }}
            onClick={handleNext}
            disabled={nextButtonDisabled}
            variant="contained"
          >
            Next
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
}
