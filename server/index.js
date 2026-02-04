require("dotenv").config();

const express=require("express");
const http=require("http");
const cors=require("cors");
const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const {Server}=require("socket.io");

const User=require("./models/User");
const Message=require("./models/Message");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

mongoose.connect(process.env.MONGO_URL);

const SECRET="vk_dark_secret";

// ===== AUTH =====

app.post("/auth/check",async(req,res)=>{
 const u=await User.findOne({username:req.body.username});
 res.json({exists:!!u});
});

app.post("/auth/register",async(req,res)=>{

 const hash=await bcrypt.hash(req.body.password,10);

 const user=await User.create({
  username:req.body.username,
  password:hash,
  friends:[],
  requests:[]
 });

 const token=jwt.sign({username:user.username},SECRET);

 res.json({token,profile:user});
});

app.post("/auth/login",async(req,res)=>{

 const user=await User.findOne({username:req.body.username});
 if(!user)return res.json({error:"Пользователь не найден"});

 const ok=await bcrypt.compare(req.body.password,user.password);
 if(!ok)return res.json({error:"Неверный пароль"});

 const token=jwt.sign({username:user.username},SECRET);

 res.json({token,profile:user});
});

app.get("/profile",async(req,res)=>{
 const t=req.headers.authorization.split(" ")[1];
 const d=jwt.verify(t,SECRET);
 const u=await User.findOne({username:d.username});
 res.json(u);
});

// ===== FRIENDS =====

app.get("/search/:q",async(req,res)=>{
 res.json(await User.find({username:new RegExp(req.params.q,"i")},"username"));
});

app.post("/friend/request",async(req,res)=>{
 await User.updateOne({username:req.body.to},{$addToSet:{requests:req.body.from}});
 res.json({ok:true});
});

app.post("/friend/accept",async(req,res)=>{

 await User.updateOne({username:req.body.me},{
  $pull:{requests:req.body.user},
  $addToSet:{friends:req.body.user}
 });

 await User.updateOne({username:req.body.user},{
  $addToSet:{friends:req.body.me}
 });

 res.json({ok:true});
});

app.get("/friends/:u",async(req,res)=>{
 const u=await User.findOne({username:req.params.u});
 res.json(u);
});

// ===== MESSAGES =====

app.get("/messages/:a/:b",async(req,res)=>{

 const chat=[req.params.a,req.params.b].sort().join("_");

 res.json(await Message.find({chat}).sort("time"));
});

// SOCKET

io.on("connection",socket=>{

 socket.on("send",async m=>{

  m.chat=[m.from,m.to].sort().join("_");

  await Message.create(m);

  io.emit("message",m);
 });

});

server.listen(process.env.PORT||10000);
