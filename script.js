import { saveProfile, loadProfile, loadAllProfiles } from './firebase.js';

let joueurActuel = null;
let tousLesJoueurs = {};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("formConnexion").addEventListener("submit", connexionJoueur);
  document.getElementById("photoUpload").addEventListener("change", previewPhoto);
  document.getElementById("btnEnregistrerProfil").addEventListener("click", enregistrerProfil);
  document.getElementById("btnEnregistrerDoubles").addEventListener("click", enregistrerDoubles);
  document.getElementById("btnEnregistrerRecherches").addEventListener("click", enregistrerRecherches);
});

function connexionJoueur(e) {
  e.preventDefault();
  const pseudo = document.getElementById("pseudoConnexion").value.trim();
  const code = document.getElementById("codeConnexion").value.trim();

  if (!pseudo || !code) return alert("Remplis les deux champs.");

  loadProfile(pseudo).then(data => {
    if (!data) return alert("Aucun joueur trouvé.");
    if (data.code !== code) return alert("Code incorrect.");
    joueurActuel = { pseudo, ...data };
    demarrerApp();
  });
}

function demarrerApp() {
  document.getElementById("accueil").style.display = "none";
  document.getElementById("app").style.display = "block";
  chargerTousLesJoueurs();

  document.getElementById("pseudo").value = joueurActuel.pseudo;
  document.getElementById("lien").value = joueurActuel.lien || "";
  if (joueurActuel.photo) document.getElementById("photoPreview").src = joueurActuel.photo;
  genererGrille("doublesGrid", joueurActuel.doubles || [], "doubles");
  genererGrille("recherchesGrid", joueurActuel.recherches || [], "recherches");

  showTab('profil');
}

function previewPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("photoPreview").src = e.target.result;
    joueurActuel.photo = e.target.result;
  };
  reader.readAsDataURL(file);
}

function genererGrille(id, selection, type) {
  const container = document.getElementById(id);
  container.innerHTML = "";
  const couleurs = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2"];
  const bornes = [1, 253, 505, 829, 973];
  const noms = ["Pirates débutants", "Pirates VIP", "Pirates VIPig", "Pirates mystiques"];

  for (let s = 0; s < 4; s++) {
    const section = document.createElement("div");
    section.innerHTML = `<h3>${noms[s]}</h3>`;
    for (let i = bornes[s]; i < bornes[s + 1]; i++) {
      const caseDiv = document.createElement("div");
      caseDiv.className = "puzzlePiece";
      caseDiv.textContent = i;
      caseDiv.style.backgroundColor = selection.includes(i) ? couleurs[s] : "#ccc";
      caseDiv.onclick = () => {
        if (!selection.includes(i)) selection.push(i);
        else selection.splice(selection.indexOf(i), 1);
        genererGrille(id, selection, type);
      };
      section.appendChild(caseDiv);
    }
    container.appendChild(section);
  }

  joueurActuel[type] = selection;
}

function enregistrerProfil() {
  joueurActuel.pseudo = document.getElementById("pseudo").value.trim();
  joueurActuel.lien = document.getElementById("lien").value.trim();
  if (!joueurActuel.code) joueurActuel.code = prompt("Choisis un code à 4 chiffres");
  saveProfile(joueurActuel.pseudo, joueurActuel).then(() => alert("Profil enregistré !"));
}

function enregistrerDoubles() {
  saveProfile(joueurActuel.pseudo, joueurActuel).then(() => alert("Doubles enregistrés !"));
}

function enregistrerRecherches() {
  saveProfile(joueurActuel.pseudo, joueurActuel).then(() => alert("Recherches enregistrées !"));
}

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById(tabId).style.display = "block";

  if (tabId === "echanges") afficherEchanges();
  if (tabId === "demandes") afficherDemandes();
}

function chargerTousLesJoueurs() {
  loadAllProfiles().then(data => {
    tousLesJoueurs = data || {};
  });
}

function afficherEchanges() {
  const ul = document.getElementById("echangesList");
  ul.innerHTML = "";
  for (const [autre, data] of Object.entries(tousLesJoueurs)) {
    if (autre === joueurActuel.pseudo) continue;
    const matchs = data.doubles?.filter(p => joueurActuel.recherches?.includes(p)) || [];
    const retour = joueurActuel.doubles?.filter(p => data.recherches?.includes(p)) || [];
    if (matchs.length && retour.length) {
      const li = document.createElement("li");
      li.innerHTML = `<b>${autre}</b> propose ${matchs.join(", ")} et cherche ${retour.join(", ")}`;
      ul.appendChild(li);
    }
  }
}

function afficherDemandes() {
  const ul = document.getElementById("demandesList");
  ul.innerHTML = "";
  for (const [autre, data] of Object.entries(tousLesJoueurs)) {
    if (autre === joueurActuel.pseudo) continue;
    const demandes = data.recherches?.filter(p => joueurActuel.doubles?.includes(p)) || [];
    if (demandes.length) {
      const li = document.createElement("li");
      li.innerHTML = `<b>${autre}</b> cherche ${demandes.join(", ")}`;
      ul.appendChild(li);
    }
  }
}