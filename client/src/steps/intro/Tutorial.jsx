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
  const correctAnswers = { 1: 1, 2: 3, 4: 1 }; //5: 1,
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
    [3, "To chat with others and develop mutual understanding"],
  ];
  const q4Answers = [
    [1, "True"],
    [2, "False"],
  ];
  // const q5Answers = [
  //   [1, formatMoney(gameParams.maxBonus)],
  //   [2, formatMoney(gameParams.bonusPerParticipant)],
  //   [3, "$0.00"],
  // ];

  const [q2RadioButtons, setQ2RadioButtons] = useState([]);
  const [q4RadioButtons, setQ4RadioButtons] = useState([]);

  useEffect(() => {
    const tmpQ2RadioButtons = [];
    const tmpQ4RadioButtons = [];
    const tmpQ5RadioButtons = [];

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

    shuffleArray(q4Answers);
    for (const q of q4Answers) {
      tmpQ4RadioButtons.push(
        <FormControlLabel
          value={q[0]}
          control={<Radio />}
          label={q[1]}
          key={"q2-" + q[0]}
        />
      );
    }

    // shuffleArray(q5Answers);
    // for (const q of q5Answers) {
    //   tmpQ5RadioButtons.push(
    //     <FormControlLabel
    //       value={q[0]}
    //       control={<Radio />}
    //       label={q[1]}
    //       key={"q2-" + q[0]}
    //     />
    //   );
    // }

    setQ2RadioButtons(tmpQ2RadioButtons);
    setQ4RadioButtons(tmpQ4RadioButtons);
    // setQ5RadioButtons(tmpQ5RadioButtons);

    window.scrollTo(0, 0);
  }, []);

  // Logic to handle interactions with this page
  const [radioButtonVals, setRadioButtonVals] = useState({
    q1: "1",
    q2: "",
    q4: "",
    q5: "",
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
    if (step == 5 && !passedTutorialMessage) {
      setNextButtonDisabled(true);
    } else if (step == 5 && passedTutorialMessage) {
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
      !(step == 1 || step == 2 || step == 4) ||
      radioButtonVals["q" + step] == correctAnswers[step]
    ) {
      if (step == 8) {
        // Mark that the tutorial was finished
        player.set("passedTutorial", true);
        next();
      } else {
        setStep(step + 1);
        setBackButtonDisabled(false);
      }
    } else {
      setErrorDisplay("");
      if (step == 5) {
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
        <img src="assets/overview.png" style={{ width: "40%", margin: "0 auto", display: "block" }} />
        <Typography variant="body1">
          This study has three parts. The entire
          study will take {gameParams.studyTime} minutes to complete. You will
          have an opportunity to earn extra money based on your performance.
        </Typography>
        <FormControl sx={{ pt: 4 }}>
          <FormLabel>What is your objective in this study?</FormLabel>
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
        <Typography variant="h1">Tutorial</Typography>
        <Typography variant="h1">Step 1: Survey</Typography>
        <img src="assets/step_1.svg" style={{ height: "12em" }}/>
        <Typography variant="body1">
          First, you will complete a brief survey of your opinions.
        </Typography>

        {/* After you finish, you will be placed in a waiting room for a maximum of {gameParams.maxWaitTime} minutes. While you are
          waiting, you can pick out a unique name and icon to represent yourself
          in the group chat. */}

        <Typography variant="h3">
          Now, let's practice! Here is an example question: Do you like ice cream?
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
        <Typography variant="h1">Tutorial</Typography>
        <Typography variant="h1">Step 2: Group Discussion</Typography>
        <img src="assets/step_2.png" style={{ width: "50%", margin: "0 auto", display: "block" }} />
        <Typography variant="body1">
          After all participants join in, you will be placed in a chat room with other participants and a
          chatbot moderator. There will be three rounds of conversation. In between two round, you will be given a transition window to view other rooms.
          Remember that you must view other rooms, but it is not mandatory to change room if you do not wish to.
           
          <br />
        </Typography>
        <FormControl sx={{ pt: 4 }}>
          <FormLabel>Is the statement True or False: 'You must check other rooms, but it is not mandatory to join a different group if I do not wish to.'</FormLabel>
          <RadioGroup
            name="q4"
            onChange={handleRadioButtonChange}
            value={radioButtonVals["q4"]}
          >
            {q4RadioButtons}
          </RadioGroup>
        </FormControl>
      </Stack>
    );
  }
  else if (step == 5) {
    const tutorialTask = player.get("tutorialTask") || 1;
    const tasks = [
      {
        id: 1,
        text: "Send a message that says: 'Hello!' in #tutorial-room",
        completed: tutorialTask > 1
      },
      ...(gameParams.condition !== "control" ? [{
        id: 2,
        text: "Accept the AI suggestion by clicking on the green box",
        completed: tutorialTask > 2
      }] : []),
      {
        id: 3,
        text: "Join a different group by clicking 'Join' on another room",
        completed: tutorialTask > 3
      },
      {
        id: 4,
        text: "Create a new group by clicking 'Create new room'",
        completed: tutorialTask > 4
      }
    ];

    tutorialStepUI = (
      <Stack gap={3}>
        <Typography variant="h1">Tutorial</Typography>
        <Typography variant="h1">Step 2: Group Discussion</Typography>
        <img src="assets/step_2.svg" style={{ height: "12em" }}/>
        <Typography variant="body1">
          Now, let's have a small practice session! Complete each of the following tasks to proceed.
          <br />
        </Typography>
        <Stack gap={2}>
          {tasks.map((task) => (
            <Typography
              key={task.id}
              variant="body1"
              sx={{
                color: task.completed ? "success.main" : task.id === tutorialTask ? "primary.main" : "text.secondary",
                fontWeight: task.id === tutorialTask ? "bold" : "normal"
              }}
            >
              {task.id}. {task.text}
            </Typography>
          ))}
        </Stack>
        <Alert
          variant="standard"
          severity="success"
          sx={{ display: passedTutorialMessage ? "flex" : "none" }}
        >
          Great job! You've completed all the tutorial tasks. You may now proceed to the next step.
        </Alert>
        {/* <Container
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
            Messages in the chat room you're currently viewing are shown in the middle.
          </Container>
          <Container className="chatWindowRight">
            The members of the chat room you're currently viewing are listed on
            the right panel.
          </Container>
        </Container> */}
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
        <ChatRoom/>
        </Container>
      </Stack>
    );
  } else if (step == 6) {
    tutorialStepUI = (
      <Stack gap={3}>
        <Typography variant="h1">Tutorial</Typography>
        <Typography variant="h1">Step 3: Summary Task</Typography>
        <img src="assets/step_3.svg" style={{ height: "12em" }}/>
        <Typography variant="body1">
        At the end of the final round, your chat task will conclude, and you will be asked to write a brief summary
        of the discussion. This summary should reflect the contributions and perspectives of all members in your <b>final chatroom.</b>
        </Typography>
        <Typography variant="body1">
        To qualify, your report must be <b>100–150 words</b> and accurately capture the key viewpoints shared during the discussion,
        including your own.
        </Typography>
        <img src="assets/tutorial_tip-summary2.png" style={{ width: "65%", margin: "0 auto", display: "block" }} />

        <Typography variant="body1">
        Your bonus depends on both your own report quality and the report quality of your chatroom members. Specifically:
          <b>
          Your bonus = $1 × (number of qualified reports from the room) − $0.50 × (number of members in the room)
          </b>
        </Typography>
        <Typography variant="body1">
        If this results in a bonus of $0.00 or less, you will receive only the base pay for participating.
        </Typography>
        <Typography variant="body1">
        To maximize your bonus:
        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: '1.2em' }}>
          <li>Choose a room with members you trust to submit thoughtful, qualified reports.</li>
          <li>A larger room gives you a chance to earn more, but it also comes with a higher risk of earning less.</li>
          <li>You don’t need to agree with others. What matters is mutual effort and good-faith participation.</li>
        </ul>
        </Typography>
        {/* <FormControl sx={{}}>
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
        </FormControl> */}
      </Stack>
    );
  } else if (step == 7) {
    tutorialStepUI = (
      <Stack gap={3} alignItems={"baseline"} id="tutorialTips">
        <Typography variant="h1">Tips for Success</Typography>
        <Typography variant="body1">
        Want to maximize your bonus and enjoy the task? Try these suggestions:
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
          <Typography variant="h3">
            1. Find your group
          </Typography>
          <Typography variant="body1">
            Your bonus depends on both your summary and your chatmates' in the last round. Feel free to switch rooms to find a team you trust and work well with.
          </Typography>
          <img src="assets/tutorial_tip-last.svg" style={{ height: "8em" }}/>
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
          <Typography variant="h3">2. Go solo if needed</Typography>
          <Typography variant="body1">
            Can't find a good group? You can start a room with just you and a chatbot. Submit your report to get a guaranteed {formatMoney(gameParams.bonusPerParticipant)} bonus.
          </Typography>
          <img src="assets/tutorial_tip-alone.svg" style={{ height: "8em" }} />
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
          <Typography variant="h3">
            3. Stay active and respectful
          </Typography>

          <Typography variant="body1">
            Inactive users will get a warning and may be removed. Inappropriate language will result in removal and a report to Prolific.
          </Typography>
          <img src="assets/tips-group.svg" style={{ height: "8em" }} />
        </Paper>
      </Stack>
    );
  } else if (step == 8) {
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
