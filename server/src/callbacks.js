import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import axios from "axios";
import * as fs from "fs";
import OpenAI from "openai";
import { shuffle, calculateEntropyFromData } from "./utils.js";
import { parseAIResponse } from "./parseresponse";
import { console } from "inspector";
export const Empirica = new ClassicListenersCollector();

const openai = new OpenAI();

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
  condition: "control", // control, personal, relational-static, relational-dynamic
  promptCategory: "real",
  version: "May 2025",
  completionCode: "C8LP8FSF",
  basePay: 1.5,
  minPlayersPerRoom: 3,
  maxPlayersPerRoom: 3,
  studyTime: 25,
  surveyPay: 1.5,
  discussionPay: 3,
  bonusPerParticipant: 0.5,
  maxBonus: 2.5,
  maxWaitTime: 5,
  inactivityMax: 120, // 120 seconds
  inactivityWarning: 50, // 50 seconds
  discussionPeriod: 3, // in minutes
  transitionPeriod: 1, // in minutes
  chatTime: 12,
  lobbyTime: 5,
  surveyTime: 3,
  summaryTime: 3,
  consentQuestions: {
    q1: "I am age 18 or older and in the United States.",
    q2: "I have read and understand the information above.",
    q3: "I have reviewed the eligibility requirements listed in the Participant Requirements section of this consent form and certify that I am eligible to participate in this research, to the best of my knowledge.",
    q4: "I want to participate in this research and continue with the game.",
    q5: "I will refrain from sharing private, sensitive or identifiable information about myself or others that I would not want shared outside the research setting."
  },
};

gameParams.topics = botTexts[gameParams.promptCategory]["topics"];
// shuffle(gameParams.topics);

let playerCounter = 0;
let roomCounter = -1;

const prompts = botTexts[gameParams.promptCategory];

function removeChatParticipantByPID(pid, chatParticipants) {
  if (pid in chatParticipants && pid !== "-1") {
    delete chatParticipants[pid];
  }
}

