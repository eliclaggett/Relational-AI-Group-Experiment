/*
 * Filename: NoGame.jsx
 * Author: Faria Huq
 *
 * Description:
 * This ReactJS file displays a message to the participant when they are not assigned to a game.
 */

// Imports
import React, { useEffect } from "react";
import { Stack, Typography, Alert, Button } from "@mui/material";
import { usePlayer } from "@empirica/core/player/classic/react";

export default function NoGame() {
  const player = usePlayer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function reloadPage() {
    window.location.reload();
  }

  return (
    <Stack alignItems={"center"} justifyContent={"center"} sx={{ height: "100vh" }}>
      <Stack
        sx={{
          width: {
            xs: "40rem",
            md: "50rem",
            lg: "70rem",
          },
          textAlign: "center",
        }}
        gap={6}
      >
        <Typography variant="h1">No Game Available</Typography>

        <Typography variant="h4">
          You are currently not assigned to a game. This could happen if the study is full,
          has ended, or if your connection was interrupted.
        </Typography>

        <Alert severity="info">
          You may now close this window or return to the study platform. If you believe this is an error, try reloading below.
        </Alert>

        <Button variant="contained" onClick={reloadPage}>
          Try Reloading
        </Button>
      </Stack>
    </Stack>
  );
}
