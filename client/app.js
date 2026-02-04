const title = document.getElementById("title");
const error = document.getElementById("error");

const u = document.getElementById("u");
const p = document.getElementById("p");
const c = document.getElementById("c");

let stage = 0;
let exists = false;

// AUTO LOGIN
const token = localStorage.getItem("token");

if (token) {
 fetch("/auth/me", {
  headers: {
   Authorization: "Bearer " + token
  }
 }).then(r => {
  if (r.ok) {
   document.body.innerHTML = `
    <div style="color:white;text-align:center">
     <h2>Logged in as ${JSON.parse(atob(token.split(".")[1])).username}</h2>
     <p>Auth system ready.</p>
    </div>
   `;
  } else {
   localStorage.clear();
  }
 });
}

async function next() {

 error.innerText = "";

 if (!u.value.trim()) {
  error.innerText = "Username required";
  return;
 }

 // STEP 1 — CHECK USERNAME
 if (stage === 0) {

  const r = await fetch("/auth/check", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ username: u.value })
  });

  const d = await r.json();

  exists = d.exists;

  title.innerText = exists ? "Enter password" : "Create password";

  p.hidden = false;

  if (!exists) c.hidden = false;

  stage = 1;
  return;
 }

 // STEP 2 — LOGIN / REGISTER
 if (stage === 1) {

  if (!p.value) {
   error.innerText = "Password required";
   return;
  }

  if (!exists && p.value !== c.value) {
   error.innerText = "Passwords do not match";
   return;
  }

  const url = exists ? "/auth/login" : "/auth/register";

  const r = await fetch(url, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    username: u.value,
    password: p.value
   })
  });

  const d = await r.json();

  if (d.error) {
   error.innerText = d.error;
   return;
  }

  localStorage.setItem("token", d.token);

  document.body.innerHTML = `
   <div style="color:white;text-align:center">
    <h2>Welcome ${d.username}</h2>
    <p>Telegram-style auth completed.</p>
   </div>
  `;
 }
}
