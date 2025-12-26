// guard.js
// Proteção de páginas privadas

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = window.firebaseAuth;

// Aguarda o estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Usuário não logado → volta para login
   window.location.href = "/simulador-imob/app/login.html";
  }
  // Se estiver logado, segue normalmente
});
