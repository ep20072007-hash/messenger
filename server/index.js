const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cors=require("cors");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");

const User=require("./models/User");

mongoose.connect(process.env.MONGO_URL);

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../client")));

const SECRET="super_secret_key";

function auth(req,res,next){
 const h=req.headers.authorization;
 if(!h) return res.sendStatus(401);
 try{
  req.user=jwt.verify(h.split(" ")[1],SECRET);
  next();
 }catch{
  res.sendStatus(401);
 }
}

app.post("/auth/start",async(req,res)=>{
 const {username,password}=req.body;

 let u=await User.findOne({username});

 if(!u){
  const hash=await bcrypt.hash(password,12);
  u=await User.create({
   username,
   password:hash,
   lastLogin:new Date()
  });

  const token=jwt.sign({id:u._id,username},SECRET,{expiresIn:"7d"});
  return res.json({status:"new",token,username});
 }

 if(!await bcrypt.compare(password,u.password))
  return res.json({status:"bad"});

 u.lastLogin=new Date();
 await u.save();

 const token=jwt.sign({id:u._id,username},SECRET,{expiresIn:"7d"});

 res.json({status:"ok",token,username});
});

app.get("/me",auth,(req,res)=>{
 res.json(req.user);
});

io.on("connection",socket=>{});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>console.log("SERVER",PORT));
