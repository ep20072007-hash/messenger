const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cors=require("cors");
const path=require("path");

const User=require("./models/User");

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("Mongo connected"))
.catch(e=>console.error(e));

const app=express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../client")));

const SECRET="telegram_clone_secret";

function sign(u){
 return jwt.sign({username:u.username},SECRET,{expiresIn:"7d"});
}

// ===== AUTH =====

app.post("/auth/check",async(req,res)=>{
 const u=await User.findOne({username:req.body.username});
 res.json({exists:!!u});
});

app.post("/auth/register",async(req,res)=>{
 const {username,password}=req.body;

 if(await User.findOne({username}))
  return res.json({error:"Username taken"});

 const hash=await bcrypt.hash(password,10);
 const u=await User.create({username,password:hash});

 res.json({token:sign(u),profile:u});
});

app.post("/auth/login",async(req,res)=>{
 const {username,password}=req.body;

 const u=await User.findOne({username});
 if(!u) return res.json({error:"User not found"});

 if(!await bcrypt.compare(password,u.password))
  return res.json({error:"Wrong password"});

 res.json({token:sign(u),profile:u});
});

app.get("/profile",async(req,res)=>{
 try{
  const d=jwt.verify(req.headers.authorization.split(" ")[1],SECRET);
  const u=await User.findOne({username:d.username});
  res.json(u);
 }catch{
  res.sendStatus(401);
 }
});

// ===== FRIENDS =====

app.get("/search/:name",async(req,res)=>{
 res.json(await User.find({username:new RegExp(req.params.name,"i")},"username"));
});

app.post("/friend/request",async(req,res)=>{
 await User.updateOne({username:req.body.to},{$addToSet:{requests:req.body.from}});
 res.json({status:"ok"});
});

app.post("/friend/accept",async(req,res)=>{
 const {me,user}=req.body;

 await User.updateOne({username:me},{$pull:{requests:user},$addToSet:{friends:user}});
 await User.updateOne({username:user},{$addToSet:{friends:me}});

 res.json({status:"ok"});
});

app.get("/friends/:me",async(req,res)=>{
 const u=await User.findOne({username:req.params.me});
 res.json({friends:u.friends||[],requests:u.requests||[]});
});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log("SERVER",PORT));
