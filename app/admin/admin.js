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

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists() || snap.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "/simulador-imob/app/login.html";
    return;
  }

  adminEmailEl.textContent = `Logado como: ${user.email}`;
  loadUsers();
});

/* =========================
   LOAD USERS
   ========================= */
async function loadUsers() {
  tableBody.innerHTML = "";

  const usersSnap = await getDocs(collection(db, "users"));
  const now = new Date();

  usersSnap.forEach(docSnap => {
    const u = docSnap.data();

    let situation = "Ativo";
    let actionHtml = "-";

    if (u.status !== "active") {
      situation = "Suspenso";
    } else if (u.accessUntil.toDate() < now) {
      situation = "Vencido";
      actionHtml = `<button data-id="${docSnap.id}">Renovar acesso</button>`;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.status}</td>
      <td>${u.accessUntil.toDate().toLocaleDateString()}</td>
      <td>${situation}</td>
      <td>${actionHtml}</td>
    `;

    tableBody.appendChild(tr);

    if (situation === "Vencido") {
      const btn = tr.querySelector("button");
      btn.addEventListener("click", () => renewAccess(docSnap.id));
    }
  });
}

/* =========================
   RENEW ACCESS (1 YEAR)
   ========================= */
async function renewAccess(userId) {
  const confirmRenew = confirm("Renovar acesso por mais 1 ano?");
  if (!confirmRenew) return;

  const now = new Date();
  const oneYearLater = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate()
  );

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    accessUntil: Timestamp.fromDate(oneYearLater),
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
