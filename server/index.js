const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// client folder
app.use(express.static(path.join(__dirname, "../client")));

// ================= MONGODB =================

mongoose
  .connect(
    "mongodb+srv://ep20072007_db_user:123321qaz_@cluster0.xxu1dyy.mongodb.net/messenger?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));

// ================= MODELS =================

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
  })
);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    chatId: String,
    from: String,
    to: String,
    text: String,
  })
);

// ================= ROUTES =================

// login
app.post("/login", async (req, res) => {
  let user = await User.findOne(req.body);
  if (!user) user = await User.create(req.body);
  res.json(user);
});

// users
app.get("/users", async (req, res) => {
  res.json(await User.find());
});

// messages
app.get("/messages/:chatId", async (req, res) => {
  res.json(await Message.find({ chatId: req.params.chatId }));
});

// ================= SOCKET =================

io.on("connection", (socket) => {
  socket.on("send", async (msg) => {
    msg.chatId = [msg.from, msg.to].sort().join("-");
    await Message.create(msg);
    io.emit(msg.chatId, msg);
  });
});

// ================= START =================

const PORT = process.env.PORT || 10000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER STARTED ON", PORT);
});
