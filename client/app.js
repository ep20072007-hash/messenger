const auth=document.getElementById("auth");
const title=document.getElementById("title");
const error=document.getElementById("error");

const u=document.getElementById("u");
const p=document.getElementById("p");
const c=document.getElementById("c");

let stage=0;
let exists=false;

// AUTO LOGIN
const token=localStorage.getItem("token");

if(token){
 fetch("/profile",{headers:{Authorization:"Bearer "+token}})
 .then(r=>r.json())
 .then(showProfile)
 .catch(()=>localStorage.clear());
}

function showProfile(profile){

 document.body.innerHTML=`
 <div style="background:#0e1621;color:white;height:100vh;padding:20px">

 <h2>${profile.username}</h2>

 <input id="search" placeholder="Find users">
 <button onclick="find()">Search</button>

 <h3>Results</h3>
 <div id="results"></div>

 <h3>Friend requests</h3>
 <div id="requests"></div>

 <h3>Friends</h3>
 <div id="friends"></div>

 <button onclick="logout()">Logout</button>

 </div>
 `;

 loadFriends(profile.username);
}

function logout(){
 localStorage.clear();
 location.reload();
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

 if(!exists && p.value!==c.value){
  error.innerText="Passwords do not match";
  return;
 }

 const url=exists?"/auth/login":"/auth/register";

 const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value,password:p.value})});
 const d=await r.json();

 if(d.error){error.innerText=d.error;return;}

 localStorage.setItem("token",d.token);
 showProfile(d.profile);
}

// FRIENDS

async function find(){
 const v=document.getElementById("search").value;
 const r=await fetch("/search/"+v);
 const d=await r.json();

 const res=document.getElementById("results");
 res.innerHTML="";
 d.forEach(x=>{
  res.innerHTML+=`${x.username} <button onclick="addFriend('${x.username}')">Add</button><br>`;
 });
}

async function addFriend(user){
 await fetch("/friend/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({from:u.value,to:user})});
}

async function loadFriends(me){
 const r=await fetch("/friends/"+me);
 const d=await r.json();

 const f=document.getElementById("friends");
 const req=document.getElementById("requests");

 f.innerHTML="";
 req.innerHTML="";

 d.friends.forEach(x=>f.innerHTML+=x+"<br>");
 d.requests.forEach(x=>req.innerHTML+=`${x} <button onclick="accept('${x}')">Accept</button><br>`);
}

async function accept(user){
 await fetch("/friend/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({me:u.value,user})});
 loadFriends(u.value);
}
