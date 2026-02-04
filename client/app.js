console.log("APP LOADED");
const socket=io();

const usersDiv=document.getElementById("users");
const messages=document.getElementById("messages");
const text=document.getElementById("text");
const loginDiv=document.getElementById("login");
const app=document.getElementById("app");

let me="",to="";

async function login(){
 const r=await fetch("/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username:u.value,password:p.value})
 });

 const t = await r.text();

 if(t==="bad"){
  alert("Wrong login");
  return;
 }

 const d = JSON.parse(t);

 me=d.username;
 loginDiv.hidden=true;
 app.hidden=false;
 socket.emit("online",me);
 loadUsers();
}


async function reg(){
 await fetch("/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value,password:p.value})});
 alert("registered");
}

async function loadUsers(){
 const u=await fetch("/users").then(r=>r.json());
 usersDiv.innerHTML="";
 u.forEach(x=>{
  if(x.username!=me){
   let d=document.createElement("div");
   d.className="user";
   d.innerText=x.username+(x.online?" ●":"");
   d.onclick=()=>{to=x.username;load()};
   usersDiv.appendChild(d);
  }
 });
}

async function load(){
 messages.innerHTML="";
 const chat=[me,to].sort().join("_");
 const m=await fetch("/messages/"+chat).then(r=>r.json());
 m.forEach(draw);
}

function draw(x){
 let d=document.createElement("div");
 d.className="msg"+(x.from==me?" me":"");
 d.innerText=x.text;
 messages.appendChild(d);
 messages.scrollTop=999999;
}

function send(){
 if(!to)return;
 socket.emit("send",{from:me,to,text:text.value});
 text.value="";
}

socket.on("message",m=>{
 if([m.from,m.to].includes(me)) draw(m);
});
