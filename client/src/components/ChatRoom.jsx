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
  const suggestion = player.get("suggestedReply") || {
    content: "AI Suggestion",
  };
  const participantIdx = player.get("participantIdx");
  const participantStep = player.get("step") || "";
  const viewingRoom = player.get("viewingRoom") || 0;
  const activeRoom = player.get("activeRoom");
  const [newRoomOpen, setNewRoomOpen] = React.useState(false);
  const rooms = game.get("chatRooms") || [{ id: 0, title: "tutorial-room" }];
  const chatParticipants = game.get("chatParticipants");
  const messages = game.get("chatChannel-" + viewingRoom) || [];
  const [drafts, setDrafts] = useState({});
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [receivedCompletion, setReceivedCompletion] = useState(false);
  let self = {};

  for (const idx in chatParticipants) {
    if (idx == participantIdx) {
      self = chatParticipants[idx];
    }
  }

  const selfLastActiveDiff = (new Date().getTime() - self.active) / 1000;
  if (
    participantStep == "group-discussion" &&
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

  if (stageName == "intro" && player.get("passedTutorialMessage")) {
    messages.push({
      content: "Hello world",
      sender: player.get("participantIdx").toString(),
      dt: new Date().getTime(),
    });
  }

  useEffect(() => {
    document.querySelector("textarea:not([readonly])").value =
      drafts[viewingRoom];
  }, [viewingRoom]);

  useEffect(() => {
    setReceivedCompletion(false);
    // // Request AI assistance for every new message
    // console.log('received message');
    // if (stageName == 'group-discussion' && messages[messages.length - 1].sender != participantIdx) {
    //   console.log('requesting assistance');
    //   player.set("requestAIAssistance", { id: player.get("gtID") + 1 });
    // }
  }, [messages]);

  useEffect(() => {
    if (suggestion.id > player.get("lastRequestID")) {
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
    if (stageName == "group-discussion") {
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
            sender={chatParticipants[msg.sender].name}
            sentTime={new Date(msg.dt).toLocaleTimeString("en-us")}
          />
          <ChatAvatar
            alt={chatParticipants[msg.sender].name}
            src={
              msg.sender == "-1"
                ? "/assets/ai0.svg"
                : "/assets/animal_icons/" +
                  chatParticipants[msg.sender].name +
                  ".svg"
            }
            style={{ backgroundColor: chatParticipants[msg.sender].color }}
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
      if (
        participantStep == "group-discussion" &&
        chatParticipants[idx].room == viewingRoom
      ) {
        roomParticipants.push(chatParticipants[idx]);
      } else if (
        chatParticipants[idx].room == viewingRoom &&
        idx == participantIdx
      ) {
        roomParticipants.push(chatParticipants[idx]);
      }
      // else if (participantStep != "group-discussion" &&
      //   idx == participantIdx) {
      //   roomParticipants.push({
      //     name: 'tutorial-user',
      //     room: 0,
      //     color: 'pink',
      //     active: ''
      //   });
      // }
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
          <ListItemAvatar>
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
          </ListItemAvatar>
          <ListItemText
            primary={user.name == self.name ? user.name + " (You)" : user.name}
            secondary={lastActiveDiff < 120 ? "Active" : "Idle"}
          />
        </ListItem>
      );
    });
  }

  function showNewRoomModal() {
    if (participantStep == "group-discussion") {
      setNewRoomOpen(true);
    }
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
    document.querySelector("textarea:not([readonly])").value =
      suggestion.content;
    let currentDrafts = drafts;
    currentDrafts[viewingRoom] = suggestion.content;
    setDrafts(currentDrafts);
    setReceivedCompletion(false);
  }
  function handleSendSuggestion() {
    game.set("chatChannel-" + activeRoom, [
      ...messages,
      {
        content: suggestion.content,
        dt: new Date().getTime(),
        sender: participantIdx.toString(),
      },
    ]);

    setReceivedCompletion(false);
    player.set("sendMsg", {
      sender: participantIdx.toString(),
      dt: new Date().getTime(),
      content: suggestion.content,
    });

    document.querySelector("textarea:not([readonly])").value = "";
    let currentDrafts = drafts;
    currentDrafts[viewingRoom] = "";
    setDrafts(currentDrafts);
  }

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
        <Button className="newRoomButton" onClick={showNewRoomModal}>
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
            <b>{rooms[viewingRoom].title}</b>
          </Stack>
          <Stack direction={"row"} sx={{ alignItems: "center" }} gap={1}>
            <Button
              onClick={joinRoom}
              variant="outlined"
              className={activeRoom == viewingRoom ? "hidden" : ""}
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
            placeholder="Message #chat"
            variant="outlined"
            onChange={handleMsgChange}
            onKeyDownCapture={handleKeyDown}
            helperText="Shift + Return to add a new line"
            multiline
            slotProps={{ input: { sx: { borderRadius: "2em" } } }}
          />
          <Tooltip
            open={tooltipOpen}
            onOpen={() => setTooltipOpen(true)}
            onClose={() => setTooltipOpen(false)}
            title={
              viewingRoom != activeRoom
                ? "You must join the room to send a message"
                : ""
            }
          >
            <span>
              <IconButton
                variant="plain"
                sx={{ minWidth: "2.5em", ml: "0.5em" }}
                disabled={viewingRoom != activeRoom}
                onClick={handleSend}
              >
                <SendRounded />
              </IconButton>
            </span>
          </Tooltip>
        </Container>
        <Container
          sx={{
            p: "0em 1em 1em 1em !important",
            display: receivedCompletion ? "flex" : "none",
          }}
        >
          <div className="suggestion" onClick={handleCopySuggestion}>
            {suggestion.content}
          </div>
          <span>
            <IconButton
              variant="plain"
              sx={{ minWidth: "2.5em", ml: "0.5em" }}
              disabled={viewingRoom != activeRoom}
              onClick={handleSendSuggestion}
            >
              <SendRounded />
            </IconButton>
          </span>

          {/* <div className={suggestionClass}>
        <span onClick={handleSuggestionClick}>Suggestion (click to copy)</span>
        <div className="input-wrapper">
          <div onClick={handleSuggestionClick}>{autocompleteOptions[0]}</div>
        </div>
        <IconButton variant="plain" onClick={handleSendSuggestion}>
          <SendRounded />
        </IconButton>
      </div> */}
        </Container>
        {/* <Button onClick={requestCompletion}>Request Completion</Button> */}
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
          stageName == "group-discussion" &&
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
