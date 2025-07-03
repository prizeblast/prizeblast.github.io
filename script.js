import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrODtIccdMCUYFWIb0akMxKBdgAfOaKI4",
  authDomain: "prizeblast-fa513.firebaseapp.com",
  projectId: "prizeblast-fa513",
  storageBucket: "prizeblast-fa513.appspot.com",
  messagingSenderId: "424508186262",
  appId: "1:424508186262:web:12b3a5576a86f7530eacb7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;
const totalPieces = 972;

// Aller à l'appli
function goToApp() {
  document.getElementById('accueil').style.display = 'none';
  document.getElementById('connexion').style.display = 'block';
}

window.goToApp = goToApp;

// Connexion
document.getElementById("connexionBtn").addEventListener("click", async () => {
  const pseudo = document.getElementById("pseudoConnexion").value.trim();
  const code = document.getElementById("codeConnexion").value.trim();

  if (!pseudo || !code) return alert("Remplis les deux champs !");

  const snap = await get(ref(db, "users/" + pseudo));
  if (!snap.exists()) {
    if (confirm("Profil inconnu. Le créer maintenant ?")) {
      currentUser = pseudo;
      showSection("app");
      showTab("profil");
    }
    return;
  }

  const data = snap.val();
  if (data.code !== code) return alert("Code incorrect");
  currentUser = pseudo;
  document.getElementById("pseudo").value = data.pseudo || "";
  document.getElementById("lien").value = data.lien || "";
  if (data.photo) document.getElementById("photoPreview").src = data.photo;
  document.getElementById("connexion").style.display = "none";
  showSection("app");
  showTab("profil");
  loadGrids(data);
});

function showSection(id) {
  document.getElementById("accueil").style.display = "none";
  document.getElementById("connexion").style.display = "none";
  document.getElementById("app").style.display = id === "app" ? "block" : "none";
}

// Navigation entre onglets
function showTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  if (id === 'echanges') showEchanges();
  if (id === 'demandes') showDemandes();
  if (id === 'autres') showAutres();
}

window.showTab = showTab;

// Image profil
document.getElementById('photoUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('photoPreview').src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Sauvegarder profil
function saveProfile() {
  const pseudo = document.getElementById("pseudo").value.trim();
  const lien = document.getElementById("lien").value.trim();
  const code = prompt("Choisis un code à 4 chiffres");
  const photo = document.getElementById("photoPreview").src || "";

  if (!pseudo || !code) return alert("Remplis pseudo et code !");
  currentUser = pseudo;

  set(ref(db, "users/" + pseudo), {
    pseudo, lien, code, photo, doubles: [], recherches: []
  }).then(() => {
    alert("Profil enregistré !");
  });
}

window.saveProfile = saveProfile;

// Génère les cases à cocher
function createGrid(containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  for (let i = 1; i <= totalPieces; i++) {
    const box = document.createElement("span");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `${type}-${i}`;
    box.appendChild(input);
    box.appendChild(document.createTextNode(` ${i} `));
    container.appendChild(box);
  }
}

// Charger les grilles
function loadGrids(data) {
  createGrid("doublesGrid", "double");
  createGrid("recherchesGrid", "recherche");

  (data.doubles || []).forEach(p => {
    const el = document.getElementById("double-" + p);
    if (el) el.checked = true;
  });

  (data.recherches || []).forEach(p => {
    const el = document.getElementById("recherche-" + p);
    if (el) el.checked = true;
  });
}

// Enregistrer doubles et recherches
function saveDoubles() {
  const list = [];
  for (let i = 1; i <= totalPieces; i++) {
    if (document.getElementById("double-" + i)?.checked) list.push(i);
  }
  set(ref(db, "users/" + currentUser + "/doubles"), list).then(() => {
    alert("Pièces en double enregistrées !");
  });
}

window.saveDoubles = saveDoubles;

function saveRecherches() {
  const list = [];
  for (let i = 1; i <= totalPieces; i++) {
    if (document.getElementById("recherche-" + i)?.checked) list.push(i);
  }
  set(ref(db, "users/" + currentUser + "/recherches"), list).then(() => {
    alert("Pièces recherchées enregistrées !");
  });
}

window.saveRecherches = saveRecherches;

// Affichage échanges possibles
async function showEchanges() {
  const snap = await get(ref(db, "users"));
  const data = snap.val();
  const moi = data[currentUser];
  const result = [];

  for (const [k, u] of Object.entries(data)) {
    if (k === currentUser) continue;
    const match = (u.doubles || []).filter(p => moi.recherches?.includes(p));
    if (match.length) {
      result.push(`${k} peut t’échanger : ${match.join(", ")}`);
    }
  }
  document.getElementById("echangesList").innerHTML = result.map(t => `<li>${t}</li>`).join("");
}

// Affichage de mes pièces que les autres recherchent
async function showDemandes() {
  const snap = await get(ref(db, "users"));
  const data = snap.val();
  const moi = data[currentUser];
  const result = [];

  for (const [k, u] of Object.entries(data)) {
    if (k === currentUser) continue;
    const match = (u.recherches || []).filter(p => moi.doubles?.includes(p));
    if (match.length) {
      result.push(`${k} cherche : ${match.join(", ")}`);
    }
  }
  document.getElementById("demandesList").innerHTML = result.map(t => `<li>${t}</li>`).join("");
}

// Pièces que les autres possèdent, même sans échange possible
async function showAutres() {
  const snap = await get(ref(db, "users"));
  const data = snap.val();
  const moi = data[currentUser];
  const result = [];

  for (const [k, u] of Object.entries(data)) {
    if (k === currentUser) continue;
    const match = (u.doubles || []).filter(p => moi.recherches?.includes(p));
    if (match.length) {
      result.push(`${k} possède : ${match.join(", ")}`);
    }
  }
  document.getElementById("autresList").innerHTML = result.map(t => `<li>${t}</li>`).join("");
}