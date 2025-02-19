/*
 * Filename: LikertButton.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps a radio button in a larger button for easier selection.
 */

// Imports
import React from "react";
import { Paper, Radio, Typography } from "@mui/material";

export default function LikertButton({
  value = "",
  label = "",
  disabled = false,
}) {
  return (
    <Paper
      component="label"
      variant="soft"
      sx={{
        p: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "sm",
        borderRadius: "md",
        flex: "1",
        mx: "0.25rem",
        textAlign: "center",
        cursor: 'pointer',
        boxShadow: '1px 2px 4px rgba(0,0,0,0.15)',
        ":hover": {
            boxShadow: '1px 2px 8px rgba(0,0,0,0.3)'
        }
      }}
    >
      <Typography level="body-sm" sx={{ mt: 1 }}>
        {label}
      </Typography>
      <Radio disabled={disabled} sx={{my: 1}} value={value}/>
    </Paper>
  );
}
