const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"../client")));

mongoose.connect(process.env.MONGO_URL);

const User=mongoose.model("User",new mongoose.Schema({
username:String,
password:String
}));

const Message=mongoose.model("Message",new mongoose.Schema({
chat:String,
from:String,
to:String,
text:String,
time:{type:Date,default:Date.now}
}));

app.post("/register",async(req,res)=>{
const {username,password}=req.body;
if(await User.findOne({username})) return res.send("exist");
await User.create({username,password});
res.send("ok");
});

app.post("/login",async(req,res)=>{
const u=await User.findOne(req.body);
res.send(u?"ok":"bad");
});

app.get("/users",async(req,res)=>{
res.json(await User.find());
});

app.get("/messages/:chat",async(req,res)=>{
res.json(await Message.find({chat:req.params.chat}));
});

io.on("connection",socket=>{
socket.on("send",async m=>{
m.chat=[m.from,m.to].sort().join("-");
await Message.create(m);
io.emit("message",m);
});
});

server.listen(10000,()=>console.log("SERVER STARTED ON 10000"));
