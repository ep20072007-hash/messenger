const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

mongoose.connect(process.env.MONGO_URL);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
    friends: [String],
  })
);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    from: String,
    to: String,
    text: String,
    time: Date,
  })
);

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username })) return res.send("exists");
  await User.create({ username, password, friends: [] });
  res.send("ok");
});

// LOGIN
app.post("/login", async (req, res) => {
  const u = await User.findOne(req.body);
  res.json(u);
});

// USERS
app.get("/users", async (req, res) => {
  res.json(await User.find());
});

// ADD FRIEND
app.post("/add", async (req, res) => {
  const { me, friend } = req.body;
  await User.updateOne({ username: me }, { $addToSet: { friends: friend } });
  await User.updateOne({ username: friend }, { $addToSet: { friends: me } });
  res.send("ok");
});

// LOAD CHAT
app.get("/chat/:a/:b", async (req, res) => {
  res.json(
    await Message.find({
      $or: [
        { from: req.params.a, to: req.params.b },
        { from: req.params.b, to: req.params.a },
      ],
    })
  );
});

// SOCKET
io.on("connection", (socket) => {
  socket.on("send", async (m) => {
    await Message.create({ ...m, time: new Date() });
    io.emit("msg", m);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("SERVER STARTED"));
