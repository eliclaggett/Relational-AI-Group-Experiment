/*
 * Filename: Consent.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file is consent form displayed during the experiment's onboarding process.
 */

// Imports
import React, { useEffect } from "react";
import {
  Alert,
  Button,
  Container,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
  Stack,
  Paper,
  FormControlLabel,
} from "@mui/material";
import { usePlayer } from "@empirica/core/player/classic/react";
import { useState } from "react";
import { formatMoney } from "../../utils/formatting";

export default function Consent({ next }) {
  const player = usePlayer();
  const gameParams = player.get("gameParams");
  if (!gameParams) window.location.reload();
  const passedConsentForm = player.get("passedConsentForm");
  // Logic to handle interactions with this page
  const [radioButtonVals, setRadioButtonVals] = useState({});
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRadioButtonChange = (evt) => {
    setRadioButtonVals((radioButtonVals) => ({
      ...radioButtonVals,
      [evt.target.name]: evt.target.value,
    }));
  };

  function handleButtonClick() {
    player.set("submitConsentForm", radioButtonVals);
  }

  // Logic to move to next step or stop the experiment
  let nonconsentForm = "";

  if (passedConsentForm === false) {
    nonconsentForm = (
      <Alert severity="error" variant="standard">
        We cannot continue without your consent. Please cancel your
        participation in this study if these terms cannot be met.
      </Alert>
    );
  }

  const consentQuestions = [];
  for (const q in gameParams.consentQuestions) {
    consentQuestions.push(
      <FormControl key={q}>
        <FormLabel>{gameParams.consentQuestions[q]}</FormLabel>
        <RadioGroup name={q} onChange={handleRadioButtonChange}>
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>
    );
  }

  useEffect(() => {
    setButtonDisabled(false);
    for (const q in gameParams.consentQuestions) {
      if (!(q in radioButtonVals && radioButtonVals[q] == "yes")) {
        setButtonDisabled(true);
      }
    }
  }, [radioButtonVals]);

  useEffect(() => {
    if (passedConsentForm) {
      next();
    }
  }, [passedConsentForm]);

  // UI
  return (
    <Container maxWidth="100vw">
      <Stack
        sx={{
          maxWidth: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
          mx: "auto",
          mt: "10vh",
          py: 2,
        }}
        gap={1}
      >
        <Typography variant="h1">Consent Form STUDY2025_00000074</Typography>
        <strong>
          Please read the following information. After you give your consent,
          you can proceed to the study.
        </strong>
        <Paper
          variant="outlined"
          sx={{
            maxHeight: "10em",
            overflow: "scroll",
            p: 4,
            my: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <p>
          This game is part of a research study conducted by Carnegie Mellon University and is funded by the National Science Foundation and the NOMIS Foundation.
          </p>
          <strong>Summary</strong>
          <p>
            You will be asked to work on this task with other players. You will be expected to communicate with a group of people regarding assessments on real-world topics. During this communication, you may receive AI-generated message suggestions. However, if you might find the process uncomfortable, you may choose not to participate. Your responses are anonymous, and while there is minimal risk involved, participation is entirely voluntary.
          </p>
          <strong>Purpose</strong>
          <p>
            The purpose of the research is to examine how people communicate and
            cooperate with others.
          </p>
          <strong>Procedures</strong>
          <p>
            Once you consent, you will receive a tutorial tailored to the study’s tasks, followed by a comprehension assessment covering the payment structure and task instructions. If you do not pass the comprehension test twice, you are disqualified from the study and will not have an opportunity to rejoin. After the tutorial, you will proceed to answer individual survey items and enter a waiting period while additional participants join. A countdown timer will display the remaining waiting time. 
          </p>
          <p>
            Once the waiting period elapses, group assignments will be determined. If the number of qualified subjects exceeds the required number, surplus subjects will be randomly selected to receive the base payment and exit the study.  If the number of qualified subjects is insufficient, all waiting subjects will receive the base pay, and the task will not proceed.
          </p>
          <p>
            You will be assigned to 2-3 subgroups, each discussing a given topic. You may stay in their assigned subgroup, switch to another subgroup, or create a new group if you prefer. This phase will last 15-20 minutes. After the communication period ends, you will be asked to summarize the conversation of their final subgroup. You will then complete a post-task survey, assessing their behavior, experiences, and perceptions during the task, as well as providing sociodemographic information.
          </p>
          <p>
            The total task time will be about 30 minutes. Regardless of the reasons, your non-participation in the actual game will not result in a negative rating on Prolific.
          </p>
          <strong>Participant requirements</strong>
          <p>
            Participation in this study is limited to individuals aged 18 and older. Only those located in the US at the time of their participation are allowed to participate in this study.
          </p>
          <strong>Risks</strong>
          <p>
            We prohibit participants from sending unkind or inappropriate messages during this task. When you send such messages, we will report your violation to Prolific. Although we conduct a careful screening process, you might receive unkind or inappropriate messages from another participant. 
          </p>
          <p>
            Participants may face a risk of confidentiality breach through their Prolific IDs. Since these IDs are universal over all tasks on the platform, combining the data collected through this study with other Prolific tasks via their IDs may lead to the identification of participants' information. If participants share private, sensitive or identifiable information about themselves or others, there is a risk that it may be disclosed outside the research setting.
          </p>
          <strong>Payment Confidentiality</strong>
          <p>
            Payment methods, especially those facilitated by third-party vendors (such as Venmo, Amazon, PayPal, Prolific), may require that the researchers and/or the vendor collect and use personal information (such as your first and last name, email addresses, phone numbers, banking information) provided by you in order for your payment to be processed. As with any payment transaction, there is the risk of a breach of confidentiality from the third-party vendor. All personal information collected by the researcher will be held as strictly confidential and stored in a password-protected digital file, or in a locked file cabinet, until payments are processed and reconciled. This information will be destroyed at the earliest acceptable time. Personal information held by the third-party vendor will be held according to their terms of use policy.
          </p>
          <strong>Benefits</strong>
          <p>
            You may learn about how to communicate and group with others. Also, the knowledge received may be useful to others and to the scientific community by clarifying how people communicate and group with each other.  
          </p>
          <strong>Compensation & Costs</strong>
          <p>
            You will be compensated the base pay of {" "}
            {formatMoney(gameParams.basePay)} for beginning the study and completing the initial tutorial section. If you are deemed eligible to participate in the actual game (by answering the tutorial questions correctly), and you complete the game, you will also receive a completion pay of {" "}
            {formatMoney(gameParams.maxBonus)}.
          </p>
          <p>
            You will also have an opportunity to earn an additional bonus based on your and others’ task performance. The bonus is calculated as follows: Bonus = {formatMoney(gameParams.bonus + gameParams.maxBonusShare * 2)}.
          </p>
          <p>There will be no cost to you if you participate in this study.</p>
          <strong>Confidentiality</strong>
          <p>
            The data captured for the research does not include any personally identifiable information about you. The sponsor of this research, the National Science Foundation, may have access to the research record. The study will utilize Prolific to conduct this research.  Prolific and its services are not owned or operated by CMU. CMU is not collecting any identifiable information. However, the study is being done through the Prolific platform. CMU will be receiving coded data from Prolific (coded with the individual's Prolific ID). Prolific is not giving CMU the code that would allow CMU to identify the participants. Prolific generally collects certain identifiable information from Prolific users under Prolific's terms and conditions. However, CMU does not control Prolific's collection or use of information from Prolific users, and CMU does not receive identifiable information from Prolific.
          </p>
          <strong>Future use of information</strong>
          <p>
            We may use the anonymous data for our future research studies, or we may distribute the data to other researchers for their research studies.  We would do this without getting additional informed consent from you (or your legally authorized representative).  Sharing of data with other researchers will only be done in such a manner that you will not be identified.
          </p>
          <strong>Right to ask questions & Contact Information</strong>
          <p>
            If you have any questions about this study, you should feel free to ask them by contacting the Principal Investigator now at Hirokazu Shirado (shirado@cmu.edu).  If you have questions later, desire additional information, or wish to withdraw your participation please contact the Principal Investigator by e-mail in accordance with the contact information listed above.  
          </p>
          <p>
            If you have questions pertaining to your rights as a research participant; or to report concerns to this study, you should contact the Office of Research integrity and Compliance at Carnegie Mellon University.  Email: irb-review@andrew.cmu.edu . Phone: 412-268-4721.
          </p>
          <strong>Voluntary participation</strong>
          <p>
            Your participation in this research is voluntary. You may refuse or discontinue participation at any time without any loss of benefits to which you are otherwise entitled. You may print a copy of this consent form for your records. 
          </p>
        </Paper>
        {consentQuestions}
        {nonconsentForm}
        <div>
          <Button
            sx={{ my: 2 }}
            onClick={handleButtonClick}
            variant="contained"
            disabled={buttonDisabled}
          >
            Continue
          </Button>
        </div>
      </Stack>
    </Container>
  );
}
