const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cors=require("cors");
const path=require("path");

const User=require("./models/User");

mongoose.connect(process.env.MONGO_URL);

const app=express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../client")));

const SECRET="telegram_clone_secret";

function makeToken(user){
 return jwt.sign(
  {id:user._id,username:user.username},
  SECRET,
  {expiresIn:"7d"}
 );
}

// STEP 1 — check username
app.post("/auth/check",async(req,res)=>{
 const {username}=req.body;
 const u=await User.findOne({username});
 res.json({exists:!!u});
});

// STEP 2a — register
app.post("/auth/register",async(req,res)=>{
 const {username,password}=req.body;

 if(!username||!password)
  return res.json({error:"Missing fields"});

 if(await User.findOne({username}))
  return res.json({error:"User already exists"});

 const hash=await bcrypt.hash(password,12);
 const u=await User.create({username,password:hash});

 res.json({token:makeToken(u),username});
});

// STEP 2b — login
app.post("/auth/login",async(req,res)=>{
 const {username,password}=req.body;

 const u=await User.findOne({username});
 if(!u) return res.json({error:"User not found"});

 if(!await bcrypt.compare(password,u.password))
  return res.json({error:"Wrong password"});

 res.json({token:makeToken(u),username});
});

// check token
app.get("/auth/me",async(req,res)=>{
 try{
  const h=req.headers.authorization;
  if(!h) throw 0;
  res.json(jwt.verify(h.split(" ")[1],SECRET));
 }catch{
  res.sendStatus(401);
 }
});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log("SERVER",PORT));
