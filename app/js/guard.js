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

// 🔁 Função centralizada de redirect
function redirectToLogin(reason = "") {
  const url = reason
    ? `/simulador-imob/app/login.html?${reason}=1`
    : `/simulador-imob/app/login.html`;

  // replace evita histórico e loops
  window.location.replace(url);
}

onAuthStateChanged(auth, async (user) => {

  // 1️⃣ Não logado
  if (!user) {
    redirectToLogin();
    return;
  }

  try {
    // 2️⃣ Buscar dados do usuário
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Documento não existe
    if (!userSnap.exists()) {
      await auth.signOut();
      redirectToLogin();
      return;
    }

    const userData = userSnap.data();

    // 3️⃣ Status inválido
    if (userData.status !== "active") {
      await auth.signOut();
      redirectToLogin();
      return;
    }

    // 4️⃣ Verificar validade do acesso
    const now = new Date();
    const accessUntil = userData.accessUntil.toDate();

    if (accessUntil < now) {
      await auth.signOut();
      redirectToLogin("expired");
      return;
    }

    // ✅ Acesso válido → segue normalmente

  } catch (err) {
    console.error("Erro no guard:", err);
    await auth.signOut();
    redirectToLogin();
  }
});
