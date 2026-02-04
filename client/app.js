let token=localStorage.getItem("token");
let me=localStorage.getItem("username");

if(token){
 fetch("/me",{headers:{Authorization:"Bearer "+token}})
 .then(r=>{
  if(r.ok){
   alert("Auto login as "+me);
  }else{
   localStorage.clear();
  }
 });
}

async function auth(){

 const r=await fetch("/auth/start",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
   username:u.value,
   password:p.value
  })
 });

 const d=await r.json();

 if(d.status==="bad"){
  alert("Wrong password");
  return;
 }

 token=d.token;
 me=d.username;

 localStorage.setItem("token",token);
 localStorage.setItem("username",me);

 alert("Logged in as "+me);
}