// Called when a participant joins the experiment
Empirica.on("player", (ctx, { player }) => {
  // Initialize the participant unless already initialized
  if (player.get("gameParams")) return;

  player.set("gameParams", gameParams);
  // player.set("ended", false);
  player.set("remainingErrors", 2);
  player.set("playerCounter", playerCounter);
  player.set("color", colors[playerCounter]);
  player.set("lastRequestID", -1);
  player.set("gtID", 0);
  player.set(
    "animalOptions",
    animals.slice(playerCounter * 3, playerCounter * 3 + 3)
  );
  // Set default animal identity to the first option
  player.set("selfIdentity", animals[playerCounter * 3]);
  player.set("participantIdx", playerCounter);
  player.set("activeRoom", -1);
  player.set("joinedRooms", []);
  player.set("viewingRoom", 0);
  playerCounter += 1;
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
      // Initialize tutorial directly
      player.set("step", "tutorial");
      player.set("tutorialTask", 1);

      const tutorialParticipants = {
        "-1": { name: "Moderator Bot", room: -1, color: "#f4f4f4", active: new Date().getTime() },
        [player.get("participantIdx")]: { 
          name: "hawk", 
          room: 0,
          opinion: 4,
          color: player.get("color"), 
          active: new Date().getTime() 
        },
        "dummy1": { name: "duck", room: 0, color: "#A7C7E7", opinion: 1, active: new Date().getTime() },
        "dummy2": { name: "parrot", room: 0, color: "#B39DDB", opinion: 1, active: new Date().getTime() },
        "dummy3": { name: "jay", room: 0, color: "#F2B0A2", opinion: 7, active: new Date().getTime() },
        "dummy4": { name: "hedgehog", room: 1, color: "#A7C7E7", opinion: 3, active: new Date().getTime() },
        "dummy5": { name: "snail", room: 1, color: "#B39DDB", opinion: 4, active: new Date().getTime() },
        "dummy6": { name: "pelican", room: 1, color: "#F2B0A2", opinion: 5, active: new Date().getTime() },
        "dummy7": { name: "cobra", room: 2, color: "#A7C7E7", opinion: 2, active: new Date().getTime() },
        "dummy8": { name: "finch", room: 2, color: "#B39DDB", opinion: 6, active: new Date().getTime() },
        "dummy9": { name: "snapper", room: 2, color: "#F2B0A2", opinion: 4, active: new Date().getTime() },
        "dummy10": { name: "sandpiper", room: 3, color: "#A7C7E7", opinion: 2, active: new Date().getTime() },
        "dummy11": { name: "stork", room: 3, color: "#B39DDB",  opinion: 5, active: new Date().getTime() },
        "dummy12": { name: "tapir", room: 3, color: "#F2B0A2",  opinion: 7, active: new Date().getTime() }
      };

      // Create initial chat rooms for the tutorial
      const tutorialRooms = {
        0: { title: 'tutorial-room', id: 0 },
        1: { title: shapes[1], id: 1 },
        2: { title: shapes[2], id: 2 },
        3: { title: shapes[3], id: 3 }
      };

      // Initialize chat channels for tutorial
      player.set("tutorialRooms", tutorialRooms);
      player.set("tutorialParticipants", tutorialParticipants);
      player.set("chatChannel-0", []);
      player.set("chatChannel-1", []);
      player.set("chatChannel-2", []);
      player.set("chatChannel-3", []);

      // Set tutorial game state
      player.currentGame.set("chatParticipants", tutorialParticipants);
      player.currentGame.set("chatRooms", tutorialRooms);

      // Set initial room state
      player.set("activeRoom", 0);
      player.set("viewingRoom", 0);
      player.set("joinedRooms", [0]);

      // Add welcome message to tutorial room
      player.set("chatChannel-0", [
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: "Welcome! In the original game, I will provide a topic to discuss, but since we are practicing just type 'Hello' to begin!"
        }
      ]);

      // Add dummy messages to group-1
      player.set("chatChannel-1", [
        {
          sender: "dummy4",
          dt: new Date().getTime() - 300000, // 5 minutes ago
          content: "I think we should focus on the environmental impact first."
        },
        {
          sender: "dummy5",
          dt: new Date().getTime() - 240000, // 4 minutes ago
          content: "Yes, but we also need to consider the economic factors."
        },
        {
          sender: "dummy6",
          dt: new Date().getTime() - 180000, // 3 minutes ago
          content: "Good point! Let's discuss both aspects."
        }
      ]);

      // Add dummy messages to group-2
      player.set("chatChannel-2", [
        {
          sender: "dummy7",
          dt: new Date().getTime() - 300000,
          content: "Has anyone read the latest research on this topic?"
        },
        {
          sender: "dummy8",
          dt: new Date().getTime() - 240000,
          content: "Yes, I found some interesting studies about it."
        },
        {
          sender: "dummy9",
          dt: new Date().getTime() - 180000,
          content: "Could you share those with us?"
        }
      ]);

      // Add dummy messages to group-3
      player.set("chatChannel-3", [
        {
          sender: "dummy10",
          dt: new Date().getTime() - 300000,
          content: "I have a different perspective on this issue."
        },
        {
          sender: "dummy11",
          dt: new Date().getTime() - 240000,
          content: "I'd love to hear your thoughts!"
        },
        {
          sender: "dummy12",
          dt: new Date().getTime() - 180000,
          content: "Yes, please share your viewpoint."
        }
      ]);

      Empirica.flush();
    }
  }
);

Empirica.on("player", "passedTutorial", (_, { player }) => {
  player.set("step", "survey");
});

