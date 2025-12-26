import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = window.firebaseAuth;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/simulador-imob/app/login.html";
  }
});
