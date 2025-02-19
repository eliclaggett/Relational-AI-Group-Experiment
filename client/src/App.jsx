import { EmpiricaClassic } from "@empirica/core/player/classic";
import { EmpiricaContext } from "@empirica/core/player/classic/react";
import { EmpiricaMenu, EmpiricaParticipant } from "@empirica/core/player/react";
import React from "react";
import { Game } from "./Game";
import IdentitySelect from "./steps/IdentitySelect.jsx";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import Join from "./steps/intro/Join.jsx";
import Recaptcha from "./steps/intro/Recaptcha.jsx";
import Consent from "./steps/intro/Consent.jsx";
import Lobby from "./steps/intro/Lobby.jsx";
import Tutorial from "./steps/intro/Tutorial.jsx";
import Survey from "./steps/intro/Survey.jsx";
import './styleOverrides.scss';
import End from "./steps/exit/End.jsx";

const theme = createTheme({
  palette: {
    primary: {main: '#e663bd'}
  },
  typography: {
    fontFamily: 'Noto Sans, Arial',
    h1: {
      fontSize: '2rem'
    },
    h2: {
      fontSize: '1.5rem'
    },
    h3: {
      fontSize: '1.25rem'
    },
    h4: {
      fontSize: '1.1rem'
    }
  },
  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'black',
          fontWeight: 'bold'
        }
      }
    }
  }
});

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerKey = urlParams.get("participantKey") || "";

  const { protocol, host } = window.location;
  const url = `${protocol}//${host}/query`;

  function introSteps({ game, player }) {
    return [
      Recaptcha,
      Consent,
      Tutorial,
      Survey];
  }

  function exitSteps({ game, player }) {
    return [End];
  }

  return (
    <EmpiricaParticipant url={url} ns={playerKey} modeFunc={EmpiricaClassic}>
      <div className="h-screen relative">
        <EmpiricaMenu position="bottom-left" />
        <div className="h-full overflow-auto">
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <EmpiricaContext introSteps={introSteps} exitSteps={exitSteps} lobby={Lobby} playerCreate={Join}>
              <Game />
            </EmpiricaContext>
          </ThemeProvider>
        </div>
      </div>
    </EmpiricaParticipant>
  );
}
