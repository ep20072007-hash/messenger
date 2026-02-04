require("dotenv").config();

const express=require("express");
const http=require("http");
const cors=require("cors");
const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const multer=require("multer");
const {Server}=require("socket.io");

const User=require("./models/User");
const Message=require("./models/Message");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static("client"));
app.use("/uploads",express.static("uploads"));

mongoose.connect(process.env.MONGO_URL);

const upload=multer({dest:"uploads/"});
const SECRET="secret_vk";

app.post("/upload",upload.single("file"),(req,res)=>{
 res.json({url:"/uploads/"+req.file.filename});
});

// AUTH

app.post("/auth/login",async(req,res)=>{
 const u=await User.findOne({username:req.body.username});
 if(!u)return res.json({error:"Нет пользователя"});
 const ok=await bcrypt.compare(req.body.password,u.password);
 if(!ok)return res.json({error:"Неверный пароль"});
 res.json({profile:u});
});

app.post("/auth/register",async(req,res)=>{
 const h=await bcrypt.hash(req.body.password,10);
 const u=await User.create({username:req.body.username,password:h,friends:[],requests:[]});
 res.json({profile:u});
});

// FRIENDS

app.get("/search/:q",async(req,res)=>{
 res.json(await User.find({username:new RegExp(req.params.q,"i")},"username"));
});

app.post("/friend/request",async(req,res)=>{
 await User.updateOne({username:req.body.to},{$addToSet:{requests:req.body.from}});
 res.json({ok:true});
});

app.post("/friend/accept",async(req,res)=>{
 await User.updateOne({username:req.body.me},{$pull:{requests:req.body.user},$addToSet:{friends:req.body.user}});
 await User.updateOne({username:req.body.user},{$addToSet:{friends:req.body.me}});
 res.json({ok:true});
});

app.get("/friends/:u",async(req,res)=>{
 res.json(await User.findOne({username:req.params.u}));
});

// MESSAGES

app.get("/messages/:a/:b",async(req,res)=>{
 const chat=[req.params.a,req.params.b].sort().join("_");
 res.json(await Message.find({chat}).sort("time"));
});

io.on("connection",s=>{
 s.on("send",async m=>{
  m.chat=[m.from,m.to].sort().join("_");
  await Message.create(m);
  io.emit("message",m);
 });
});

server.listen(process.env.PORT||10000);
