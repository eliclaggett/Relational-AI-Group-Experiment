import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import axios from "axios";
import * as fs from "fs";
import dotenv from "dotenv";
import findConfig from "find-config";
import OpenAI from "openai";
const openai = new OpenAI();
import { shuffle, calculateEntropyFromData } from "./utils.js";
import { parseAIResponse } from "./parseresponse";
export const Empirica = new ClassicListenersCollector();

let discussionMinutesElapsed = 0;

const colors = [
  "#A7C7E7",
  "#B39DDB",
  "#F2B0A2",
  "#FFB3C6",
  "#F1C6D3",
  "#C5E1A5",
  "#B3E5FC",
  "#D1C4E9",
  "#FFCCBC",
  "#D4E157",
  "#FFE082",
  "#FFEB3B",
  "#A5D6A7",
  "#81C784",
  "#AED581",
  "#C8E6C9",
  "#80DEEA",
  "#B2EBF2",
  "#FFCDD2",
  "#FF8A65",
  "#F8BBD0",
  "#D1C4E9",
  "#D0E3F4",
  "#F0E68C",
  "#C5E1A5",
  "#B3E5FC",
  "#FFCCFF",
  "#A3D9FF",
  "#F7B7A3",
  "#E0F7FA",
];
const animals = [
  "hummingbird",
  "peacock",
  "ladybug",
  "owl",
  "tetra",
  "butterfly",
  "toucan",
  "hippo",
  "lobster",
  "tortoise",
  "mammoth",
  "mountaingoat",
  "elk",
  "kangaroo",
  "lark",
  "wildebeest",
  "swan",
  "flamingo",
  "cricket",
  "redangus",
  "camel",
  "pony",
  "seagull",
  "bumblebee",
  "albatross",
  "woodpecker",
  "capybara",
  "dolphin",
  "tadpole",
  "elephant",
  "dragonfly",
  "beluga",
  "housecat",
  "salmon",
  "aracari",
  "starfish",
  "beaver",
  "crustacean",
  "rabbit",
  "antelope",
  "poodle",
  "puma",
  "seahorse",
  "horse",
  "robin",
  "dachsund",
  "duck",
  "parrot",
  "jay",
  "hedgehog",
  "snail",
  "pelican",
  "cobra",
  "finch",
  "snapper",
  "sandpiper",
  "stork",
  "tapir",
  "swallow",
  "budgie",
  "mainecoon",
  "giraffe",
  "scarab",
  "seal",
  "lamb",
  "seaturtle",
  "crab",
  "gazelle",
  "rooster",
  "duckling",
  "guppy",
  "dove",
  "emu",
  "impala",
  "stallion",
  "treefrog",
  "caterpillar",
  "cranefly",
  "goose",
  "kingfisher",
  "rainbowtrout",
  "danio",
  "squirrel",
  "mouse",
  "sparrow",
  "penguin",
  "weevil",
  "ragdoll",
  "hawk",
  "chameleon",
];
const shapes = [
  "hexagon",
  "circle",
  "triangle",
  "square",
  "diamond",
  "oval",
  "pentagon",
  "parallelogram",
  "rhombus",
  "octagon",
  "trapezoid",
  "cube",
  "sphere",
  "ellipse",
  "star",
  "crescent",
  "tetrahedron",
  "prism",
  "cone",
  "pyramid",
  "dodecagon",
  "decagon",
  "heart",
  "arrow",
  "cross",
  "zigzag",
  "spiral",
  "wave",
  "arrowhead",
  "chevron",
];

const readyPlayerList = new Set();
// shapes are also chat channels

const chatParticipants = {
  "-1": { name: "Moderator Bot", room: -1, color: "#f4f4f4", active: "" },
};

shuffle(colors);
shuffle(animals);
shuffle(shapes);

const chatRooms = {};

const initialGroupsBySampleSize = {
  6: [3, 3],
  7: [3, 4],
  8: [4, 4],
  9: [3, 3, 3],
  10: [3, 3, 4],
  11: [3, 4, 4],
  12: [4, 4, 4],
  13: [3, 3, 3, 4],
  14: [3, 3, 4, 4],
  15: [3, 4, 4, 4],
  16: [4, 4, 4, 4],
};
const targetParticipantsPerGroup = 3;

const botTexts = JSON.parse(
  fs.readFileSync(process.env["EXPERIMENT_DIR"] + "/" + "/texts.json")
);

