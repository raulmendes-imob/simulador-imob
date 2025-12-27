import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = window.firebaseAuth;
const db = window.firebaseDb;

const adminEmailEl = document.getElementById("adminEmail");
const tableBody = document.getElementById("usersTable");
const logoutBtn = document.getElementById("logoutBtn");

/* =========================
   AUTH + ROLE CHECK
   ========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists() || snap.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "/simulador-imob/app/login.html";
    return;
  }

  adminEmailEl.textContent = `Logado como: ${user.email}`;
  await loadUsers();
});

/* =========================
   LOAD USERS
   ========================= */
async function loadUsers() {
  tableBody.innerHTML = "";

  const usersSnap = await getDocs(collection(db, "users"));
  const now = new Date();

  usersSnap.forEach((docSnap) => {
    const u = docSnap.data();

    const accessUntil = u.accessUntil.toDate();
    const diffMs = accessUntil - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // 🔢 Dias restantes (coluna correta)
    let daysRemaining = diffDays;
    if (diffDays < 0) {
      daysRemaining = "Vencido";
    }

    // 📌 Situação
    let situation = "Ativo";
    let actions = [];

    if (u.status === "suspended") {
      situation = "Suspenso";
      actions.push(`<button data-action="reactivate" data-id="${docSnap.id}">Reativar</button>`);
    }
    else if (diffDays < 0) {
      situation = "Vencido";
      actions.push(`<button data-action="renew" data-id="${docSnap.id}">Renovar</button>`);
      actions.push(`<button data-action="suspend" data-id="${docSnap.id}">Suspender</button>`);
    }
    else {
      actions.push(`<button data-action="suspend" data-id="${docSnap.id}">Suspender</button>`);
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.status}</td>
      <td>${accessUntil.toLocaleDateString()}</td>
      <td>${daysRemaining}</td>
      <td>${situation}</td>
      <td>${actions.join(" ")}</td>
    `;

    tableBody.appendChild(tr);

    tr.querySelectorAll("button").forEach(btn => {
      const action = btn.dataset.action;
      const userId = btn.dataset.id;

      btn.addEventListener("click", () => {
        if (action === "renew") renewAccess(userId);
        if (action === "suspend") suspendUser(userId);
        if (action === "reactivate") reactivateUser(userId);
      });
    });
  });
}

/* =========================
   ACTIONS
   ========================= */

async function renewAccess(userId) {
  if (!confirm("Renovar acesso por mais 1 ano?")) return;

  const now = new Date();
  const oneYearLater = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate()
  );

  await updateDoc(doc(db, "users", userId), {
    accessUntil: Timestamp.fromDate(oneYearLater),
    status: "active"
  });

  await loadUsers();
}

async function suspendUser(userId) {
  if (!confirm("Suspender este usuário?")) return;

  await updateDoc(doc(db, "users", userId), {
    status: "suspended"
  });

  await loadUsers();
}

async function reactivateUser(userId) {
  if (!confirm("Reativar este usuário?")) return;

  await updateDoc(doc(db, "users", userId), {
    status: "active"
  });

  await loadUsers();
}

/* =========================
   LOGOUT
   ========================= */
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/simulador-imob/app/login.html";
});
