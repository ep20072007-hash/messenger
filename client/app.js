const title = document.getElementById("title");
const error = document.getElementById("error");

const u = document.getElementById("u");
const p = document.getElementById("p");
const c = document.getElementById("c");

let stage = 0;
let exists = false;

/* ==========================
 JWT UTF8 DECODER (IMPORTANT)
========================== */

function parseJwt(token) {
 const base64 = token.split(".")[1];
 const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
 return JSON.parse(new TextDecoder("utf-8").decode(bytes));
}

/* ==========================
 AUTO LOGIN
========================== */

const token = localStorage.getItem("token");

if (token) {
 fetch("/auth/me", {
  headers: {
   Authorization: "Bearer " + token
  }
 }).then(async r => {
  if (r.ok) {
   const payload = parseJwt(token);

   document.body.innerHTML = `
    <div style="
     height:100vh;
     display:flex;
     align-items:center;
     justify-content:center;
     color:white;
     font-family:Arial;
     background:#0e1621;
     flex-direction:column;
    ">
     <h2>Logged in as ${payload.username}</h2>
     <p>Auth system ready.</p>
    </div>
   `;
  } else {
   localStorage.clear();
  }
 });
}

/* ==========================
 MAIN FLOW
========================== */

async function next() {

 error.innerText = "";

 const username = u.value.trim();

 if (!username) {
  error.innerText = "Username required";
  return;
 }

 /* STEP 1 — CHECK USER */

 if (stage === 0) {

  const r = await fetch("/auth/check", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ username })
  });

  const d = await r.json();

  exists = d.exists;

  title.innerText = exists ? "Enter password" : "Create password";

  p.hidden = false;
  if (!exists) c.hidden = false;

  stage = 1;
  return;
 }

 /* STEP 2 — LOGIN OR REGISTER */

 if (stage === 1) {

  if (!p.value) {
   error.innerText = "Password required";
   return;
  }

  if (!exists && p.value !== c.value) {
   error.innerText = "Passwords do not match";
   return;
  }

  const endpoint = exists ? "/auth/login" : "/auth/register";

  const r = await fetch(endpoint, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    username,
    password: p.value
   })
  });

  const d = await r.json();

  if (d.error) {
   error.innerText = d.error;
   return;
  }

  localStorage.setItem("token", d.token);

  const payload = parseJwt(d.token);

  document.body.innerHTML = `
   <div style="
    height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    color:white;
    font-family:Arial;
    background:#0e1621;
    flex-direction:column;
   ">
    <h2>Welcome ${payload.username}</h2>
    <p>Telegram-style auth completed.</p>
   </div>
  `;
 }
}