Empirica.on("player", "surveyAnswers", (_, { player }) => {
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
  const participantStep = player.get("step");
  const tutorialTask = player.get("tutorialTask");

  if (participantStep === "tutorial") {
    // Update tutorial participants
    const tutorialParticipants = player.get("tutorialParticipants") || {};
    if (tutorialParticipants[participantIdx]) {
      tutorialParticipants[participantIdx].room = activeRoom;
      tutorialParticipants[participantIdx].active = new Date().getTime();
      player.set("tutorialParticipants", tutorialParticipants);
    }

    // Update joined rooms
    const joinedRooms = player.get("joinedRooms") || [];
    if (!joinedRooms.includes(activeRoom)) {
      joinedRooms.push(activeRoom);
      player.set("joinedRooms", joinedRooms);
    }

    // Update active room
    player.set("activeRoom", activeRoom);
    player.set("viewingRoom", activeRoom);

    // Update game state
    player.currentGame.set("chatParticipants", tutorialParticipants);

    // Check if this is task 3 (joining a different group)
    if (tutorialTask === 3 && activeRoom !== 0) {
      player.set("tutorialTask", 4);
      const msgs = player.get("chatChannel-" + activeRoom) || [];
      player.set("chatChannel-" + activeRoom, [
        ...msgs,
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: "Perfect! You've joined a new group. Now let's try creating your own group. In the original conversation, at the end of each round, you can create a new room if you do not like the conversations in any other room."
        }
      ]);
    }
  } else {
    // Update game participants
    const chatParticipants = player.currentGame.get("chatParticipants") || {};
    if (chatParticipants[participantIdx]) {
      chatParticipants[participantIdx].room = activeRoom;
      chatParticipants[participantIdx].active = new Date().getTime();
      player.currentGame.set("chatParticipants", chatParticipants);
    }

    // Update joined rooms
    const joinedRooms = player.get("joinedRooms") || [];
    if (!joinedRooms.includes(activeRoom)) {
      joinedRooms.push(activeRoom);
      player.set("joinedRooms", joinedRooms);
    }

    // Update active room
    player.set("activeRoom", activeRoom);
    player.set("viewingRoom", activeRoom);
    player.set("lastRoomChange", new Date().getTime());
  }
  Empirica.flush();
});

Empirica.on("player", "sendMsg", async (_, { player, sendMsg }) => {
  const participantIdx = sendMsg["sender"];
  const participantStep = player.get("step");
  const viewingRoom = player.get("viewingRoom");
  const tutorialTask = player.get("tutorialTask") || 1;
  const messageContent = sendMsg?.content || "";

  if (participantStep === "tutorial") {
    // Update participant's active timestamp
    const tutorialParticipants = player.get("tutorialParticipants") || {};
    if (tutorialParticipants[participantIdx]) {
      tutorialParticipants[participantIdx].active = sendMsg["dt"];
      player.set("tutorialParticipants", tutorialParticipants);
    }

    // Get current messages
    const msgs = player.get("chatChannel-" + viewingRoom) || [];

    // Add the new message
    const newMessage = {
      content: messageContent,
      sender: participantIdx.toString(),
      dt: new Date().getTime()
    };

    // Handle tutorial tasks
    if (tutorialTask === 1 && messageContent.toLowerCase().includes("hello")) {
      let nextStepbyBot = '';
      if (gameParams.condition === "control") {
        player.set("tutorialTask", 3);
        nextStepbyBot = "Great! Now let's try joining a different group. There are three groups available with different discussion topics. In the original conversation, I will prompt you when you can change group.";
      } else {
        player.set("tutorialTask", 2);
        nextStepbyBot = "Great! Now let's try using the AI suggestion feature. Click on the green suggestion box to accept it. It is NOT mandatory to use it always, it acts as an additional feature to help you write faster."
      }
      player.set("chatChannel-" + viewingRoom, [
        ...msgs,
        newMessage,
        {
          sender: "-1",
          dt: new Date().getTime() + 2000,
          content: "Do you think AI increases security risk?"
        },
        {
          sender: "dummy1",
          dt: new Date().getTime() + 2000,
          content: "Yes, the new AI models can store my personal information in its memory and create a fake profile of me."
        },
        {
          sender: "dummy2",
          dt: new Date().getTime() + 3000,
          content: "While I understand the concern, I think it is not AI's fault, rather the wrong people who wants to use it in a malicious way."
        },
        {
          sender: "dummy3",
          dt: new Date().getTime() + 4000,
          content: "I agree, unless people use it for a bad way, it is just another software we use."
        },
        {
          sender: "-1",
          dt: new Date().getTime() + 5000,
          content: nextStepbyBot
        }
      ]);
    } else {
      // Handle regular messages during tutorial
      player.set("chatChannel-" + viewingRoom, [...msgs, newMessage]);
    }
    Empirica.flush();
  } else {
    // For non-tutorial messages
    const participantIdxString = participantIdx.toString(); // Ensure consistent type for comparison if needed
    const chatParticipants = player.currentGame.get("chatParticipants") || {};
    
    // Update active time for the sending player
    if (chatParticipants[participantIdxString]) {
      chatParticipants[participantIdxString].active = sendMsg["dt"];
      // No need to .set back to game if only active time is changed and it's reflected elsewhere or not critical for this exact transaction
    } else if (chatParticipants[participantIdx]) { // Fallback for numeric index, though string is safer from player.get()
        chatParticipants[participantIdx].active = sendMsg["dt"];
    }

    console.log(`[sendMsg] Player ${participantIdx} sending message to room ${viewingRoom}.`);
    console.log(`[sendMsg] Current full chatParticipants for game:`, JSON.stringify(chatParticipants));

    // Check if there's only one human participant in the room
    const humanRoomParticipants = Object.values(chatParticipants).filter(
      p => Number(p.room) === Number(viewingRoom) && p.name !== "Moderator Bot"
    );

    console.log(`[sendMsg] Human participants in room ${viewingRoom}: ${humanRoomParticipants.length}. Participants:`, JSON.stringify(humanRoomParticipants.map(p=>p.name)));

    if (humanRoomParticipants.length === 1) {
      console.log(`[sendMsg] Solo message triggered for player ${participantIdx} in room ${viewingRoom}.`);
      // Get the topic and previous conversation
      const topics = gameParams.topics;
      const game_topic = topics[parseInt(player.currentGame.get("topic"))];
      console.log('ai responding for solo setup in', game_topic)
      const previous_convo = player.currentGame.get("chatChannel-" + viewingRoom);
      let chatLog = "";
      for (const msg of previous_convo) {
        chatLog += `${msg.sender}: ${msg.content}\n`;
      }

      // Generate AI response
      const prompt = [
        {
          role: "system",
          content: "You are a helpful moderator in a group discussion. Your role is to engage with the participant, ask relevant questions, and keep the conversation going. Be conversational but professional.",
        },
        {
          role: "user",
          content: `Topic of conversation: ${game_topic}
          Previous Conversation (your id is -1): ${chatLog}

          Generate a response as the moderator to continue the discussion. Keep it concise (1-2 sentences) and engaging.
          Your response must follow the JSON format: 
          {"Suggestion": "your response here"}`,
        },
      ];

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: prompt,
          store: false,
        });

        let reply = completion.choices[0].message["content"];
        let parsed_reply = JSON.parse(reply);

        player.set("soloModeratorReply", {
          condition: gameParams.condition,
          prompt: prompt,
          output: reply,
        });

        // Add AI response to the chat
        setTimeout(() => {
          const updatedMsgs = player.currentGame.get("chatChannel-" + viewingRoom) || [];
          player.currentGame.set("chatChannel-" + viewingRoom, [
            ...updatedMsgs,
            {
              sender: "-1",
              dt: new Date().getTime(),
              content: parsed_reply.Suggestion
            }
          ]);
          Empirica.flush();
        }, 200); // 1 second delay to make it feel more natural
      } catch (error) {
        console.error("Error generating AI moderator response:", error);
      }
    }
  }
  Empirica.flush();
});

