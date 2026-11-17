// No necesitas editar este archivo: todo lo personal está en config.js
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

// Crea un recuadro de foto; si la imagen no existe muestra un emoji
function crearFoto(src, emoji = "💗", alt = "") {
  const caja = document.createElement("div");
  caja.className = "foto";
  const img = new Image();
  img.alt = alt;
  img.loading = "lazy";
  img.onerror = () => { caja.textContent = emoji; };
  img.src = src;
  caja.appendChild(img);
  return caja;
}

/* ---------- 1. Nombre + contador ---------- */
$("nombre-el").textContent = CONFIG.suNombre;
const inicio = new Date(CONFIG.inicioRelacion);
$("desde").textContent = "desde el " + inicio.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });

// Suma meses a una fecha sin pasarse (ej. 31 de enero + 1 mes = 28/29 de febrero)
function sumarMeses(fecha, meses) {
  const y = fecha.getFullYear(), m = fecha.getMonth() + meses;
  const diasMes = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(fecha.getDate(), diasMes), fecha.getHours(), fecha.getMinutes(), fecha.getSeconds());
}
const plural = (n, uno, varios) => (n === 1 ? uno : varios);

function tick() {
  const ahora = new Date();
  if (ahora < inicio) return;
  let meses = (ahora.getFullYear() - inicio.getFullYear()) * 12 + (ahora.getMonth() - inicio.getMonth());
  let ancla = sumarMeses(inicio, meses);
  if (ancla > ahora) { meses--; ancla = sumarMeses(inicio, meses); }
  const s = Math.floor((ahora - ancla) / 1000);
  const anios = Math.floor(meses / 12), m = meses % 12, d = Math.floor(s / 86400);
  $("c-anios").textContent = anios;
  $("c-meses").textContent = m;
  $("c-dias").textContent = d;
  $("l-anios").textContent = plural(anios, "año", "años");
  $("l-meses").textContent = plural(m, "mes", "meses");
  $("l-dias").textContent = plural(d, "día", "días");
  $("c-horas").textContent = pad(Math.floor((s % 86400) / 3600));
  $("c-min").textContent = pad(Math.floor((s % 3600) / 60));
  $("c-seg").textContent = pad(s % 60);
  const total = Math.floor((ahora - inicio) / 86400000);
  $("total-dias").textContent = `¡O sea, ${total.toLocaleString("es")} días a tu lado! 💕`;
}
tick();
setInterval(tick, 1000);

/* ---------- 2. Línea de tiempo ---------- */
const tl = $("timeline");
CONFIG.historia.forEach((m) => {
  const li = document.createElement("li");
  li.className = "momento";
  li.innerHTML = `<p class="fecha"></p><h3></h3>`;
  li.querySelector(".fecha").textContent = m.fecha;
  li.querySelector("h3").textContent = m.titulo;
  li.appendChild(crearFoto(m.foto, m.emoji, m.titulo));
  const frase = document.createElement("p");
  frase.className = "frase";
  frase.textContent = "“" + m.frase + "”";
  li.appendChild(frase);
  tl.appendChild(li);
});
const obs = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
}, { threshold: 0.2 });
document.querySelectorAll(".momento").forEach((el) => obs.observe(el));

/* ---------- 3. Razones (no repite hasta mostrar todas) ---------- */
let mazo = [];
let vistas = 0;
$("sobre").addEventListener("click", () => {
  if (mazo.length === 0) mazo = [...CONFIG.razones].sort(() => Math.random() - 0.5);
  const r = $("razon");
  r.textContent = mazo.pop();
  r.classList.remove("aparece"); void r.offsetWidth; r.classList.add("aparece");
  const s = $("sobre");
  s.classList.remove("abrir"); void s.offsetWidth; s.classList.add("abrir");
  vistas++;
  $("razon-cuenta").textContent = `Razón ${Math.min(vistas, CONFIG.razones.length)} de ${CONFIG.razones.length}` +
    (vistas >= CONFIG.razones.length ? " (y miles más 💕)" : "");
  lluviaCorazones(8);
});

/* ---------- 4. Galería + música ---------- */
const grid = $("grid");
CONFIG.galeria.forEach((g, i) => {
  const b = document.createElement("button");
  b.className = "polaroid";
  b.appendChild(crearFoto(g.foto, "📷", g.texto));
  const p = document.createElement("p");
  p.textContent = g.texto;
  b.appendChild(p);
  b.addEventListener("click", () => {
    const img = b.querySelector("img");
    if (!img || !img.complete || img.naturalWidth === 0) return;
    abrirVisor(i);
  });
  grid.appendChild(b);
  obs.observe(b);
});

