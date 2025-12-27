// guard.js
// Proteção de páginas privadas com validade e status de acesso

import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = window.firebaseAuth;
const db = window.firebaseDb;

onAuthStateChanged(auth, async (user) => {

  // 1️⃣ Não logado
  if (!user) {
    window.location.href = "/simulador-imob/app/login.html";
    return;
  }

  try {
    // 2️⃣ Buscar dados do usuário
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      window.location.href = "/simulador-imob/app/login.html";
      return;
    }

    const userData = userSnap.data();

    // 3️⃣ Conta suspensa
    if (userData.status === "suspended") {
      await signOut(auth);
      window.location.href =
        "/simulador-imob/app/login.html?suspended=1";
      return;
    }

    // 4️⃣ Conta inativa (fallback)
    if (userData.status !== "active") {
      await signOut(auth);
      window.location.href = "/simulador-imob/app/login.html";
      return;
    }

    // 5️⃣ Verificar validade
    const now = new Date();
    const accessUntil = userData.accessUntil.toDate();

    if (accessUntil < now) {
      await signOut(auth);
      window.location.href =
        "/simulador-imob/app/login.html?expired=1";
      return;
    }

    // ✅ Acesso válido → segue

  } catch (err) {
    console.error("Erro no guard:", err);
    await signOut(auth);
    window.location.href = "/simulador-imob/app/login.html";
  }
});
