// firebase.js
// Conexão com Firebase (GitHub Pages / JS puro)

// Importações via CDN (Firebase Web SDK v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRgqcoqBrDXgn717FUtm7MA1FhdDS9egM",
  authDomain: "simulador-imob.firebaseapp.com",
  projectId: "simulador-imob",
  storageBucket: "simulador-imob.firebasestorage.app",
  messagingSenderId: "22545693744",
  appId: "1:22545693744:web:7f43abf4bec7896f4241f5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Serviços que vamos usar
const auth = getAuth(app);
const db = getFirestore(app);

// Expor para o resto da aplicação (temporariamente)
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