const gameParams = {
  mode: "prod",
  condition: "relational-static", // control, personal, relational-static, relational-dynamic
  promptCategory: "pgh",
  version: "February 2025",
  completionCode: "XYZXYZ",
  minPlayersPerRoom: 3,
  maxPlayersPerRoom: 3,
  studyTime: 25,
  surveyPay: 1.5,
  discussionPay: 1.5,
  bonusPerParticipant: 1,
  maxBonus: 5,
  maxWaitTime: 5,
  inactivityMax: 150, // seconds
  inactivityWarning: 120, // seconds

  chatTime: 15,
  lobbyTime: 5,
  summaryTime: 5,
  followupDelay1: 2, // Send a followup message 2 minutes after the chat starts
  followupDelay2: 2, // Send another followup 2 minutes after the previous followup
  switchRoomDelay: 6, // Send a suggestion to switch rooms 6 minutes after the chat starts

  consentQuestions: {
    q1: "I am age 18 or older.",
    q2: "I have read and understand the information above.",
    q3: "I have reviewed the eligibility requirements listed in the Participant Requirements section of this consent form and certify that I am eligible to participate in this research, to the best of my knowledge.",
    q4: "I want to participate in this research and continue with the game.",
  },
};

gameParams.topics = botTexts[gameParams.promptCategory]["topics"];
shuffle(gameParams.topics);

let playerCounter = 0;
let roomCounter = -1;
let promptInterval = null;

if (gameParams.mode == "dev") {
  chatParticipants[90] = {
    name: "kangaroo",
    color: "skyblue",
    active: new Date().getTime(),
    room: 0,
  };

  chatParticipants[91] = {
    name: "antelope",
    color: "pink",
    active: new Date().getTime(),
    room: 1,
  };

  chatParticipants[92] = {
    name: "aracari",
    color: "orange",
    active: new Date().getTime(),
    room: 2,
  };

  chatParticipants[93] = {
    name: "beaver",
    color: "blue",
    active: new Date().getTime(),
    room: 0,
  };
}

const prompts = botTexts[gameParams.promptCategory];

// Called when a participant joins the experiment
Empirica.on("player", (ctx, { player, _ }) => {
  // Initialize the participant unless already initialized
  if (player.get("gameParams")) return;

  player.set("gameParams", gameParams);
  player.set("remainingErrors", 2);
  player.set("playerCounter", playerCounter);
  player.set("color", colors[playerCounter]);
  player.set("lastRequestID", -1);
  player.set(
    "animalOptions",
    animals.slice(playerCounter * 3, playerCounter * 3 + 3)
  );
  player.set("participantIdx", playerCounter);
  player.set("activeRoom", -1);
  player.set("joinedRooms", []);
  player.set("viewingRoom", 0);
  chatParticipants[playerCounter] = {
    name: "tutorial-user",
    room: -1,
    color: "pink",
    active: "",
  };

  playerCounter += 1;
  player.currentGame.set("chatParticipants", chatParticipants);
});

// Called when a participant submits the reCAPTCHA
Empirica.on("player", "submitRecaptcha", (_, { player, submitRecaptcha }) => {
  const data = submitRecaptcha;

  // Return if debugging
  if (data === true) {
    return;
  }

  // Run the reCAPTCHA test
  if ("data" in data && data["data"]) {
    const secret =
      process.env["DEPLOYMENT"] == "dev"
        ? "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
        : process.env["RECAPTCHA_SECRET"];
    const response = data["data"];

    axios
      .post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        }
      )
      .then((resp) => {
        // Update participant with test results
        const respData = resp.data;
        if (respData.success) {
          player.set("passedRecaptcha", true);
          Empirica.flush(); // Allows asynchronous state updates
        } else {
          player.set("passedRecaptcha", false);
        }
      });
  }
});

// Called when a participant submits the consent form
Empirica.on(
  "player",
  "submitConsentForm",
  (_, { player, submitConsentForm }) => {
    // Ensure participants consent
    const consentFormResponse = submitConsentForm;
    let passedConsentForm = true;

    for (const q in gameParams.consentQuestions) {
      if (!(q in consentFormResponse && consentFormResponse[q] == "yes")) {
        passedConsentForm = false;
      }
    }
    player.set("passedConsentForm", passedConsentForm);

    if (passedConsentForm) {
      player.set("step", "tutorial");
    }
  }
);

