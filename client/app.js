const socket=io();

const auth=document.getElementById("auth");
const app=document.getElementById("app");

const usersDiv=document.getElementById("users");
const messages=document.getElementById("messages");
const text=document.getElementById("text");

const title=document.getElementById("title");
const error=document.getElementById("error");

const u=document.getElementById("u");
const p=document.getElementById("p");
const c=document.getElementById("c");

let stage=0;
let exists=false;
let me="";
let to="";

// ===== AUTH =====

function parseJwt(t){
 const b=t.split(".")[1];
 const bytes=Uint8Array.from(atob(b),c=>c.charCodeAt(0));
 return JSON.parse(new TextDecoder("utf-8").decode(bytes));
}

const token=localStorage.getItem("token");

if(token){
 fetch("/auth/me",{headers:{Authorization:"Bearer "+token}})
 .then(r=>r.json())
 .then(d=>{
  me=d.username;
  auth.hidden=true;
  app.hidden=false;
  loadUsers();
 });
}

async function next(){

 error.innerText="";

 if(stage===0){
  const r=await fetch("/auth/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value})});
  const d=await r.json();
  exists=d.exists;
  title.innerText=exists?"Enter password":"Create password";
  p.hidden=false;
  if(!exists)c.hidden=false;
  stage=1;
  return;
 }

 const url=exists?"/auth/login":"/auth/register";

 const r=await fetch(url,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username:u.value,password:p.value})
 });

 const d=await r.json();

 if(d.error){error.innerText=d.error;return;}

 localStorage.setItem("token",d.token);
 me=parseJwt(d.token).username;

 auth.hidden=true;
 app.hidden=false;

 loadUsers();
}

// ===== USERS =====

async function loadUsers(){
 const u=await fetch("/users").then(r=>r.json());
 usersDiv.innerHTML="";
 u.forEach(x=>{
  if(x.username!==me){
   const d=document.createElement("div");
   d.className="user";
   d.innerText=x.username;
   d.onclick=()=>{to=x.username;loadChat();}
   usersDiv.appendChild(d);
  }
 });
}

// ===== CHAT =====

async function loadChat(){
 messages.innerHTML="";
 const chat=[me,to].sort().join("_");
 const m=await fetch("/messages/"+chat).then(r=>r.json());
 m.forEach(draw);
}

function draw(m){
 const d=document.createElement("div");
 d.className="msg"+(m.from===me?" me":"");
 d.innerText=m.text;
 messages.appendChild(d);
 messages.scrollTop=999999;
}

function send(){
 if(!to||!text.value)return;
 socket.emit("send",{from:me,to,text:text.value});
 text.value="";
}

socket.on("message",m=>{
 if([m.from,m.to].includes(me))draw(m);
});
