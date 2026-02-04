const socket=io();

let me=null;
let current=null;

const u=document.getElementById("u");
const p=document.getElementById("p");
const c=document.getElementById("c");
const error=document.getElementById("error");
const title=document.getElementById("title");

let stage=0,exists=false;

async function next(){

 if(stage===0){

  const r=await fetch("/auth/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value})});
  exists=(await r.json()).exists;

  title.innerText=exists?"Введите пароль":"Создайте пароль";
  p.hidden=false;
  if(!exists)c.hidden=false;
  stage=1;
  return;
 }

 const url=exists?"/auth/login":"/auth/register";

 const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value,password:p.value})});
 const d=await r.json();

 if(d.error){error.innerText=d.error;return;}

 me=d.profile.username;

 render(d.profile);
}

function render(profile){

 document.body.innerHTML=`
 <div class="panel">

 <div class="left" id="friends"></div>

 <div class="chat">
  <div class="messages" id="messages"></div>
  <div class="send">
   <input id="text" style="flex:1">
   <button onclick="send()">➤</button>
  </div>
 </div>

 </div>
 `;

 loadFriends(profile.username);
}

async function loadFriends(u){

 const r=await fetch("/friends/"+u);
 const d=await r.json();

 const f=document.getElementById("friends");
 f.innerHTML="";

 d.friends.forEach(x=>{
  const div=document.createElement("div");
  div.className="user";
  div.innerText=x;
  div.onclick=()=>openChat(x);
  f.appendChild(div);
 });
}

async function openChat(u){

 current=u;
 loadChat();
}

async function loadChat(){

 const r=await fetch("/messages/"+me+"/"+current);
 const d=await r.json();

 const m=document.getElementById("messages");
 m.innerHTML="";

 d.forEach(x=>{
  m.innerHTML+=`<div class="msg ${x.from===me?"me":""}">${x.text}</div>`;
 });
}

function send(){

 socket.emit("send",{from:me,to:current,text:text.value});
 text.value="";
}

socket.on("message",m=>{
 if([m.from,m.to].includes(me)&&[m.from,m.to].includes(current)){
  loadChat();
 }
});
