/*
 * Filename: ChatRoom.jsx
 * Author: Elijah Claggett
 *
 * Description:
 * This ReactJS component wraps a Discord-like chat room.
 */

// Imports
import React, { useState, useEffect } from "react";
import {
  usePlayer,
  useGame,
  useStage,
} from "@empirica/core/player/classic/react";
import {
  Box,
  Avatar,
  Badge,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import TagIcon from "@mui/icons-material/Tag";
import AddIcon from "@mui/icons-material/Add";
import { SendRounded } from "@mui/icons-material";
import {
  ChatContainer,
  MessageList,
  Message,
  Avatar as ChatAvatar,
} from "@chatscope/chat-ui-kit-react";
import "./ChatRoom.css";
import "./ChatRoomMessageList.scss";


const getRingColor = (value) => {
  const colors = [
    "rgb(0, 128, 255)", // 1 - deep blue
    "rgb(74, 160, 246)", // 2 - faded blue
    "rgb(163, 209, 255)", // 3 - closer to gray
    "rgb(221, 221, 221)", // 4 - neutral gray
    "rgb(244, 196, 154)",   // 5 - closer to gray
    "rgb(250, 155, 73)",   // 6 - faded orange
    "rgb(245, 114, 0)",   // 7 - deep orange
  ];
  
  return colors[Math.min(Math.max(value, 1), 7) - 1];
};


const getStanceLabel = (value) => {
  const stances = [
    "Disagree",
    "Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Agree",
    "Agree"
  ];
  return stances[Math.min(Math.max(value, 1), 7) - 1];
};

function minutesAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);

  // Calculate the difference in milliseconds
  const diff = now.getTime() - then.getTime();

  // Convert to minutes
  const minutes = Math.floor(diff / (1000 * 60));

  return minutes;
}

