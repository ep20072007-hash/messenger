const socket = io();

let me = "";
let current = "";

async function auth(){
me = user.value;
const password = pass.value;

let r = await fetch("/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username:me,password})
});

let u = await r.json();

if(!u){
await fetch("/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username:me,password})
});
}

login.hidden=true;
app.hidden=false;

loadUsers();
}

async function loadUsers(){
let r = await fetch("/users");
let users = await r.json();

users.forEach(u=>{
if(u.username!=me){
let d=document.createElement("div");
d.innerText=u.username;
d.onclick=()=>open(u.username);
usersDiv.append(d);
}
});
}

async function open(u){
current=u;
messages.innerHTML="";

let r=await fetch(`/chat/${me}/${u}`);
let msgs=await r.json();

msgs.forEach(show);
}

function send(){
socket.emit("send",{from:me,to:current,text:text.value});
text.value="";
}

socket.on("msg",m=>{
if(m.from==current||m.to==current) show(m);
});

function show(m){
let d=document.createElement("div");
d.innerText=m.from+": "+m.text;
messages.append(d);
}
