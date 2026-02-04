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

// отдаём client
app.use(express.static(path.join(__dirname,"../client")));

// ================= MONGODB =================

mongoose.connect(
"mongodb+srv://ep20072007_db_user:123321qaz_@cluster0.xxu1dyy.mongodb.net/messenger?retryWrites=true&w=majority"
).then(()=>{
console.log("Mongo connected");
}).catch(e=>{
console.log(e);
});

// ================= MODELS =================

const User = mongoose.model("User",
new mongoose.Schema({
username:String
})
);

const Message = mongoose.model("Message",
new mongoose.Schema({
from:String,
to:String,
text:String,
chatId:String
})
);

// ================= SOCKET =================

io.on("connection",socket=>{

console.log("user connected");

socket.on("send",async m=>{
  m.chatId="global";
  await Message.create(m);
  io.emit("message",m);
});

});

// ================= START =================

const PORT = process.env.PORT || 10000;

server.listen(PORT,"0.0.0.0",()=>{
console.log("SERVER STARTED ON",PORT);
});
