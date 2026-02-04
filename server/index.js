const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cors=require("cors");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");

const User=require("./models/User");
const Message=require("./models/Message");

mongoose.connect(process.env.MONGO_URL);

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../client")));

const SECRET="telegramclone";

app.post("/register",async(req,res)=>{
 const {username,password}=req.body;
 if(await User.findOne({username})) return res.send("exist");
 const hash=await bcrypt.hash(password,10);
 await User.create({username,password:hash});
 res.send("ok");
});

app.post("/login",async(req,res)=>{
 const {username,password}=req.body;
 const u=await User.findOne({username});
 if(!u) return res.send("bad");
 if(!await bcrypt.compare(password,u.password)) return res.send("bad");
 const token=jwt.sign({username},SECRET);
 res.json({token,username});
});

app.get("/users",async(req,res)=>{
 res.json(await User.find());
});

app.get("/messages/:chat",async(req,res)=>{
 res.json(await Message.find({chat:req.params.chat}));
});

io.on("connection",socket=>{

 socket.on("online",async u=>{
  await User.updateOne({username:u},{online:true});
  io.emit("users",await User.find());
 });

 socket.on("send",async m=>{
  m.chat=[m.from,m.to].sort().join("_");
  await Message.create(m);
  io.emit("message",m);
 });

 socket.on("disconnect",()=>{});
});

server.listen(10000,()=>console.log("SERVER 10000"));
