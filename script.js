let currentUser = null;
let db = {};

function goToApp() {
  document.getElementById('accueil').style.display = 'none';
  document.getElementById('login').style.display = 'block';
}

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
  if (tabId === 'echanges') afficherEchanges();
  if (tabId === 'demandes') afficherDemandes();
  if (tabId === 'autres') afficherAutres();
}

function saveProfile() {
  const pseudo = document.getElementById("pseudo").value;
  const lien = document.getElementById("lien").value;
  const code = document.getElementById("codeConnexion").value;
  const photo = document.getElementById("photoUpload").files[0];

  if (!pseudo || !code) return alert("Pseudo et code requis");

  const reader = new FileReader();
  reader.onload = () => {
    const photoURL = reader.result;
    db[pseudo] = {
      pseudo, lien, code, photoURL,
      doubles: [], recherches: []
    };
    currentUser = pseudo;
    localStorage.setItem("prizeblastDB", JSON.stringify(db));
    alert("Profil enregistré !");
    afficherGrilles();
  };
  if (photo) reader.readAsDataURL(photo);
  else {
    db[pseudo] = { pseudo, lien, code, photoURL: "", doubles: [], recherches: [] };
    currentUser = pseudo;
    localStorage.setItem("prizeblastDB", JSON.stringify(db));
    alert("Profil enregistré !");
    afficherGrilles();
  }
}

function login() {
  const pseudo = document.getElementById("loginPseudo").value;
  const code = document.getElementById("loginCode").value;
  const data = JSON.parse(localStorage.getItem("prizeblastDB")) || {};
  db = data;
  if (data[pseudo] && data[pseudo].code === code) {
    currentUser = pseudo;
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("pseudo").value = data[pseudo].pseudo;
    document.getElementById("lien").value = data[pseudo].lien;
    if (data[pseudo].photoURL) {
      document.getElementById("photoPreview").src = data[pseudo].photoURL;
    }
    afficherGrilles();
  } else {
    alert("Pseudo ou code incorrect");
  }
}

function afficherGrilles() {
  afficherGrille("doublesGrid", "doubles");
  afficherGrille("recherchesGrid", "recherches");
}

function afficherGrille(containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const joueur = db[currentUser];
  const data = joueur[type] || [];
  for (let i = 1; i <= 972; i++) {
    const el = document.createElement("div");
    el.className = "piece";
    el.textContent = i;
    if (data.includes(i)) el.classList.add("checked");
    el.onclick = () => {
      if (el.classList.contains("checked")) {
        el.classList.remove("checked");
        joueur[type] = joueur[type].filter(n => n !== i);
      } else {
        el.classList.add("checked");
        joueur[type].push(i);
      }
    };
    container.appendChild(el);
  }
}

function saveDoubles() {
  localStorage.setItem("prizeblastDB", JSON.stringify(db));
  alert("Doubles enregistrés !");
}

function saveRecherches() {
  localStorage.setItem("prizeblastDB", JSON.stringify(db));
  alert("Recherches enregistrées !");
}

function afficherEchanges() {
  const joueur = db[currentUser];
  const echanges = [];
  for (const pseudo in db) {
    if (pseudo !== currentUser) {
      const autre = db[pseudo];
      const possibles = autre.doubles.filter(p => joueur.recherches.includes(p));
      if (possibles.length) {
        echanges.push(`${pseudo} peut te donner : ${possibles.join(", ")}`);
      }
    }
  }
  document.getElementById("echangesList").innerHTML = echanges.map(e => `<li>${e}</li>`).join("");
}

function afficherDemandes() {
  const joueur = db[currentUser];
  const demandes = [];
  for (const pseudo in db) {
    if (pseudo !== currentUser) {
      const autre = db[pseudo];
      const pieces = joueur.doubles.filter(p => autre.recherches.includes(p));
      if (pieces.length) {
        demandes.push(`${pseudo} veut : ${pieces.join(", ")}`);
      }
    }
  }
  document.getElementById("demandesList").innerHTML = demandes.map(e => `<li>${e}</li>`).join("");
}

function afficherAutres() {
  const joueur = db[currentUser];
  const lignes = [];
  for (const pseudo in db) {
    if (pseudo !== currentUser) {
      const autres = db[pseudo].doubles;
      if (autres.length) {
        lignes.push(`${pseudo} a : ${autres.join(", ")}`);
      }
    }
  }
  document.getElementById("autresList").innerHTML = lignes.map(e => `<li>${e}</li>`).join("");
}