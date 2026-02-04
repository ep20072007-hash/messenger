const auth=document.getElementById("auth");
const app=document.getElementById("app");
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
  <div style="background:#0e1621;color:white;height:100vh;padding:40px">
   <h2>${profile.username}</h2>
   <p>${profile.bio||"No bio"}</p>
   <button onclick="logout()">Logout</button>
  </div>
 `;
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

 const endpoint=exists?"/auth/login":"/auth/register";

 const r=await fetch(endpoint,{
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
 showProfile(d.profile);
}
