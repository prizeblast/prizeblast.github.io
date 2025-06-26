// Navigation entre les onglets
function showTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// Accès à l'app depuis l'accueil
function goToApp() {
  document.getElementById('accueil').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}

// Prévisualisation photo
document.getElementById('photoUpload').addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = () => document.getElementById('photoPreview').src = reader.result;
  reader.readAsDataURL(e.target.files[0]);
});

// Génération des grilles
function createGrid(containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const sections = [
    { name: 'Pirates débutants', start: 1, end: 252 },
    { name: 'Pirates VIP', start: 253, end: 504 },
    { name: 'Pirates VIPig', start: 505, end: 828 },
    { name: 'Pirates mystiques', start: 829, end: 972 }
  ];
  const selections = JSON.parse(localStorage.getItem(type) || '[]');

  sections.forEach(section => {
    const div = document.createElement('div');
    div.className = 'grid-section';
    const title = document.createElement('h3');
    title.textContent = section.name;
    div.appendChild(title);

    for (let i = section.start; i <= section.end; i++) {
      const span = document.createElement('span');
      span.className = 'piece';
      span.textContent = i;
      if (selections.includes(i)) span.classList.add('checked');
      span.onclick = () => {
        span.classList.toggle('checked');
      };
      div.appendChild(span);
    }

    container.appendChild(div);
  });
}

// Enregistrement local
function saveDoubles() {
  const selected = [...document.querySelectorAll('#doublesGrid .piece.checked')].map(el => parseInt(el.textContent));
  localStorage.setItem('doubles', JSON.stringify(selected));
  alert('✅ Pièces en double enregistrées !');
}

function saveRecherches() {
  const selected = [...document.querySelectorAll('#recherchesGrid .piece.checked')].map(el => parseInt(el.textContent));
  localStorage.setItem('recherches', JSON.stringify(selected));
  alert('✅ Pièces recherchées enregistrées !');
}

function saveProfile() {
  const pseudo = document.getElementById('pseudo').value;
  const lien = document.getElementById('lien').value;
  const photo = document.getElementById('photoPreview').src;
  localStorage.setItem('profil', JSON.stringify({ pseudo, lien, photo }));
  alert('✅ Profil enregistré !');
}

// Chargement au démarrage
window.onload = () => {
  // Musique
  const music = document.getElementById('pirateMusic');
  music.volume = 0.2;

  // Grilles
  createGrid('doublesGrid', 'doubles');
  createGrid('recherchesGrid', 'recherches');

  // Profil
  const profil = JSON.parse(localStorage.getItem('profil') || '{}');
  if (profil.pseudo) document.getElementById('pseudo').value = profil.pseudo;
  if (profil.lien) document.getElementById('lien').value = profil.lien;
  if (profil.photo) document.getElementById('photoPreview').src = profil.photo;
};