// Visor con flechas, teclado y deslizar con el dedo
const visor = $("visor");
let fotoActual = 0;
function mostrarFoto(i) {
  const n = CONFIG.galeria.length;
  fotoActual = (i + n) % n;
  const g = CONFIG.galeria[fotoActual];
  const img = $("visor-img");
  img.classList.remove("entra"); void img.offsetWidth; img.classList.add("entra");
  img.src = g.foto;
  img.alt = g.texto;
  $("visor-texto").textContent = g.texto;
  $("visor-cuenta").textContent = `${fotoActual + 1} / ${n}`;
}
function abrirVisor(i) {
  detenerAuto();
  mostrarFoto(i);
  visor.hidden = false;
}
const cerrarVisor = () => (visor.hidden = true);
$("visor-cerrar").onclick = cerrarVisor;
$("visor-ant").onclick = () => mostrarFoto(fotoActual - 1);
$("visor-sig").onclick = () => mostrarFoto(fotoActual + 1);
visor.addEventListener("click", (e) => { if (e.target === visor) cerrarVisor(); });
document.addEventListener("keydown", (e) => {
  if (visor.hidden) return;
  if (e.key === "Escape") cerrarVisor();
  if (e.key === "ArrowLeft") mostrarFoto(fotoActual - 1);
  if (e.key === "ArrowRight") mostrarFoto(fotoActual + 1);
});
let toqueX = null;
visor.addEventListener("touchstart", (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
visor.addEventListener("touchend", (e) => {
  if (toqueX === null) return;
  const dx = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(dx) > 50) mostrarFoto(fotoActual + (dx < 0 ? 1 : -1));
  toqueX = null;
});

const audio = $("audio");
audio.src = CONFIG.cancion;
$("nombre-cancion").textContent = CONFIG.nombreCancion;
const btnMusica = $("btn-musica");
// Sube o baja el volumen poco a poco
let timerVolumen;
function fundido(destino, ms, alTerminar) {
  clearInterval(timerVolumen);
  const inicioVol = audio.volume, pasos = 40;
  let k = 0;
  timerVolumen = setInterval(() => {
    k++;
    audio.volume = Math.min(1, Math.max(0, inicioVol + (destino - inicioVol) * (k / pasos)));
    if (k >= pasos) { clearInterval(timerVolumen); if (alTerminar) alTerminar(); }
  }, ms / pasos);
}
const musicaSonando = () => btnMusica.getAttribute("aria-pressed") === "true";
function ponerMusica() {
  if (musicaSonando()) return;
  btnMusica.firstChild.textContent = "⏸ ";
  btnMusica.setAttribute("aria-pressed", "true");
  if (!audio.paused) return fundido(1, 1500); // estaba bajando el volumen: vuelve a subirlo
  audio.volume = 0;
  audio.play()
    .then(() => fundido(1, 4000)) // 4 segundos para llegar al volumen máximo
    .catch(() => {
      btnMusica.firstChild.textContent = "⚠ No encontré la canción ";
      btnMusica.setAttribute("aria-pressed", "false");
    });
}
function pausarMusica() {
  btnMusica.firstChild.textContent = "🎵 ";
  btnMusica.setAttribute("aria-pressed", "false");
  fundido(0, 800, () => audio.pause());
}
btnMusica.addEventListener("click", () => (musicaSonando() ? pausarMusica() : ponerMusica()));

/* ---------- 5. Quiz ---------- */
let qi = 0, aciertos = 0;
function mostrarPregunta() {
  const caja = $("quiz-caja");
  caja.innerHTML = "";
  if (qi >= CONFIG.quiz.length) {
    caja.innerHTML = `<p class="pregunta">¡Terminaste! 🎉</p>
      <p>Acertaste ${aciertos} de ${CONFIG.quiz.length}</p>
      <p class="final-quiz"></p>
      <button class="boton" id="quiz-otra">Jugar otra vez</button>`;
    caja.querySelector(".final-quiz").textContent = CONFIG.mensajeFinalQuiz;
    $("quiz-otra").onclick = () => { qi = 0; aciertos = 0; mostrarPregunta(); };
    lluviaCorazones(30);
    // Si el recorrido estaba pausado aquí, sigue bajando solo después de un ratito
    if (paradaActual && paradaActual.id === "quiz") setTimeout(() => { if (paradaActual) iniciarAuto(); }, 4000);
    return;
  }
  const q = CONFIG.quiz[qi];
  caja.innerHTML = `<p class="progreso">Pregunta ${qi + 1} de ${CONFIG.quiz.length}</p><p class="pregunta"></p><div class="opciones"></div>`;
  caja.querySelector(".pregunta").textContent = q.pregunta;
  const ops = caja.querySelector(".opciones");
  q.opciones.forEach((texto, i) => {
    const b = document.createElement("button");
    b.className = "opcion";
    b.textContent = texto;
    b.onclick = () => {
      ops.querySelectorAll("button").forEach((x) => (x.disabled = true));
      if (i === q.correcta) { b.classList.add("bien"); aciertos++; lluviaCorazones(6); }
      else { b.classList.add("mal"); ops.children[q.correcta].classList.add("bien"); }
      setTimeout(() => { qi++; mostrarPregunta(); }, 1300);
    };
    ops.appendChild(b);
  });
}
mostrarPregunta();

/* ---------- 6. Sorpresa con fecha ---------- */
// Truco para probarla antes: abre la página con  index.html?vista-previa
const fechaS = new Date(CONFIG.fechaSorpresa);
const vistaPrevia = new URLSearchParams(location.search).has("vista-previa");
let timerSorpresa;
function revisarSorpresa() {
  const caja = $("sorpresa-caja");
  const falta = fechaS - Date.now();
  if (falta <= 0 || vistaPrevia) {
    clearInterval(timerSorpresa);
    caja.innerHTML = `<p class="candado">💝</p><div class="carta"></div>`;
    caja.querySelector(".carta").textContent = CONFIG.cartaSorpresa;
    lluviaCorazones(40);
    return;
  }
  const s = Math.floor(falta / 1000);
  caja.innerHTML = `<p class="candado">🔒</p>
    <p>Esta sorpresa se abre el día de <strong></strong></p>
    <div class="mini-contador">
      <div>${Math.floor(s / 86400)}<small>días</small></div>
      <div>${pad(Math.floor((s % 86400) / 3600))}<small>horas</small></div>
      <div>${pad(Math.floor((s % 3600) / 60))}<small>min</small></div>
      <div>${pad(s % 60)}<small>seg</small></div>
    </div>
    <p class="sub pequeño">Ten paciencia… vale la pena 😉</p>`;
  caja.querySelector("strong").textContent = CONFIG.motivoSorpresa;
}
revisarSorpresa();
timerSorpresa = setInterval(revisarSorpresa, 1000);

/* ---------- Corazones flotando ---------- */
function lluviaCorazones(n) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const capa = document.querySelector(".corazones");
  for (let i = 0; i < n; i++) {
    const c = document.createElement("span");
    c.className = "corazon";
    c.textContent = ["♥", "💗", "💕", "♡"][Math.floor(Math.random() * 4)];
    c.style.left = Math.random() * 100 + "vw";
    c.style.fontSize = 14 + Math.random() * 22 + "px";
    c.style.animationDuration = 4 + Math.random() * 4 + "s";
    c.style.animationDelay = Math.random() * 1.5 + "s";
    capa.appendChild(c);
    setTimeout(() => c.remove(), 10000);
  }
}
setInterval(() => lluviaCorazones(1), 1800);

