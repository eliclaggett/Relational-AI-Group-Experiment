/*
 * Filename: Recaptcha.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS file is reCAPTCHA step of the experiment's onboarding process.
 */

// Imports
import React, { useEffect } from "react";
import { Container, Typography, Stack } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { usePlayer } from "@empirica/core/player/classic/react";

export default function Recaptcha({ next }) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionIdFromURL = urlParams.get("SESSION_ID");
  const studyIdFromURL = urlParams.get("STUDY_ID");

  const player = usePlayer();

  const gameParams = player.get("gameParams");
  const reCaptchaSiteKey =
    window.location.hostname == "localhost"
      ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      : "6LcJ3hknAAAAANlF8Wp0Uh9RLrsyDSTjZyehZdrM";

  // Logic to handle interactions with this page
  function onChange(value) {
    player.set("submitRecaptcha", { data: value });
  }

  // Logic to move to next step or stop the experiment
  if (player.get("passedRecaptcha") === true) {
    next();
  }

  useEffect(() => {
    if (sessionIdFromURL) {
      player.set("sessionID", sessionIdFromURL);
    }
    if (sessionIdFromURL) {
      player.set("studyID", studyIdFromURL);
    }

    window.scrollTo(0, 0);
  }, []);

  // UI
  return (
    <Container maxWidth="100vw" sx={{ height: "100%" }}>
      <Stack
        sx={{
          maxWidth: {
            md: "100%",
          },
          mx: "auto",
          textAlign: "center",
          height: "100%",
        }}
        gap={1}
      >
        <img src="assets/landing_page_2.svg" id="headerImg_recaptcha" />
        <div id="landing_container">
          <div id="landing_content">
            <Typography variant="h1" sx={{ fontSize: "2.5rem" }}>
              Welcome to the
              <br />
              CMU Group Dynamics Study
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: "1em", mt: "1em", color: "rgba(0,0,0,0.3)" }}
            >
              Version:&nbsp;
              {gameParams?.version
                ? gameParams.version
                : new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
            </Typography>
            <Typography variant="body1" sx={{ mb: "1em", fontSize: "1em" }}>
              <b>Complete the CAPTCHA below to get started.</b>
            </Typography>
            <ReCAPTCHA
              sitekey={reCaptchaSiteKey}
              onChange={onChange}
              id="recaptcha_dialog"
            />
          </div>
        </div>
      </Stack>
    </Container>
  );
}
