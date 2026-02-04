const socket=io();
let me=null,current=null;

async function login(){

 const r=await fetch("/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user.value,password:pass.value})});
 const d=await r.json();

 if(d.error)return alert(d.error);

 me=d.profile.username;

 login.hidden=true;
 app.hidden=false;

 route("chat");
}

async function register(){

 const r=await fetch("/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user.value,password:pass.value})});
 const d=await r.json();

 me=d.profile.username;

 login.hidden=true;
 app.hidden=false;

 route("chat");
}

function logout(){
 location.reload();
}

function showProfile(){
 view.innerHTML=`<h2>${me}</h2><p>SB Messenger Profile</p>`;
}

async function showFriends(){

 const r=await fetch("/friends/"+me);
 const d=await r.json();

 let h="<h2>Друзья</h2>";

 d.friends.forEach(u=>{
  h+=`<div onclick="openChat('${u}')">${u}</div>`;
 });

 h+="<h3>Заявки</h3>";

 d.requests.forEach(u=>{
  h+=`<div onclick="accept('${u}')">${u}</div>`;
 });

 view.innerHTML=h;
}

async function accept(u){
 await fetch("/friend/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({me,user:u})});
 showFriends();
}

function showChat(){

 view.innerHTML=`
 <div id="chatHeader"></div>
 <div id="messages"></div>
 <input id="text">
 <button onclick="send()">➤</button>
 `;
}

async function openChat(u){

 current=u;
 chatHeader.innerText=u;

 const r=await fetch("/messages/"+me+"/"+u);
 const d=await r.json();

 messages.innerHTML="";

 d.forEach(m=>{
  messages.innerHTML+=`<div>${m.text||""}</div>`;
 });
}

function send(){

 if(!current)return;

 socket.emit("send",{from:me,to:current,text:text.value});
 text.value="";
}

document.addEventListener("keydown",e=>{
 if(e.key==="Enter" && text)send();
});

socket.on("message",m=>{
 if([m.from,m.to].includes(me)&&[m.from,m.to].includes(current))openChat(current);
});
