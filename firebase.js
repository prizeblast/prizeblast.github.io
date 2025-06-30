// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrODtIccdMCUYFWIb0akMxKBdgAfOaKI4",
  authDomain: "prizeblast-fa513.firebaseapp.com",
  projectId: "prizeblast-fa513",
  storageBucket: "prizeblast-fa513.firebasestorage.app",
  messagingSenderId: "424508186262",
  appId: "1:424508186262:web:12b3a5576a86f7530eacb7",
  measurementId: "G-17LGQX0276"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Enregistrer ou mettre à jour un profil
export function saveProfile(pseudo, data) {
  return set(ref(db, 'joueurs/' + pseudo), data);
}

// Charger un profil
export function loadProfile(pseudo) {
  return get(child(ref(db), 'joueurs/' + pseudo)).then(snapshot => {
    if (snapshot.exists()) return snapshot.val();
    else return null;
  });
}

// Charger tous les profils
export function loadAllProfiles() {
  return get(child(ref(db), 'joueurs')).then(snapshot => {
    if (snapshot.exists()) return snapshot.val();
    else return {};
  });
}