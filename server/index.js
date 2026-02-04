const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// 👉 подключаем папку client
app.use(express.static(path.join(__dirname, "../client")));

// 👉 MongoDB
mongoose.connect("mongodb+srv://ep20072007_db_user:UtYi8bCqJn1zQ4am@cluster0.xu1dyy.mongodb.net/messenger");

// ===== MODELS =====

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String
  })
);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    chatId: String,
    from: String,
    to: String,
    text: String
  })
);

// ===== ROUTES =====

// login
app.post("/login", async (req, res) => {
  let u = await User.findOne(req.body);
  if (!u) u = await User.create(req.body);
  res.json(u);
});

// users
app.get("/users", async (req, res) => {
  res.json(await User.find());
});

// messages
app.get("/messages/:chatId", async (req, res) => {
  res.json(await Message.find({ chatId: req.params.chatId }));
});

// ===== SOCKET =====

io.on("connection", socket => {
  socket.on("send", async m => {
    m.chatId = [m.from, m.to].sort().join("-");
    await Message.create(m);
    io.emit(m.chatId, m);
  });
});

// ===== START SERVER =====

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER STARTED ON " + PORT);
});
