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

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("Mongo connected"))
.catch(e=>console.error(e));

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../client")));

const SECRET="telegram_clone_secret";

function sign(u){
 return jwt.sign({id:u._id,username:u.username},SECRET,{expiresIn:"7d"});
}

// CHECK USERNAME
app.post("/auth/check",async(req,res)=>{
 const u=await User.findOne({username:req.body.username});
 res.json({exists:!!u});
});

// REGISTER
app.post("/auth/register",async(req,res)=>{
 const {username,password}=req.body;

 if(await User.findOne({username}))
  return res.json({error:"Username already taken"});

 const hash=await bcrypt.hash(password,12);

 const u=await User.create({username,password:hash});

 res.json({token:sign(u),profile:u});
});

// LOGIN
app.post("/auth/login",async(req,res)=>{
 const {username,password}=req.body;

 const u=await User.findOne({username});
 if(!u) return res.json({error:"User not found"});

 if(!await bcrypt.compare(password,u.password))
  return res.json({error:"Wrong password"});

 res.json({token:sign(u),profile:u});
});

// PROFILE
app.get("/profile",async(req,res)=>{
 try{
  const d=jwt.verify(req.headers.authorization.split(" ")[1],SECRET);
  const u=await User.findById(d.id);
  res.json(u);
 }catch{
  res.sendStatus(401);
 }
});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>console.log("SERVER",PORT));
