const socket=io();

let me="",to="";

async function login(){
me=u.value;
let r=await fetch("/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value,password:p.value})});
if(await r.text()=="ok") start();
}

async function reg(){
await fetch("/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value,password:p.value})});
alert("registered");
}

function start(){
login.hidden=true;
app.hidden=false;
loadUsers();
}

async function loadUsers(){
let users=await fetch("/users").then(r=>r.json());
users.forEach(x=>{
if(x.username!==me){
let d=document.createElement("div");
d.className="user";
d.innerText=x.username;
d.onclick=()=>{to=x.username;load()};
usersDiv.appendChild(d);
}
});
}

async function load(){
let chat=[me,to].sort().join("-");
let m=await fetch("/messages/"+chat).then(r=>r.json());
messages.innerHTML="";
m.forEach(x=>{
let d=document.createElement("div");
d.className="msg"+(x.from==me?" me":"");
d.innerText=x.text;
messages.appendChild(d);
});
}

function send(){
socket.emit("send",{from:me,to,text:text.value});
text.value="";
}

socket.on("message",m=>{
if([m.from,m.to].includes(me)) load();
});