Empirica.on("player", "passedTutorial", (_, { player, passedTutorial }) => {
  player.set("step", "survey");
});

Empirica.on("player", "surveyAnswers", (_, { player, surveyAnswers }) => {
  player.set("step", "lobby");
});

Empirica.on("player", "selfIdentity", (_, { player, selfIdentity }) => {
  const participantIdx = player.get("participantIdx");
  const color = player.get("color");

  chatParticipants[participantIdx] = {
    name: selfIdentity,
    room: 0,
    color: color,
    active: new Date(),
  };
  player.currentGame.set("chatParticipants", chatParticipants);
});

Empirica.on("player", "activeRoom", (_, { player, activeRoom }) => {
  const participantIdx = player.get("participantIdx");
  chatParticipants[participantIdx].room = activeRoom;
  player.currentGame.set("chatParticipants", chatParticipants);
  Empirica.flush();
});

Empirica.on("player", "sendMsg", (_, { player, sendMsg }) => {
  const participantIdx = sendMsg["sender"];
  const participantStep = player.get("step");

  if (participantStep != "group-discussion") {
    if (
      sendMsg["content"] == "Hello world" ||
      sendMsg["content"] == '"Hello world"'
    ) {
      player.set("passedTutorialMessage", true);
      Empirica.flush();
    }
    return;
  }

  chatParticipants[participantIdx].active = sendMsg["dt"];

  player.currentGame.set("chatParticipants", chatParticipants);
  Empirica.flush();
});

Empirica.on("player", "createRoom", (_, { player, createRoom }) => {
  if (!createRoom) {
    return;
  }
  chatRooms[roomCounter] = { title: shapes[roomCounter] };

  const topic = player.currentGame.get("topic");

  player.set("viewingRoom", roomCounter);
  player.set("activeRoom", roomCounter);
  player.currentGame.set("chatRooms", chatRooms);
  player.currentGame.set("chatChannel-" + roomCounter, [
    {
      sender: "-1",
      dt: new Date().getTime(),
      content: prompts["prompt1"][topic],
    },
  ]);

  for (
    let minutePassed = 0;
    minutePassed <= discussionMinutesElapsed;
    minutePassed++
  ) {
    let nextPrompt = "";
    if (minutePassed == gameParams["followupDelay1"]) {
      nextPrompt = prompts["prompt2"][topic];
      const msgs = player.currentGame.get("chatChannel-" + roomCounter) || [];

      player.currentGame.set("chatChannel-" + roomCounter, [
        ...msgs,
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: nextPrompt,
        },
      ]);
    }

    if (
      minutePassed ==
      gameParams["followupDelay1"] + gameParams["followupDelay2"]
    ) {
      nextPrompt = prompts["prompt3"][topic];
      const msgs = player.currentGame.get("chatChannel-" + roomCounter) || [];

      player.currentGame.set("chatChannel-" + roomCounter, [
        ...msgs,
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: nextPrompt,
        },
      ]);
    }

    if (minutePassed == gameParams["switchRoomDelay"]) {
      nextPrompt =
        "(Reminder) You can check out other chat rooms at any time and switch to whichever you feel most comfortable in! If you switch, please introduce yourself and add on to the discussion.";
      const msgs = player.currentGame.get("chatChannel-" + roomCounter) || [];

      player.currentGame.set("chatChannel-" + roomCounter, [
        ...msgs,
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: nextPrompt,
        },
      ]);
    }
  }

  roomCounter += 1;
});

Empirica.on("player", "resetInactivity", (_, { player, resetInactivity }) => {
  const participantIdx = player.get("participantIdx");
  chatParticipants[participantIdx].active = new Date().getTime();
  player.currentGame.set("chatParticipants", chatParticipants);
});

// Called when the "game" (experiment) starts, aka, when at least one participant joins the lobby
Empirica.on("game", (_, { game }) => {
  // Initialize parameters
  game.set("gameParams", gameParams);
  game.set("lobbyDuration", game.lobbyConfig.duration);
  game.set("submitCooperationDecision", false);
  game.set("currentStage", "onboarding");
});

// Called when each participant joins the lobby
Empirica.on("game", "startLobby", (_, { game }) => {
  // Start a timer when the first person finishes onboarding
  console.log("lobby started");
  if (typeof game.get("lobbyTimeout") == "undefined") {
    const now = Date.now();
    if (game.lobbyConfig) {
      const expirationTS = now + game.lobbyConfig.duration / 1000000;
      game.set("lobbyTimeout", new Date(expirationTS).toISOString());
    }
  }
});