Empirica.on("player", "acceptSuggestion", (_, { player }) => {
  const participantStep = player.get("step");
  const tutorialTask = player.get("tutorialTask");
  const viewingRoom = player.get("viewingRoom");

  if (participantStep === "tutorial" && tutorialTask === 2) {
    // Progress to next task
    player.set("tutorialTask", 3);
    
    // Add success message
    setTimeout(() => {
      const msgs = player.get("chatChannel-" + viewingRoom) || [];

      player.set("chatChannel-" + viewingRoom, [
        ...msgs,
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: "Great! You've accepted the AI suggestion. Now let's try joining a different group. There are three groups available with different discussion topics. In the original conversation, I will prompt you when you can change group."
        }
      ]);
      Empirica.flush();
    }, 200);
  }
});

Empirica.on("player", "createRoom", (_, { player, createRoom }) => {
  console.log("1. create room initialization.");
  if (!createRoom) return;
  // const participantStep = player.currentStage;
  const participantStep = player.get("step");
  console.log("2. create room triggered enabled." + participantStep);
  if (participantStep === "tutorial") {
    // Create a new room for the tutorial
    const roomId = Object.keys(player.get("tutorialRooms") || {}).length;
    const newRoom = { title: shapes[roomId], id: roomId };
    const tutorialRooms = player.get("tutorialRooms") || {};
    tutorialRooms[roomId] = newRoom;
    player.set("tutorialRooms", tutorialRooms);
    player.set("chatChannel-" + roomId, []);
    // Update player's room state
    player.set("activeRoom", roomId);
    player.set("viewingRoom", roomId);
    player.set("tutorialTask", 5);
    player.set("passedTutorialMessage", true);
    player.set("chatChannel-" + roomId, [
      {
        sender: "-1",
        dt: new Date().getTime(),
        content: `Excellent! You've completed the practice chat round. In the original setup, this conversation will continue for ${gameParams.chatTime} minutes. For now, you may proceed to the next step.`
      }
    ]);
    Empirica.flush();
  }

  else if (participantStep.includes("group-discussion-transition-")) {
    console.log("3. create room triggered for: " + participantStep);
    // chatRooms = player.currentGame.get("chatRooms");
    const newroomID = Object.keys(chatRooms).length;
    const newRoom = { title: shapes[newroomID] };
    chatRooms[newroomID] = newRoom;
    player.currentGame.set("chatRooms", chatRooms);
    player.set("viewingRoom", newroomID);
    player.set("activeRoom", newroomID);
    player.set("room", newroomID);
    player.set("lastRoomChange", new Date().getTime());
    player.set("roomcreated", newroomID);
    const participantIdx = player.get("participantIdx");
    const chatParticipants = player.currentGame.get("chatParticipants") || {};
    if (chatParticipants[participantIdx]) {
      chatParticipants[participantIdx].room = newroomID;
      chatParticipants[participantIdx].active = new Date().getTime(); 
      player.currentGame.set("chatParticipants", chatParticipants);
    }
    player.currentGame.set("chatChannel-" + newroomID, [
      {
        sender: "-1",
        dt: new Date().getTime(),
        content: 'We will start the conversation shortly.',
      }
    ]);
  }
});