export default function ChatRoom({}) {
  const player = usePlayer();
  const game = useGame();
  const stage = useStage();
  const stageName = stage?.get("name") || "intro";
  const gameParams = game.get("gameParams");
  const suggestion = player.get("suggestedReply");
  /* || {
    content: "AI Suggestion",
  };*/
  const participantIdx = player.get("participantIdx");
  const participantStep = player.get("step") || "";
  const viewingRoom = player.get("viewingRoom") || 0;
  const activeRoom = player.get("activeRoom");
  const [newRoomOpen, setNewRoomOpen] = React.useState(false);
  const rooms = participantStep === "tutorial" 
    ? player.get("tutorialRooms") || {}
    : game.get("chatRooms") || {};
  const chatParticipants = participantStep === "tutorial"
    ? player.get("tutorialParticipants") || {}
    : game.get("chatParticipants") || {};
  const messages = participantStep === "tutorial"
    ? player.get("chatChannel-" + viewingRoom) || []
    : game.get("chatChannel-" + viewingRoom) || [];
  const [drafts, setDrafts] = useState({});
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [receivedCompletion, setReceivedCompletion] = useState(false);
  const roomLocked = player.get("roomLocked") || false;
  const canSendMessages = player.get("canSendMessages") !== false;
  let self = {};

  for (const idx in chatParticipants) {
    if (idx == participantIdx) {
      self = chatParticipants[idx];
    }
  }

  const selfLastActiveDiff = (new Date().getTime() - self.active) / 1000;
  if (
    participantStep.includes("group-discussion") &&
    selfLastActiveDiff > gameParams.inactivityMax
  ) {
    player.set("ended", true);
    player.set("step", "end");
    player.set("endReason", "timeout");
  }

  useEffect(() => {
    for (const idx in rooms) {
      if (!(idx in drafts)) {
        drafts[idx] = "";
      }
    }
  }, [rooms]);

  useEffect(() => {
    document.querySelector("textarea:not([readonly])").value =
      drafts[viewingRoom];
  }, [viewingRoom]);

  useEffect(() => {
    setReceivedCompletion(false);
    // Request AI assistance for every new message
    if (messages &&
      stageName.includes("group-discussion") &&
      messages[messages.length - 1].sender != participantIdx
    ) {
      console.log("requesting assistance");
      player.set("requestAIAssistance", { id: player.get("gtID") + 1 });
    }
  }, [messages]);

  useEffect(() => {
    if (suggestion && suggestion.id > player.get("lastRequestID")) {
      player.set("lastRequestID", suggestion.id);
      setReceivedCompletion(true);
    }
  }, [suggestion]);

  function handleMsgChange(ev) {
    let currentDrafts = drafts;
    currentDrafts[viewingRoom] = ev.target.value;
    setDrafts(currentDrafts);
  }
  function handleKeyDown(ev) {
    if (ev.keyCode == 13 && !ev.shiftKey) {
      ev.preventDefault();
      if (activeRoom == viewingRoom) {
        handleSend();
      } else {
        setTooltipOpen(true);
      }
    }
  }
  function handleSend() {
    if (!canSendMessages) {
      setTooltipOpen(true);
      return;
    }

    if (stageName.startsWith("group-discussion")) {
      game.set("chatChannel-" + activeRoom, [
        ...messages,
        {
          content: drafts[activeRoom],
          dt: new Date().getTime(),
          sender: participantIdx.toString(),
        },
      ]);
    }
    setReceivedCompletion(false);
    player.set("sendMsg", {
      sender: participantIdx.toString(),
      dt: new Date().getTime(),
      content: drafts[activeRoom],
    });
    document.querySelector("textarea:not([readonly])").value = "";
    let currentDrafts = drafts;
    currentDrafts[viewingRoom] = "";
    setDrafts(currentDrafts);
  }

  function renderMessages(msgs) {
    let msgIdx = 0;
    return msgs.map((msg) => {
      msgIdx += 1;
      const sender = chatParticipants[msg.sender];
      if (!sender) return null; // Skip if sender not found
      

      return (
        <Message
          className="msg"
          model={{
            message: msg.content,
            sentTime: msg.dt.toString(),
            sender: msg.sender,
            direction: "incoming",
            position: "single",
          }}
          key={"msg-" + msgIdx}
          avatarPosition="tl"
        >
          <Message.Header
            sender={sender.name}
            sentTime={new Date(msg.dt).toLocaleTimeString("en-us")}
          />
          <ChatAvatar
            alt={sender.name}
            src={
              msg.sender === "-1"
                ? "/assets/ai0.svg"
                : "/assets/animal_icons/" + sender.name + ".svg"
            }
            style={{ backgroundColor: sender.color }}
          />
        </Message>
      );
    });
  }

  function viewRoom(room) {
    player.set("viewingRoom", room);
  }
  function joinRoom() {
    player.set("activeRoom", viewingRoom);
    player.set("joinedRooms", [...player.get("joinedRooms"), viewingRoom]);
  }

  function generateRoomListItems(rooms) {
    return Object.keys(rooms).map((roomIdx) => {
      const room = rooms[roomIdx];
      let numParticipants = 0;
      for (const idx in chatParticipants) {
        if (chatParticipants[idx].room == roomIdx) numParticipants += 1;
      }
      return (
        <ListItem
          className={viewingRoom == roomIdx ? "active room" : "room"}
          key={"room-" + roomIdx}
          onClick={() => viewRoom(roomIdx)}
        >
          <ListItemIcon>
            <TagIcon />
          </ListItemIcon>
          <ListItemText primary={room.title + " (" + numParticipants + ")"} />
        </ListItem>
      );
    });
  }

  function generateUserListItems() {
    const roomParticipants = [];
    for (const idx in chatParticipants) {
      if (participantStep === "tutorial") {
        // During tutorial, show all participants in the current room
        if (chatParticipants[idx].room == viewingRoom) {
          roomParticipants.push(chatParticipants[idx]);
        }
      } else if (
        participantStep.includes("group-discussion") &&
        chatParticipants[idx].room == viewingRoom
      ) {
        roomParticipants.push(chatParticipants[idx]);
      } else if (
        chatParticipants[idx].room == viewingRoom &&
        idx == participantIdx
      ) {
        roomParticipants.push(chatParticipants[idx]);
      }
    }

    if (roomParticipants.length == 0) {
      return (
        <Typography variant="body-sm" className="note">
          None
        </Typography>
      );
    }
    return roomParticipants.map((user) => {
      const lastActiveDiff = (new Date().getTime() - user.active) / 1000;
      return (
        <ListItem key={"user-" + user.name}>
          {/* <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              variant="dot"
              className={lastActiveDiff < 120 ? "active" : "idle"}
            >
              <Avatar
                alt={user.name}
                src={"/assets/animal_icons/" + user.name + ".svg"}
                sx={{ bgcolor: user.color }}
              />
            </Badge>
          </ListItemAvatar> */}

          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              variant="dot"
              className={lastActiveDiff < 120 ? "active" : "idle"}
            >
              <Box
                sx={{
                  border: `3px solid ${getRingColor(user.opinion)}`,
                  borderRadius: "50%",
                  p: "2px", // padding to make room for the border
                }}
              >
                <Avatar
                  alt={user.name}
                  src={`/assets/animal_icons/${user.name}.svg`}
                  sx={{ bgcolor: user.color }}
                />
              </Box>
            </Badge>
          </ListItemAvatar>

          <ListItemText
            primary={user.name === self.name ? user.name + " (You)" : user.name}
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lastActiveDiff < 120 ? "Active" : "Idle"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stance: {getStanceLabel(user.opinion)}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      );
    });
  }

  function showNewRoomModal() {
      setNewRoomOpen(true);
  }

  function handleClose() {
    setNewRoomOpen(false);
  }
  function handleCancelTimeout() {
    player.set("resetInactivity", new Date().getTime());
    // setTimeoutAlert(false);
  }
  function handleCreateRoom() {
    player.set("createRoom", new Date());
    setNewRoomOpen(false);
  }
  function handleCopySuggestion() {
    const messageContent = stageName == "intro" ? "This is an AI-generated message!" : suggestion.content;
    document.querySelector("textarea:not([readonly])").value = messageContent;
    let currentDrafts = drafts;
    currentDrafts[viewingRoom] = messageContent;
    setDrafts(currentDrafts);
    setReceivedCompletion(false);
    player.set("acceptSuggestion", true);
  }
  function handleSendSuggestion() {
    const messageContent = stageName == "intro" ? "This is an AI-generated message!" : suggestion.content;
    game.set("chatChannel-" + activeRoom, [
      ...messages,
      {
        content: messageContent,
        dt: new Date().getTime(),
        sender: participantIdx.toString(),
      },
    ]);
    player.set("acceptSuggestion", true);
    setReceivedCompletion(false);
    player.set("sendMsg", {
      sender: participantIdx.toString(),
      dt: new Date().getTime(),
      content: messageContent,
    });

    document.querySelector("textarea:not([readonly])").value = "";
    let currentDrafts = drafts;
    currentDrafts[viewingRoom] = "";
    setDrafts(currentDrafts);
  }

  // Get the current room title safely
  const currentRoom = rooms[viewingRoom] || { title: "Loading..." };

  return (
    <Stack
      sx={{ height: "100%", width: "100%", overflow: "auto" }}
      direction={"row"}
      className="chatRoom"
    >
      {/* Chat Rooms */}
      <Container className="msgLeft">
        <Typography variant="body1" className="headerTxt">
          Chat rooms
        </Typography>
        <List dense={false} className="roomList">
          {generateRoomListItems(rooms)}
        </List>
        <Button 
          className="newRoomButton" 
          onClick={showNewRoomModal}
          disabled={roomLocked}
        >
          Create new room <AddIcon />
        </Button>
      </Container>
      {/* Chat Window */}
      <Container
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
        }}
        className="chatWindow"
      >
        {/* Header */}
        <Container className="msgHeader" sx={{ alignItems: "center" }}>
          <Stack direction={"row"} sx={{ alignItems: "center" }}>
            <TagIcon />
            <b>{currentRoom.title}</b>
          </Stack>
          <Stack direction={"row"} sx={{ alignItems: "center" }} gap={1}>
            <Button
              onClick={joinRoom}
              variant="outlined"
              className={activeRoom == viewingRoom || roomLocked ? "hidden" : ""}
            >
              Join
            </Button>
          </Stack>
        </Container>
        {/* Message List */}
        <Container sx={{ height: "100%", flexShrink: 1, overflow: "auto" }}>
          <ChatContainer style={{ height: "100%", overflow: "scroll" }}>
            <MessageList>{renderMessages(messages)}</MessageList>
          </ChatContainer>
        </Container>
        {/* Footer */}
        <Container sx={{ display: "flex" }} className="msgFooter">
          <TextField
            className="msgText"
            placeholder={canSendMessages ? "Message #chat" : "Messaging is disabled during transition period"}
            variant="outlined"
            onChange={handleMsgChange}
            onKeyDownCapture={handleKeyDown}
            helperText={canSendMessages ? "Shift + Return to add a new line" : "You can message again when the next round starts"}
            multiline
            disabled={!canSendMessages}
            slotProps={{ input: { sx: { borderRadius: "2em" } } }}
          />
          <Tooltip
            open={tooltipOpen}
            onOpen={() => setTooltipOpen(true)}
            onClose={() => setTooltipOpen(false)}
            title={
              !canSendMessages
                ? "Messaging is disabled during transition period"
                : viewingRoom != activeRoom
                ? "You must join the room to send a message"
                : ""
            }
          >
            <span>
              <IconButton
                variant="plain"
                sx={{ minWidth: "2.5em", ml: "0.5em" }}
                disabled={viewingRoom != activeRoom || !canSendMessages}
                onClick={handleSend}
              >
                <SendRounded />
              </IconButton>
            </span>
          </Tooltip>
        </Container>
        {(stageName === "intro" &&
        viewingRoom === activeRoom &&
        player.get("joinedRooms")?.includes(viewingRoom) &&
        gameParams.condition !== "control" &&
        messages.some(msg => msg.sender === participantIdx.toString())) ? (
        <Container
          sx={{ p: "0em 1em 1em 1em !important", display: "flex" }}
        >
          <div className="suggestion" onClick={handleCopySuggestion}>
            This is an AI-generated message!
          </div>
          <span>
            <IconButton
              variant="plain"
              sx={{ minWidth: "2.5em", ml: "0.5em" }}
              disabled={viewingRoom !== activeRoom || !canSendMessages}
              onClick={handleSendSuggestion}
            >
              <SendRounded />
            </IconButton>
          </span>
        </Container>
      ) : (
        stageName !== "intro" &&
        gameParams.condition !== "control" 
        // && messages.some(msg => msg.sender === participantIdx.toString()) 
        ? (
          <Container
            sx={{ p: "0em 1em 1em 1em !important", display: "flex" }}
          >
            {suggestion && suggestion.content && suggestion.content !== "" && (
              <div className="suggestion" onClick={handleCopySuggestion}>
                {typeof suggestion.content === "object"
                  ? JSON.stringify(suggestion.content)
                  : suggestion.content}
              </div>
            )}
            <span>
              <IconButton
                variant="plain"
                sx={{ minWidth: "2.5em", ml: "0.5em" }}
                disabled={viewingRoom !== activeRoom || !canSendMessages}
                onClick={handleSendSuggestion}
              >
                <SendRounded />
              </IconButton>
            </span>
          </Container>
        ) : null
      )}
      </Container>
      {/* Active Users */}
      <Container
        className="msgRight"
        sx={{ height: "100%", width: "100%", alignContent: "center", m: 0 }}
      >
        <Typography
          variant="body1"
          className={
            viewingRoom == activeRoom ? "hidden headerTxt" : "headerTxt"
          }
        >
          You
        </Typography>
        <List
          className={viewingRoom == activeRoom ? "hidden userList" : "userList"}
        >
          <ListItem key="self">
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                variant="dot"
                className={
                  selfLastActiveDiff < gameParams.inactivityWarning
                    ? "active"
                    : "idle"
                }
              >
                <Avatar
                  alt={self.name}
                  src={"/assets/animal_icons/" + self.name + ".svg"}
                  sx={{ bgcolor: self.color }}
                />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={self.name}
              secondary={
                selfLastActiveDiff < gameParams.inactivityWarning
                  ? "Active"
                  : "Idle"
              }
            />
          </ListItem>
        </List>
        <Typography variant="body1" className="headerTxt">
          Participants in room
        </Typography>
        <List className="userList" dense={false}>
          {generateUserListItems()}
        </List>
      </Container>
      <Dialog
        open={newRoomOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will create a new chat room where you and a chatbot moderator
            will be the only members.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateRoom} autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={
          stageName.includes("group-discussion") &&
          selfLastActiveDiff > gameParams.inactivityWarning
        }
        onClose={handleCancelTimeout}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Timeout Warning!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will be kicked from this study without pay if you remain
            inactive for{" "}
            {Math.floor(gameParams.inactivityMax - selfLastActiveDiff)} more
            seconds.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTimeout} autoFocus>
            I'm Still Here
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
