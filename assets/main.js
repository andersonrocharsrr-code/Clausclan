// Número do WhatsApp com DDI + DDD, só dígitos (ex.: 5511999999999)
const WHATSAPP = "5500000000000";

const waLink = (msg = "Olá! Gostaria de um orçamento de cobertura.") =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink();
  a.target = "_blank";
  a.rel = "noopener";
});

document.getElementById("year").textContent = new Date().getFullYear();

// Cabeçalho muda ao rolar
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menu mobile
const toggle = document.getElementById("menuToggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
document.querySelectorAll("#menu a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Animação de entrada + contadores
const countUp = (el) => {
  const target = +el.dataset.count;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / 1600, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("pt-BR") + (p === 1 ? "+" : "");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// Filtro das coberturas
document.querySelectorAll(".chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    const f = chip.dataset.filter;
    document.querySelectorAll(".card").forEach((card) => {
      const show = f === "todos" || card.dataset.tags.split(" ").includes(f);
      card.classList.toggle("is-hidden", !show);
    });
  })
);

// Formulário -> WhatsApp
document.getElementById("quoteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  let ok = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const bad = !input.value.trim();
    input.classList.toggle("is-invalid", bad);
    if (bad) ok = false;
  });
  if (!ok) return;

  const d = Object.fromEntries(new FormData(form));
  const msg =
    `Olá! Meu nome é ${d.nome}.\n` +
    `Gostaria de um orçamento de cobertura em *${d.tipo}*.\n` +
    `Local: ${d.cidade}` +
    (d.medida ? `\nMedida aproximada: ${d.medida}` : "");
  window.open(waLink(msg), "_blank", "noopener");
});

// Se alguma foto falhar, mantém só o fundo em degradê (sem texto alternativo quebrado)
document.querySelectorAll("img").forEach((img) => {
  const hide = () => (img.style.visibility = "hidden");
  if (img.complete && !img.naturalWidth) hide();
  img.addEventListener("error", hide);
});
