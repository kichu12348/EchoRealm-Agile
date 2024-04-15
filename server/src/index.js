const express = require("express");
const chalk = require("chalk");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const dotenv = require("dotenv");
const http = require("http");
const socketIO = require("socket.io");


dotenv.config();
console.clear();

const { connectMongo } = require("./database/mongoose");
connectMongo(process.env.MONGO_URI);

const routes = require("./routes/routes");
const port = 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/", (_req, res) => {
  res.send("Server is running!");
});

app.use("/api", routes);

server.listen(port, () => {
  console.log(`Server is running on port ${chalk.blue(port)}!`);
});

process.on("unhandledRejection", (error) => {
  console.error(error);
});

process.on("uncaughtException", (error) => {
  console.error(error);
});

let waitlist = [];

function generateRandomID() {
  let id = "";
  for (let i = 0; i < 36; i++) {
    const random = Math.floor(Math.random() * 10);
    if (i === 0 && random === 0) {
      i--;
      continue;
    }
    id += random;
  }
  return id;
}

function createRoom() {
  const roomID = generateRandomID();
  return roomID;
}

io.on("connection", (socket) => {
  socket.on("join", () => {
    // Check if the socket is already in the waitlist
    if (!waitlist.includes(socket)) {
      waitlist.push(socket);
    }

    // If theres only one user in the waitlist then return
    if (waitlist.length === 1) {
      return;
    }

    // Checks if there are at least two users in the waitlist
    if (waitlist.length >= 2) {
      // Randomly selects two users from the waitlist
      const randomIndex1 = Math.floor(Math.random() * waitlist.length);
      let randomIndex2;
      do {
        randomIndex2 = Math.floor(Math.random() * waitlist.length);
      } while (randomIndex2 === randomIndex1);
      const user1 = waitlist[randomIndex1];
      const user2 = waitlist[randomIndex2];
      if (!user1 || !user2) return;

      // Remove the selected users from the waitlist
      waitlist.splice(randomIndex1, 1);
      if (randomIndex1 < randomIndex2) {
        randomIndex2--;
      }
      waitlist.splice(randomIndex2, 1);

      // Creates a room and join the users to it
      const roomID = createRoom();
      user1.join(roomID);
      user2.join(roomID);

      // Emits a roomReady event to the selected users
      io.to(roomID).emit("roomReady", { id: roomID });
    }
  });

  // Handles the message event from the client and sends it to the room
  socket.on("message", (message) => {
    io.to(message.roomID).emit("newMessage", message);
  });

  socket.on('disconnecting',(roomID)=>{
    io.to(roomID).emit('otherUserDisconnected',roomID);
  })

  socket.on("disconnect", () => {

    const index = waitlist.indexOf(socket);
    if (index !== -1) {
      waitlist.splice(index, 1);
    }
  });
});
