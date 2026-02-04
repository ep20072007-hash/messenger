const title=document.getElementById("title");
const error=document.getElementById("error");

let exists=false;
let stage=0;

const token=localStorage.getItem("token");

if(token){
 fetch("/auth/me",{headers:{Authorization:"Bearer "+token}})
 .then(r=>{if(r.ok)location.reload();});
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

  title.innerText=exists?"Enter password":"Create password";

  p.hidden=false;
  if(!exists) c.hidden=false;

  stage=1;
  return;
 }

 if(stage===1){

  if(!exists && p.value!==c.value){
   error.innerText="Passwords do not match";
   return;
  }

  const url=exists?"/auth/login":"/auth/register";

  const r=await fetch(url,{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    username:u.value,
    password:p.value
   })
  });

  const d=await r.json();

  if(d.error){
   error.innerText=d.error;
   return;
  }

  localStorage.setItem("token",d.token);
  location.reload();
 }
}
