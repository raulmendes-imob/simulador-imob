// guard.js
// Proteção de páginas privadas com validade de acesso

import { onAuthStateChanged } from
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

    // Documento não existe
    if (!userSnap.exists()) {
      await auth.signOut();
      window.location.href = "/simulador-imob/app/login.html";
      return;
    }

    const userData = userSnap.data();

    // 3️⃣ Status inválido
    if (userData.status !== "active") {
      await auth.signOut();
      window.location.href = "/simulador-imob/app/login.html";
      return;
    }

    // 4️⃣ Verificar validade do acesso
    const now = new Date();
    const accessUntil = userData.accessUntil.toDate();

    if (accessUntil < now) {
  await auth.signOut();
  window.location.href =
    "/simulador-imob/app/login.html?expired=1";
  return;
   }


    // ✅ Acesso válido → deixa seguir

  } catch (err) {
    console.error("Erro no guard:", err);
    await auth.signOut();
    window.location.href = "/simulador-imob/app/login.html";
  }
});
