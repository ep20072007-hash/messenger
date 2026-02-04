const socket=io();

let me=null,current=null;

async function login(){
 const r=await fetch("/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user.value,password:pass.value})});
 const d=await r.json();
 if(d.error)return err.innerText=d.error;
 init(d.profile);
}

async function register(){
 const r=await fetch("/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user.value,password:pass.value})});
 const d=await r.json();
 init(d.profile);
}

function init(p){
 me=p.username;
 login.hidden=true;
 app.hidden=false;
 document.getElementById("me").innerText=me;
 loadFriends();
}

async function loadFriends(){
 const r=await fetch("/friends/"+me);
 const d=await r.json();
 friends.innerHTML="";
 requests.innerHTML="";
 d.friends.forEach(u=>{
  const div=document.createElement("div");
  div.className="user";
  div.innerText=u;
  div.onclick=()=>openChat(u);
  friends.appendChild(div);
 });
 d.requests.forEach(u=>{
  const div=document.createElement("div");
  div.className="user";
  div.innerText="✓ "+u;
  div.onclick=()=>accept(u);
  requests.appendChild(div);
 });
}

async function accept(u){
 await fetch("/friend/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({me,user:u})});
 loadFriends();
}

search.oninput=async()=>{
 if(!search.value)return results.innerHTML="";
 const r=await fetch("/search/"+search.value);
 const d=await r.json();
 results.innerHTML="";
 d.forEach(u=>{
  const div=document.createElement("div");
  div.className="user";
  div.innerText="+ "+u.username;
  div.onclick=()=>add(u.username);
  results.appendChild(div);
 });
}

async function add(u){
 await fetch("/friend/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({from:me,to:u})});
}

async function openChat(u){
 current=u;
 chatName.innerText=u;
 const r=await fetch("/messages/"+me+"/"+u);
 const d=await r.json();
 messages.innerHTML="";
 d.forEach(m=>{
  messages.innerHTML+=`<div class="msg ${m.from===me?"me":""}">${m.text||""}${m.image?`<br><img src="${m.image}" width="200">`:""}</div>`;
 });
}

async function send(){
 if(!current)return;
 if(file.files[0]){
  const fd=new FormData();
  fd.append("file",file.files[0]);
  const r=await fetch("/upload",{method:"POST",body:fd});
  const d=await r.json();
  socket.emit("send",{from:me,to:current,image:d.url});
  file.value="";
  return;
 }
 socket.emit("send",{from:me,to:current,text:text.value});
 text.value="";
}

document.addEventListener("keydown",e=>{
 if(e.key==="Enter" && document.activeElement.id==="text")send();
});

socket.on("message",m=>{
 if([m.from,m.to].includes(me)&&[m.from,m.to].includes(current))openChat(current);
});