Empirica.on("player", "resetInactivity", (_, { player }) => {
  const participantIdx = player.get("participantIdx");
  const chatParticipants = player.currentGame.get("chatParticipants") || {};

  if (chatParticipants[participantIdx]) {
    chatParticipants[participantIdx].active = new Date().getTime();
    player.currentGame.set("chatParticipants", chatParticipants);
  }

  player.set("active", new Date().getTime());
});


// Called when the "game" (experiment) starts, aka, when at least one participant joins the lobby
Empirica.on("game", (_, { game }) => {
  // Initialize parameters
  game.set("gameParams", gameParams);
  game.set("lobbyDuration", game.lobbyConfig.duration);
  game.set("currentStage", "onboarding");
});

Empirica.on("game", "startLobby", (_, { game }) => {
  // Start a timer when the first person finishes onboarding
  console.log("starting lobby");
  if (typeof game.get("lobbyTimeout") == "undefined") {
    const now = Date.now();
    if (game.lobbyConfig) {
      const expirationTS = now + game.lobbyConfig.duration / 1000000;
      game.set("lobbyTimeout", new Date(expirationTS).toISOString());
    }
  }
});

Empirica.on("player", "ready", (_, { player }) => {
  readyPlayerList.add(player.id);
});

Empirica.on(
  "player",
  "requestAIAssistance",
  async (_, { player, requestAIAssistance }) => {
    console.log('fired for a player with requestAIAssistance id', requestAIAssistance.id);
    if (requestAIAssistance.id > -1) {
      const topics = gameParams.topics;
      let game_topic = topics[parseInt(player.currentGame.get("topic"))];
      console.log('seeking assistance on', game_topic);
      let activeRoom = player.get("activeRoom");
      let previous_convo = player.currentGame.get("chatChannel-" + activeRoom);
      let PID = player.get("participantIdx");

      // Check if participant has sent any messages in the current room
      // const hasParticipantSentMessage = previous_convo.some(msg => msg.sender === PID.toString());
      const hasParticipantSentMessage = previous_convo.length > 0;
      console.log('requestAIAssistance fired because.', PID, 'has no message in', previous_convo);
      if (hasParticipantSentMessage)
      {
        console.log('requestAIAssistance processing.');
        let opinion = player.get("surveyAnswers")[game_topic];
        console.log('topics', topics, 'game_topic', game_topic, 'opinion', opinion);
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
              Do NOT include '${PID}$:' in your suggestions.

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
              Do NOT include '${PID}$:' in your suggestions. 

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
              Do NOT include '${PID}$:' in your suggestions.

              Your response must follow the JSON format: 
              { "Rate": {"Tone": ..., "Respectfulness": ..., .... }, 
              "SuggestionReasoning": Your reasoning based on Cognitive Dissonance Theory, 
              "Suggestion": {your suggestion for ${PID}$} } }
              `,
            },
          ];
        }

        console.log('passed all checks');
        if (typeof prompt !== "undefined" && prompt !== "") {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: prompt,
              store: false,
            });

            let reply = completion.choices[0].message["content"];
            let parsed_reply = parseAIResponse(reply);

            player.set("requestAIAssistance", {
              input: prompt,
              output: completion.choices[0].message["content"],
            });

            player.set("suggestedReply", {
              id: parseInt(requestAIAssistance.id) + 1,
              content: parsed_reply.Suggestion,
            });

            player.set("gtID", parseInt(requestAIAssistance.id) + 1);
          } catch (error) {
            console.error("Error getting AI assistance:", error);
            player.set("suggestedReply", {
              condition: gameParams.condition,
              id: parseInt(requestAIAssistance.id) + 1,
              content:
                "I apologize, but I'm having trouble generating a suggestion right now. Please try again.",
            });
          }
        }
      } 
      else {
        // FIRST MESSAGE CASE — return a stub reply
        const fallbackID = parseInt(requestAIAssistance.id) + 1;

        player.set("suggestedReply", {
          id: fallbackID,
          content: "", // blank suggestion
        });

        player.set("gtID", fallbackID);
        player.set("lastRequestID", requestAIAssistance.id);

        console.log(
          "Skipped AI suggestion (first message), but returned stub suggestion with id",
          fallbackID
        );
      }
    }
  }
);

Empirica.onGameStart(({ game }) => {
  console.log('Game start event received');
  const round = game.addRound({ name: "round" });
  round.addStage({ name: "ready", duration: 30 }); // 30 seconds
  
  // Add three conversation rounds with transitions only after first two
  for (let i = 1; i <= 3; i++) {
    round.addStage({
      name: `group-discussion-${i}`, 
      duration: gameParams.discussionPeriod * 60 
    });
    if (i < 3) { 
      round.addStage({ 
        name: `group-discussion-transition-${i}`, 
        duration: gameParams.transitionPeriod * 60 
      });
    }
  }
        
  round.addStage({
    name: "summary-task",
    duration: gameParams.summaryTime * 60,
  });
  
  for (const idx in chatRooms) {
    game.set("chatChannel-" + idx, []);
  }
  // for (const player of game.players) {
  //   const step = player.get("step");
  //   if (!step || step === "tutorial" || step === "survey") {
  //     player.set("ended", true);
  //     player.set("endReason", "not-in-lobby");
  //     player.set("step", "end");
  //     removeChatParticipantByPID(player.get("participantIdx"), chatParticipants);
  //     // player.exit("ended");
  //   }    
  // }
});

Empirica.onStageStart(({ stage }) => {
  const stageName = stage.get("name");
  console.log("stage started: " + stageName);

  for (const player of stage.currentGame.players) {
    player.set("step", stageName);
  }
  
  if (stageName.startsWith("group-discussion-") && !stageName.includes("transition")) {
    const roundNum = parseInt(stageName.split("-")[2]);
    stage.currentGame.set("currentRound", roundNum);
    
    // If this is the first conversation round, assign rooms
    if (roundNum === 1) {
      const allPlayers = stage.currentGame.players;

      // Keep only players who have finished the intro and clicked "Ready"
      const remainingPlayers = allPlayers.filter(
        (p) => p.get("ready")
      );

      const remainingIDs = new Set(remainingPlayers.map(p => p.id));
      const notReadyPlayers = allPlayers.filter(p => !remainingIDs.has(p.id));

      for (const p of notReadyPlayers) {
        p.set("ended", true);
        p.set("endReason", "not-ready");
        // p.exit("ended");
        p.set("step", "end");
        removeChatParticipantByPID(player.get("participantIdx"), chatParticipants);
      }
    
      // Decide topic based on survey responses
      const answersPerQuestion = {};
      const entropyPerQuestion = {};
      gameParams.topics.forEach((_, index) => {
        answersPerQuestion[index] = [];
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

      let maxEntropyKs = [0];
      let maxEntropyV = 0;
      for (const k in entropyPerQuestion) {
        if (entropyPerQuestion[k] > maxEntropyV) {
          maxEntropyV = entropyPerQuestion[k];
          maxEntropyKs = [k];
        } else if (entropyPerQuestion[k] == maxEntropyV) {
          maxEntropyKs.push(k);
        }
      }

      const topic = maxEntropyKs[Math.floor(Math.random() * maxEntropyKs.length)];
      stage.currentGame.set("topic", topic);
      // Create chat rooms based on remaining players
      let numCreatedGroups = 0;
      roomCounter = -1;
      for (let i = 0; i < remainingPlayers.length; i++) {
        // Create a new chat room when the previous is full
        const targetNumParticipants =
          remainingPlayers.length > 5
            ? initialGroupsBySampleSize[remainingPlayers.length][numCreatedGroups]
            : targetParticipantsPerGroup;
  
        if (i % targetNumParticipants == 0) {
          roomCounter += 1;
          chatRooms[roomCounter] = { title: shapes[roomCounter] };
          numCreatedGroups++;
        }
  
        // Place players in the new chat room
        const playerIdx = remainingPlayers[i].get("participantIdx");
        const answers = remainingPlayers[i].get("surveyAnswers");
        const opinion = parseInt(answers[topic])
        remainingPlayers[i].set("viewingRoom", roomCounter);
        remainingPlayers[i].set("active", new Date().getTime());
        remainingPlayers[i].set("activeRoom", roomCounter);
        remainingPlayers[i].set("joinedRooms", [roomCounter]);
        chatParticipants[playerIdx] = {
          name: remainingPlayers[i].get("selfIdentity"),
          room: roomCounter,
          color: remainingPlayers[i].get("color"),
          active: new Date().getTime(),
          opinion: opinion
        };
      }
      stage.currentGame.set("chatRooms", chatRooms);
      stage.currentGame.set("chatParticipants", chatParticipants);
    }

    // Send initial chatbot messages
    let topic = stage.currentGame.get("topic");
    console.log('topic when moderator prompts', topic);
    for (const k of Object.keys(chatRooms)) {
      let msgs = stage.currentGame.get("chatChannel-" + k) || [];
      if (roundNum === 1) {
        msgs = [];
      }
      msgs.push({
        sender: "-1",
        dt: new Date().getTime(),
        content: prompts[`prompt${roundNum}`][topic],
      });
      stage.currentGame.set("chatChannel-" + k, msgs);
    }
    
    // Lock participants in their current rooms
    const remainingPlayers = allPlayers.filter(
      (p) => p.get("ready") === true && p.get("ended") === false
    );
    for (const player of remainingPlayers) {
      player.set("roomLocked", true);
      player.set("canSendMessages", true);
    }
  } else if (stageName.startsWith("group-discussion-transition-")) {
    // Enable room changes and disable messaging
    for (const player of stage.currentGame.players) {
      player.set("roomLocked", false);
      player.set("canSendMessages", false);
    }
  }
});

// Handle stage end
Empirica.onStageEnded(({ stage }) => {
  const stageName = stage.get("name");
  console.log("stage ended: " + stageName);
  
  if (stageName.startsWith("group-discussion-") && !stageName.includes("transition")) {
    // Send round end message
    for (const roomId in chatRooms) {
      const msgs = stage.currentGame.get("chatChannel-" + roomId) || [];
      stage.currentGame.set("chatChannel-" + roomId, [
        ...msgs,
        {
          sender: "-1",
          dt: new Date().getTime(),
          content: "This round has ended. You will now have 1 minute to view other rooms and change if desired."
        }
      ]);
    }
  } else if (stageName.startsWith("group-discussion-transition-")) {
    // Clear the transition interval
    const intervalId = stage.get("transitionIntervalId");
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
});

// Check for inactive participants during transitions
Empirica.on("player", "viewingRoom", (_, { player }) => {
  const stage = player.currentStage;
  if (stage && stage.get("name").startsWith("group-discussion-transition-")) {
    player.set("lastRoomChange", new Date().getTime());
  }
});

Empirica.onRoundStart(({ round }) => {});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});