/* ---------- Desplazamiento automático ---------- */
// Baja la página sola, despacito. Se detiene si él toca, usa la rueda o el teclado.
const VELOCIDAD = 70; // píxeles por segundo (súbelo para que baje más rápido)
const btnAuto = $("auto-scroll");
let bajando = false, ultimo = 0, acumulado = 0;

// Secciones donde el recorrido se detiene para que él juegue (razones y quiz)
const paradas = [...document.querySelectorAll("[data-parada]")];
const paradasHechas = new Set();
let paradaActual = null;
const ALTO_MENU = 60;

function revisarParadas() {
  for (const sec of paradas) {
    if (paradasHechas.has(sec)) continue;
    if (sec.getBoundingClientRect().top <= ALTO_MENU) {
      paradasHechas.add(sec);
      window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - ALTO_MENU, behavior: "instant" });
      detenerAuto();
      paradaActual = sec;
      sec.querySelector(".seguir").hidden = false;
      return true;
    }
  }
  return false;
}

function paso(t) {
  if (!bajando) return;
  if (ultimo) {
    acumulado += ((t - ultimo) / 1000) * VELOCIDAD;
    const px = Math.floor(acumulado);
    if (px > 0) { window.scrollBy({ top: px, behavior: "instant" }); acumulado -= px; }
  }
  ultimo = t;
  if (revisarParadas()) return;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) return detenerAuto();
  requestAnimationFrame(paso);
}
function iniciarAuto() {
  if (paradaActual) { paradaActual.querySelector(".seguir").hidden = true; paradaActual = null; }
  bajando = true; ultimo = 0; acumulado = 0;
  btnAuto.textContent = "⏸ Pausar"; btnAuto.setAttribute("aria-pressed", "true");
  requestAnimationFrame(paso);
}
function detenerAuto() {
  bajando = false;
  btnAuto.textContent = "▶ Bajar solito"; btnAuto.setAttribute("aria-pressed", "false");
}
btnAuto.addEventListener("click", () => (bajando ? detenerAuto() : iniciarAuto()));
document.querySelectorAll(".seguir").forEach((b) => b.addEventListener("click", iniciarAuto));
$("empezar").addEventListener("click", () => { ponerMusica(); iniciarAuto(); });
// Si él toca la pantalla, usa la rueda o el teclado, se pausa (menos al tocar los botones)
["wheel", "touchstart", "keydown"].forEach((ev) =>
  window.addEventListener(ev, (e) => {
    if (!bajando) return;
    if (e.target.closest && e.target.closest(".flotantes, .seguir, #empezar")) return;
    detenerAuto();
  }, { passive: true })
);

/* ---------- Final ---------- */
$("final-nombre").textContent = CONFIG.suNombre;
$("final-frase").textContent = CONFIG.fraseFinal || "";
$("final-firma").textContent = "— " + CONFIG.tuNombre;
const finalSec = $("final");
new IntersectionObserver((entradas, o) => {
  if (entradas[0].isIntersecting) {
    finalSec.classList.add("visible");
    lluviaCorazones(60);
    setTimeout(() => lluviaCorazones(40), 2500);
    o.disconnect();
  }
}, { threshold: 0.5 }).observe(finalSec);