Empirica.on("player", "ready", (_, { player, ready }) => {
  readyPlayerList.add(player.id);
});

Empirica.on(
  "player",
  "requestAIAssistance",
  async (_, { player, requestAIAssistance }) => {
    if (requestAIAssistance.id > -1) {
      const topics = [
        "evolution being taught as a fact of biology",
        "protecting the second amendment right to bear arms",
        "funding the military",
        "the idea that children are being indoctrinated at school with LGBT messaging",
        "paying higher taxes to support climate change research",
        "the idea that COVID-19 restrictions went too far",
        "having stricter immigration requirements into the U.S.",
      ];

      let prompt = "";
      let game_topic = topics[parseInt(player.currentGame.get("topic"))];
      let activeRoom = player.get("activeRoom");
      let previous_convo = player.currentGame.get("chatChannel-" + activeRoom);
      let PID = player.get("participantIdx");
      let opinion = player.get("surveyAnswers")[game_topic];

      let chatLog = "";
      for (const msg of previous_convo) {
        chatLog += `${msg.sender}: ${msg.content}\n`;
      }

      if (gameParams.condition == "control") {
        // no completion needed
      } else if (gameParams.condition == "personal") {
        prompt = [
          {
            role: "system",
            content:
              "Your task is to generate message suggestion in a group conversation. The user with ID -1 represents the moderator who is just overseeing the conversation among the remaining members.",
          },
          {
            role: "user",
            content: `Topic of conversation: ${game_topic}
            Previous Conversation: ${chatLog}

            Now suggest a message response for ${PID}$ who rated the discussion topic ${opinion}. 
            Try to keep the suggestion as short as possible.
            Pay heed to the participant's previous message style and word structure so it feels adapted to them.
            You must follow the standard of casual conversations -- so that it is not too wordy and formal.
            Do NOT make the suggestions too long (1/2 sentences at max). 

            Your response must follow the JSON format: 
            {"SuggestionReasoning": Your reasoning, "Suggestion": {your suggestion for ${PID}$} } }`,
          },
        ];
      } else if (gameParams.condition == "relational-static") {
        let group_opinion = player.currentGame.players
          .filter((p) => p.get("activeRoom") == player.get("activeRoom"))
          .map(
            (p) =>
              `${p.get("participantIdx")}: ${
                p.get("surveyAnswers")[game_topic]
              }`
          )
          .join(", ");

        prompt = [
          {
            role: "system",
            content:
              "Your task is to generate message suggestion in a group conversation. The user with ID -1 represents the moderator who is just overseeing the conversation among the remaining members.",
          },
          {
            role: "user",
            content: `Topic of conversation: ${game_topic}
            Participants: ${group_opinion}
            Previous Conversation: ${chatLog}

            Rate the above conversation based on the following metrics: Tone (Pro/Against/Neutral), Respectfulness (0-5), Cooperativeness (0-5), and Social Awareness (0-5).
            
            Now suggest a message response for ${PID}$ so that the group is not polarized and respects others' opinions.
            Apply principles of Cognitive dissonance theory to come up with your suggestions.
            Try to keep the suggestion as short as possible.
            Pay heed to the participant's previous message style and word structure so it feels adapted to them.
            You must follow the standard of casual conversations -- so that it is not too wordy and formal.
            Do NOT make the suggestions too long (1/2 sentences at max). 

            Your response must follow the JSON format: 
            { "Rate": {"Tone": ..., "Respectfulness": ..., .... }, 
            "SuggestionReasoning": Your reasoning based on Cognitive Dissonance Theory, 
            "Suggestion": {your suggestion for ${PID}$} } }
            `,
          },
        ];
      } else if (gameParams.condition == "relational-dynamic") {
        let group_opinion = player.currentGame.players
          .filter((p) => p.get("activeRoom") == player.get("activeRoom"))
          .map(
            (p) =>
              `${p.get("participantIdx")}: ${
                p.get("surveyAnswers")[game_topic]
              }`
          )
          .join(", ");

        let prev_opinion = player.currentGame.players
          .filter(
            (p) =>
              p.get("joinedRooms").includes(player.get("activeRoom")) &&
              p.get("activeRoom") != player.get("activeRoom")
          )
          .map(
            (p) =>
              `${p.get("participantIdx")}: ${
                p.get("surveyAnswers")[game_topic]
              }`
          )
          .join(", ");

        prompt = [
          {
            role: "system",
            content:
              "Your task is to generate message suggestion in a group conversation. The user with ID -1 represents the moderator who is just overseeing the conversation among the remaining members.",
          },
          {
            role: "user",
            content: `Topic of conversation: ${game_topic}
            Current Participants: ${group_opinion}
            Previous Participants who have left the conversation (if any): ${prev_opinion}
            Previous Conversation: ${chatLog}

            Rate the above conversation based on the following metrics: Tone (Pro/Against/Neutral), Respectfulness (0-5), Cooperativeness (0-5), and Social Awareness (0-5).
            
            Now suggest a message response for ${PID}$ so that the group is not polarized and respects others' opinions.
            You can pay attention to who has left the conversation and their previous messages as well to understand why they left and if you can prevent such abrupt leaving from happening again.
            Apply principles of Cognitive dissonance theory to come up with your suggestions.
            Try to keep the suggestion as short as possible.
            Pay heed to the participant's previous message style and word structure so it feels adapted to them.
            You must follow the standard of casual conversations -- so that it is not too wordy and formal.
            Do NOT make the suggestions too long (1/2 sentences at max). 

            Your response must follow the JSON format: 
            { "Rate": {"Tone": ..., "Respectfulness": ..., .... }, 
            "SuggestionReasoning": Your reasoning based on Cognitive Dissonance Theory, 
            "Suggestion": {your suggestion for ${PID}$} } }
            `,
          },
        ];
      }

      if (prompt !== "") {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: prompt,
            store: false,
          });

          let reply = completion.choices[0].message["content"];
          let parsed_reply = parseAIResponse(reply);

          player.set("suggestedReply", {
            id: requestAIAssistance.id + 1,
            content: parsed_reply.Suggestion,
          });
        } catch (error) {
          console.error("Error getting AI assistance:", error);
          player.set("suggestedReply", {
            id: requestAIAssistance.id + 1,
            content:
              "I apologize, but I'm having trouble generating a suggestion right now. Please try again.",
          });
        }
      }
    }
  }
);

