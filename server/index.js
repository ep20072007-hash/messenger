mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("Mongo connected"))
.catch(e=>console.error("Mongo error",e));
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

const SECRET="telegram_clone_secret";

function makeToken(user){
 return jwt.sign({id:user._id,username:user.username},SECRET,{expiresIn:"7d"});
}

// ===== AUTH =====

app.post("/auth/check",async(req,res)=>{
 const u=await User.findOne({username:req.body.username});
 res.json({exists:!!u});
});

app.post("/auth/register",async(req,res)=>{
 const hash=await bcrypt.hash(req.body.password,12);
 const u=await User.create({username:req.body.username,password:hash});
 res.json({token:makeToken(u),username:u.username});
});

app.post("/auth/login",async(req,res)=>{
 const u=await User.findOne({username:req.body.username});
 if(!u) return res.json({error:"User not found"});
 if(!await bcrypt.compare(req.body.password,u.password))
  return res.json({error:"Wrong password"});
 res.json({token:makeToken(u),username:u.username});
});

app.get("/auth/me",(req,res)=>{
 try{
  res.json(jwt.verify(req.headers.authorization.split(" ")[1],SECRET));
 }catch{
  res.sendStatus(401);
 }
});

// ===== USERS LIST =====

app.get("/users",async(req,res)=>{
 res.json(await User.find({}, "username"));
});

// ===== MESSAGES =====

app.get("/messages/:chat",async(req,res)=>{
 res.json(await Message.find({chat:req.params.chat}));
});

// ===== SOCKET =====

io.on("connection",socket=>{

 socket.on("send",async m=>{
  m.chat=[m.from,m.to].sort().join("_");
  await Message.create(m);
process.on("uncaughtException",e=>console.error(e));
process.on("unhandledRejection",e=>console.error(e));
  io.emit("message",m);
 });

});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>console.log("SERVER",PORT));
process.on("uncaughtException",e=>console.error(e));
process.on("unhandledRejection",e=>console.error(e));

