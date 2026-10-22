// Comparador antes / después: el control nativo (range) queda encima de la imagen,
// así funciona con dedo, ratón y flechas del teclado.
const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.compare').forEach((box, i) => {
  const input = box.querySelector('input');
  let parar = false;
  const poner = v => {
    box.style.setProperty('--pos', v + '%');
    input.setAttribute('aria-valuetext', v < 35 ? 'Se ve sobre todo el después' : v > 65 ? 'Se ve sobre todo el antes' : 'Mitad antes, mitad después');
  };
  input.addEventListener('input', () => { parar = true; poner(input.value); });
  poner(input.value);

  // Un solo gesto: cuando el comparador principal entra en pantalla, la imagen se "limpia" sola una vez.
  if (box.dataset.intro !== undefined && !reducirMovimiento && 'IntersectionObserver' in window) {
    const ver = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      ver.disconnect();
      const inicio = performance.now() + 400, dur = 2200;
      const paso = t => {
        if (parar) return;
        const p = Math.min(Math.max((t - inicio) / dur, 0), 1);
        const v = 50 + 38 * Math.sin(p * Math.PI * 2) * (1 - p * .2);
        input.value = v; poner(v.toFixed(1));
        if (p < 1) requestAnimationFrame(paso); else { input.value = 50; poner(50); }
      };
      requestAnimationFrame(paso);
    }, { threshold: .6 });
    ver.observe(box);
  }
});

// Logo interactivo: se inclina hacia el mouse y cada toque suelta burbujas. Es solo decoración.
const lab = document.querySelector('.logo-lab');
if (lab && !reducirMovimiento) {
  const tilt = lab.querySelector('.tilt');
  lab.addEventListener('pointermove', e => {
    const r = lab.getBoundingClientRect();
    tilt.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 24 + 'deg');
    tilt.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5)) * 24 + 'deg');
  });
  lab.addEventListener('pointerleave', () => { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
  lab.addEventListener('pointerdown', e => {
    const r = lab.getBoundingClientRect();
    for (let n = 0; n < 8; n++) {
      const b = document.createElement('span'), d = 10 + Math.random() * 26;
      b.className = 'pop';
      b.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left + (Math.random() - .5) * 90 - d / 2}px;top:${e.clientY - r.top + (Math.random() - .5) * 50 - d / 2}px;animation-delay:${Math.random() * .25}s;animation-duration:${1.1 + Math.random() * .8}s`;
      b.addEventListener('animationend', () => b.remove());
      lab.appendChild(b);
    }
  });
}

// Servicios: abre el primero para que se entienda que se puede desplegar.
const primero = document.querySelector('details.srv');
if (primero && matchMedia('(min-width: 901px)').matches) primero.open = true;

// "Abierto ahora" según la hora de Colombia.
const estado = document.querySelector('[data-estado]');
if (estado) {
  const partes = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', weekday: 'short', hourCycle: 'h23', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date()).map(p => [p.type, p.value]));
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday);
  const min = Number(partes.hour) * 60 + Number(partes.minute);
  const franjas = { 6: [[480, 780]] };
  for (let d = 1; d <= 5; d++) franjas[d] = [[480, 750], [840, 1020]];
  const fmt = m => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return `${h % 12 || 12}:${mm} ${h < 12 ? 'a. m.' : 'p. m.'}`; };
  const hoy = franjas[dia] || [];
  const actual = hoy.find(([a, b]) => min >= a && min < b);
  const siguiente = hoy.find(([a]) => min < a);
  let texto, abierto = false;
  if (actual) { abierto = true; texto = `Abierto ahora · cerramos a las ${fmt(actual[1])}`; }
  else if (siguiente) texto = `Cerrado ahora · abrimos hoy a las ${fmt(siguiente[0])}`;
  else if (!hoy.length) texto = 'Hoy atendemos solo con cita previa';
  else texto = 'Cerrado ahora · escríbenos y te respondemos en el siguiente horario';
  estado.textContent = texto;
  estado.dataset.open = abierto;
  const fila = document.querySelector(`[data-dia="${dia === 0 ? 'dom' : dia === 6 ? 'sab' : 'lv'}"]`);
  if (fila) fila.classList.add('hoy');
}
