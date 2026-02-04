const auth=document.getElementById("auth");
const title=document.getElementById("title");
const error=document.getElementById("error");

const u=document.getElementById("u");
const p=document.getElementById("p");
const c=document.getElementById("c");

let stage=0;
let exists=false;
let currentUser=null;

// AUTO LOGIN
const token=localStorage.getItem("token");

if(token){
 fetch("/profile",{headers:{Authorization:"Bearer "+token}})
 .then(r=>r.json())
 .then(profile=>{
  currentUser=profile.username;
  renderPanel(profile);
 })
 .catch(()=>localStorage.clear());
}

async function next(){

 error.innerText="";

 if(stage===0){

  const r=await fetch("/auth/check",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({username:u.value})
  });

  const d=await r.json();

  exists=d.exists;

  title.innerText=exists?"Введите пароль":"Создайте пароль";

  p.hidden=false;
  if(!exists)c.hidden=false;

  stage=1;
  return;
 }

 if(!exists && p.value!==c.value){
  error.innerText="Пароли не совпадают";
  return;
 }

 const url=exists?"/auth/login":"/auth/register";

 const r=await fetch(url,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username:u.value,password:p.value})
 });

 const d=await r.json();

 if(d.error){
  error.innerText=d.error;
  return;
 }

 localStorage.setItem("token",d.token);
 currentUser=d.profile.username;

 renderPanel(d.profile);
}

// ================= UI =================

function renderPanel(profile){

 document.body.innerHTML=`
 <div class="panel">

  <div class="sidebar">
   <h3>${profile.username}</h3>
   <div class="small">Профиль</div>

   <div class="section">
    <input id="search" placeholder="Поиск людей">
    <button onclick="find()">Найти</button>
   </div>

   <div class="section">
    <b>Результаты</b>
    <div id="results"></div>
   </div>

   <div class="section">
    <b>Заявки</b>
    <div id="requests"></div>
   </div>

   <div class="section">
    <b>Друзья</b>
    <div id="friends"></div>
   </div>

   <div class="section">
    <button onclick="logout()">Выйти</button>
   </div>

  </div>

  <div class="main">
   <h2>Добро пожаловать</h2>
   <p class="small">Социальная панель (VK dark style)</p>
  </div>

 </div>
 `;

 loadFriends();
}

function logout(){
 localStorage.clear();
 location.reload();
}

// ================= FRIENDS =================

async function find(){

 const v=document.getElementById("search").value;
 const r=await fetch("/search/"+v);
 const d=await r.json();

 const res=document.getElementById("results");
 res.innerHTML="";

 d.forEach(x=>{
  if(x.username!==currentUser){
   res.innerHTML+=`
    <div class="user">
     ${x.username}
     <button onclick="addFriend('${x.username}')">Добавить</button>
    </div>
   `;
  }
 });
}

async function addFriend(user){

 await fetch("/friend/request",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
   from:currentUser,
   to:user
  })
 });

 loadFriends();
}

async function loadFriends(){

 const r=await fetch("/friends/"+currentUser);
 const d=await r.json();

 const f=document.getElementById("friends");
 const req=document.getElementById("requests");

 f.innerHTML="";
 req.innerHTML="";

 d.friends.forEach(x=>{
  f.innerHTML+=`<div class="user">${x}</div>`;
 });

 d.requests.forEach(x=>{
  req.innerHTML+=`
   <div class="user">
    ${x}
    <button onclick="accept('${x}')">Принять</button>
   </div>
  `;
 });
}

async function accept(user){

 await fetch("/friend/accept",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
   me:currentUser,
   user
  })
 });

 loadFriends();
}