Empirica.onGameStart(({ game }) => {
  const round = game.addRound({ name: "round" });
  round.addStage({ name: "ready", duration: 30 }); // 30 seconds
  round.addStage({
    name: "group-discussion",
    duration: gameParams.chatTime * 60,
  }); // 10 minutes
  round.addStage({
    name: "summary-task",
    duration: gameParams.summaryTime * 60,
  }); // 3 minutes

  game.set("chatRooms", chatRooms);
  game.set("started", true);
  game.set("chatParticipants", chatParticipants);
  for (const idx in chatRooms) {
    game.set("chatChannel-" + idx, []);
  }

  // Get participants who passed all preceding steps
  for (const player of game.players) {
    // if (!readyPlayerList.has(player.id)) {
    //   player.set("end", true);
    //   player.set("endReason", "not-ready");
    //   continue;
    // }

    player.set("step", "ready");
  }
});

Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {
  const stageName = stage.get("name");
  console.log("stage started: " + stageName);
  if (stageName == "group-discussion") {
    console.log("initializing chat");
    const remainingPlayers = stage.currentGame.players.filter((p) =>
      p.get("ready")
    );

    const notReadyPlayers = stage.currentGame.players.filter(
      (p) => p.get("ready") != true
    );
    for (let i = 0; i < notReadyPlayers.length; i++) {
      notReadyPlayers[i].set("ended", true);
      notReadyPlayers[i].set("endReason", "not-ready");
    }

    // Decide topic
    // Get highest polarization topic from surveyAnswers
    const answersPerQuestion = {};
    const entropyPerQuestion = {};
    gameParams.topics.forEach((_, index) => {
      answersPerQuestion[index] = [];
    });
    gameParams.topics.forEach((_, index) => {
      entropyPerQuestion[index] = 0;
    });

    for (const player of remainingPlayers) {
      const answers = player.get("surveyAnswers");
      for (const k in answers) {
        answersPerQuestion[k].push(parseInt(answers[k]));
      }
    }

    for (const k in entropyPerQuestion) {
      entropyPerQuestion[k] = calculateEntropyFromData(answersPerQuestion[k]);
    }

    maxEntropyKs = [0];
    maxEntropyV = 0;
    for (const k in entropyPerQuestion) {
      if (entropyPerQuestion[k] > maxEntropyV) {
        maxEntropyV = entropyPerQuestion[k];
        maxEntropyKs = [k];
      } else if (entropyPerQuestion[k] == maxEntropyV) {
        maxEntropyKs.push(k);
      }
    }

    // Select random topic with max entropy
    const topic = maxEntropyKs[Math.floor(Math.random() * maxEntropyKs.length)];
    stage.currentGame.set("topic", topic);

    // Create chat rooms
    console.log("remaining players: " + remainingPlayers.length);
    let numCreatedGroups = 0;
    for (let i = 0; i < remainingPlayers.length; i++) {
      // Create a new chat room when the previous is full
      const targetNumParticipants =
        remainingPlayers.length > 5
          ? initialGroupsBySampleSize[remainingPlayers.length][numCreatedGroups]
          : targetParticipantsPerGroup;

      if (i % targetNumParticipants == 0) {
        roomCounter += 1;
        chatRooms[roomCounter] = { title: shapes[roomCounter] };
      }

      // Place players in the new chat room
      const playerIdx = remainingPlayers[i].get("participantIdx");
      remainingPlayers[i].set("viewingRoom", roomCounter);
      remainingPlayers[i].set("activeRoom", roomCounter);
      chatParticipants[playerIdx].room = roomCounter;
      // Set all participants as active
      chatParticipants[playerIdx].active = new Date().getTime();
    }
    roomCounter += 1;
    stage.currentGame.set("chatRooms", chatRooms);
    stage.currentGame.set("chatParticipants", chatParticipants);

    // Send initial chatbot messages
    // Send initial messages

    for (const k of Object.keys(chatRooms)) {
      const msgs = [];
      // msgs.push({
      //   sender: "-1",
      //   dt: new Date().getTime(),
      //   content: botTexts["welcomeMessage"],
      // });

      msgs.push({
        sender: "-1",
        dt: new Date().getTime(),
        content: prompts["prompt1"][topic],
      });

      stage.currentGame.set("chatChannel-" + k, msgs);
    }

    // Schedule future chatbot messages
    promptInterval = setInterval(() => {
      let nextPrompt = "";

      for (const k of Object.keys(chatRooms)) {
        // Send messages every couple of minutes unless either the participant or their partner requests an early finish
        // If an early finish is requested, we break out of the schedule
        if (discussionMinutesElapsed == gameParams["followupDelay1"]) {
          nextPrompt = prompts["prompt2"][topic];
          const msgs =
            player.currentGame.get("chatChannel-" + roomCounter) || [];

          player.currentGame.set("chatChannel-" + roomCounter, [
            ...msgs,
            {
              sender: "-1",
              dt: new Date().getTime(),
              content: nextPrompt,
            },
          ]);
        }

        if (
          discussionMinutesElapsed ==
          gameParams["followupDelay1"] + gameParams["followupDelay2"]
        ) {
          nextPrompt = prompts["prompt3"][topic];
          const msgs =
            player.currentGame.get("chatChannel-" + roomCounter) || [];

          player.currentGame.set("chatChannel-" + roomCounter, [
            ...msgs,
            {
              sender: "-1",
              dt: new Date().getTime(),
              content: nextPrompt,
            },
          ]);
        }

        if (discussionMinutesElapsed == gameParams["switchRoomDelay"]) {
          nextPrompt =
            "(Reminder) You can check out other chat rooms at any time and switch to whichever you feel most comfortable in! If you switch, please introduce yourself and add on to the discussion.";
          const msgs =
            player.currentGame.get("chatChannel-" + roomCounter) || [];

          player.currentGame.set("chatChannel-" + roomCounter, [
            ...msgs,
            {
              sender: "-1",
              dt: new Date().getTime(),
              content: nextPrompt,
            },
          ]);
        }
      }

      // Must run Empirica.flush() for asynchronous updates to be processed
      Empirica.flush();
      discussionMinutesElapsed++;

      if (discussionMinutesElapsed > gameParams.chatTime) {
        clearInterval(promptInterval);
      }
    }, 60 * 1000); // Once per minute
  }
  Empirica.flush();
});

Empirica.onStageEnded(({ stage }) => {
  const stageName = stage.get("name");
  if (stageName == "group-discussion") {
    clearInterval(promptInterval);
  }
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});
