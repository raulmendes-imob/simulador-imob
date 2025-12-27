import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = window.firebaseAuth;
const db = window.firebaseDb;

const adminEmailEl = document.getElementById("adminEmail");
const tableBody = document.getElementById("usersTable");
const logoutBtn = document.getElementById("logoutBtn");

// 🔁 Verifica auth e role
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = db && (await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
  )).doc(db, "users", user.uid);

  const snap = await (await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
  )).getDoc(userRef);

  if (!snap.exists() || snap.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "/simulador-imob/app/login.html";
    return;
  }

  adminEmailEl.textContent = `Logado como: ${user.email}`;

  loadUsers();
});

// 🔹 Carregar usuários
async function loadUsers() {
  tableBody.innerHTML = "";

  const usersSnap = await getDocs(collection(db, "users"));

  const now = new Date();

  usersSnap.forEach(docSnap => {
    const u = docSnap.data();

    let situation = "Ativo";

    if (u.status !== "active") {
      situation = "Suspenso";
    } else if (u.accessUntil.toDate() < now) {
      situation = "Vencido";
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.status}</td>
      <td>${u.accessUntil.toDate().toLocaleDateString()}</td>
      <td>${situation}</td>
    `;

    tableBody.appendChild(tr);
  });
}

// 🔹 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/simulador-imob/app/login.html";
});
