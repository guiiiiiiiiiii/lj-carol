/* ============================================================
   UI — peças reutilizadas por todas as páginas da loja
   (header, drawer, busca, card de produto, links de WhatsApp)
   ============================================================ */

import { dados, MODO_DEMO } from "./db.js";

/* ---------- ícones (SVG inline, sem dependência externa) ---------- */
export const ico = {
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  busca: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  seta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  setaEsq: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 10.5V4a2 2 0 0 1 2-2h6.5a2 2 0 0 1 1.4.6l9.5 9.5a2 2 0 0 1 0 2.8l-6.5 6.5a2 2 0 0 1-2.8 0L2.6 11.9A2 2 0 0 1 2 10.5Zm4.5-4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>`,
  estrela: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>`,
  whats: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.4-.2-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2.1-.2-.5-.4-.4-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 21.6a9.5 9.5 0 0 1-4.9-1.3l-.4-.2-3.6.9 1-3.5-.2-.4A9.6 9.6 0 1 1 12 21.6M12 2A9.9 9.9 0 0 0 3.4 17L2 22l5.2-1.4A10 10 0 1 0 12 2"/></svg>`,
  sacola: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/></svg>`,
  caixaVazia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 12 3l9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>`,
  caminhao: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>`,
  escudo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v7c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  pix: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9.2 3.8 3.8 9.2a4 4 0 0 0 0 5.6l5.4 5.4a4 4 0 0 0 5.6 0l5.4-5.4a4 4 0 0 0 0-5.6l-5.4-5.4a4 4 0 0 0-5.6 0Z"/></svg>`,
  medalha: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="6"/><path d="M8.5 9.5 6 2h12l-2.5 7.5"/></svg>`,
  logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 5.4V11c0 5.3 3.7 10.2 9 11 5.3-.8 9-5.7 9-11V5.4Zm0 3.2 4.4 1.7-.7 1.9-1.5-.6v7.6H9.8V8.2l-1.5.6-.7-1.9Z"/></svg>`,
  /* usados no painel */
  lapis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 6.5 3 3"/></svg>`,
  lixeira: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>`,
  olho: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
  olhoOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 6.2A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.3 4M6.5 8A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.2 0 2.3-.2 3.3-.6"/><path d="M9.7 9.9a2.6 2.6 0 0 0 3.6 3.6"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/></svg>`,
};

/* ---------- formatação ---------- */

export const brl = (v) =>
  "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const desconto = (p) =>
  p.precoAntigo > p.preco ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- WhatsApp ---------- */

let _config = null;
export async function config() {
  if (!_config) _config = await dados.config();
  return _config;
}

/** Monta o link do WhatsApp; se `produto` vier, já cita o item. */
export function linkWhats(cfg, produto) {
  const numero = String(cfg.whatsapp || "").replace(/\D/g, "");
  let texto = cfg.mensagemPadrao || "Olá! Vim pelo catálogo.";
  if (produto) {
    texto += `\n\n*${produto.nome}*\n${brl(produto.preco)}`;
    if (produto.tamanho) texto += `\nTamanho: ${produto.tamanho}`;
    texto += `\n${location.origin + location.pathname.replace(/[^/]*$/, "")}produto.html?id=${produto.id}`;
  }
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/* ---------- card de produto ---------- */

export function cardProduto(p, cfg) {
  const off = desconto(p);
  const estrelas = Array.from({ length: p.estrelas || 0 }, () => ico.estrela).join("");
  return `
    <article class="card">
      <div class="card__top">
        <a class="card__media" href="produto.html?id=${esc(p.id)}" aria-label="${esc(p.nome)}">
          <img class="card__img" src="${esc(p.thumb || "")}" alt="${esc(p.nome)}" loading="lazy" decoding="async">
          ${estrelas ? `<div class="card__stars" title="Qualidade premium">${estrelas}</div>` : ""}
          ${off ? `<div class="card__off">${ico.tag}${off}% OFF</div>` : ""}
          ${p.esgotado ? `<div class="card__sold">Esgotado</div>` : ""}
        </a>
        <a class="card__wa" href="${linkWhats(cfg, p)}" target="_blank" rel="noopener"
           title="Pedir no WhatsApp" aria-label="Pedir ${esc(p.nome)} no WhatsApp">${ico.sacola}</a>
      </div>
      <div class="card__body">
        <a href="produto.html?id=${esc(p.id)}"><h3 class="card__name">${esc(p.nome)}</h3></a>
        <div class="card__prices">
          <span class="card__price">${brl(p.preco)}</span>
          ${p.precoAntigo > p.preco ? `<s class="card__old">${brl(p.precoAntigo)}</s>` : ""}
        </div>
      </div>
    </article>`;
}

export const skeletons = (n = 4) =>
  Array.from(
    { length: n },
    () => `<div class="card"><div class="sk sk-card__media"></div>
      <div class="sk sk-line"></div><div class="sk sk-line sk-line--sm"></div></div>`
  ).join("");

/* ---------- avisos ---------- */

export function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("is-on"), 2600);
}

/* ---------- animação de entrada ---------- */

export function revelar(raiz = document) {
  const alvos = raiz.querySelectorAll(".reveal:not(.is-in)");
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  alvos.forEach((el) => io.observe(el));
}

/* ============================================================
   ESTRUTURA COMUM: topo, menu lateral, rodapé
   Todas as páginas chamam montarLayout() e recebem o mesmo
   cabeçalho/rodapé, alimentados pela configuração da loja.
   ============================================================ */

export async function montarLayout({ ativo = "" } = {}) {
  const [cfg, cats] = await Promise.all([config(), dados.categorias()]);
  const categorias = cats.filter((c) => c.ativa !== false);
  const wa = linkWhats(cfg);

  /* --- faixa de avisos --- */
  const avisos = (cfg.avisos || []).filter(Boolean);
  const faixa = avisos.length
    ? `<div class="topbar"><div class="topbar__track">${[...avisos, ...avisos]
        .map((a) => `<span>${esc(a)}</span>`)
        .join("")}</div></div>`
    : "";

  const demo = MODO_DEMO
    ? `<div class="demobar">Modo demonstração — os dados estão salvos só neste navegador.
         Preencha <b>js/config.js</b> com as chaves do Firebase para publicar de verdade.</div>`
    : "";

  document.body.insertAdjacentHTML(
    "afterbegin",
    `${demo}${faixa}
    <header class="hdr">
      <div class="wrap hdr__in">
        <button class="iconbtn" id="abrirMenu" aria-label="Abrir menu">${ico.menu}</button>
        <button class="iconbtn" id="abrirBusca" aria-label="Buscar">${ico.busca}</button>
        <a class="hdr__logo" href="index.html">
          <span class="hdr__mark">${ico.logo}</span>
          <span class="hdr__name">${esc(cfg.nome)}</span>
        </a>
        <nav class="hdr__nav">
          ${categorias
            .slice(0, 5)
            .map((c) => `<a href="categoria.html?c=${esc(c.slug)}">${esc(c.nome)}</a>`)
            .join("")}
        </nav>
        <a class="iconbtn" href="${wa}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"
           style="color:var(--wa)">${ico.whats}</a>
      </div>
    </header>

    <div class="searchbar" id="barraBusca">
      <form class="wrap" action="categoria.html" method="get">
        <input type="search" name="q" placeholder="Buscar camisa, seleção, time..." aria-label="Buscar" autocomplete="off">
        <button class="btn btn--brand" type="submit">Buscar</button>
        <button class="iconbtn" type="button" id="fecharBusca" aria-label="Fechar busca">${ico.x}</button>
      </form>
    </div>

    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="drawer" aria-label="Menu de categorias">
      <div class="drawer__top">
        <span class="drawer__title">Categorias</span>
        <button class="iconbtn" id="fecharMenu" aria-label="Fechar menu">${ico.x}</button>
      </div>
      <nav class="drawer__list">
        <a class="drawer__link" href="index.html" ${ativo === "home" ? 'aria-current="page"' : ""}>Início</a>
        ${categorias
          .map(
            (c) =>
              `<a class="drawer__link" href="categoria.html?c=${esc(c.slug)}" ${
                ativo === c.slug ? 'aria-current="page"' : ""
              }>${esc(c.nome)} ${ico.seta.replace("<svg", '<svg style="width:14px;height:14px;opacity:.4"')}</a>`
          )
          .join("")}
        <a class="drawer__link" href="categoria.html">Ver tudo</a>
      </nav>
      <div class="drawer__foot">
        <a class="btn btn--wa btn--block" href="${wa}" target="_blank" rel="noopener">${ico.whats} Falar no WhatsApp</a>
        ${cfg.instagram ? `<a class="btn btn--ghost btn--block" href="${esc(cfg.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
      </div>
    </aside>`
  );

  /* --- rodapé --- */
  document.body.insertAdjacentHTML(
    "beforeend",
    `<footer class="foot">
      <div class="wrap foot__grid">
        <div class="foot__brand">
          <h4>${esc(cfg.nome)}</h4>
          <p>${esc(cfg.rodapeTexto || "")}</p>
        </div>
        <div>
          <h4>Categorias</h4>
          <ul>${categorias
            .map((c) => `<li><a href="categoria.html?c=${esc(c.slug)}">${esc(c.nome)}</a></li>`)
            .join("")}</ul>
        </div>
        <div>
          <h4>Atendimento</h4>
          <ul>
            <li><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></li>
            ${cfg.instagram ? `<li><a href="${esc(cfg.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : ""}
            <li><a href="categoria.html">Catálogo completo</a></li>
          </ul>
        </div>
        <div>
          <h4>Loja</h4>
          <ul><li><a href="admin.html">Área da loja</a></li></ul>
        </div>
      </div>
      <div class="wrap foot__bottom">
        <span>© ${new Date().getFullYear()} ${esc(cfg.nome)}</span>
        <span>Catálogo digital — pedidos pelo WhatsApp</span>
      </div>
    </footer>
    <a class="wafab" href="${wa}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${ico.whats}</a>`
  );

  ligarInteracoes();
  return { cfg, categorias };
}

function ligarInteracoes() {
  const drawer = document.getElementById("drawer");
  const scrim = document.getElementById("scrim");
  const busca = document.getElementById("barraBusca");

  const abrir = () => {
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const fechar = () => {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  document.getElementById("abrirMenu").addEventListener("click", abrir);
  document.getElementById("fecharMenu").addEventListener("click", fechar);
  scrim.addEventListener("click", fechar);

  document.getElementById("abrirBusca").addEventListener("click", () => {
    busca.classList.toggle("is-open");
    if (busca.classList.contains("is-open")) busca.querySelector("input").focus();
  });
  document.getElementById("fecharBusca").addEventListener("click", () =>
    busca.classList.remove("is-open")
  );

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    fechar();
    busca.classList.remove("is-open");
  });

  const q = new URLSearchParams(location.search).get("q");
  if (q) busca.querySelector("input").value = q;
}

/* ---------- faixa de vantagens (usada na home) ---------- */

export const perks = `
  <div class="perks">
    <div class="perk">${ico.caminhao}<b>Envio Brasil</b><span>Rastreio em todos os pedidos</span></div>
    <div class="perk">${ico.pix}<b>Pix, cartão e boleto</b><span>Parcelamos sua compra</span></div>
    <div class="perk">${ico.medalha}<b>Qualidade premium</b><span>Tecido dry-fit importado</span></div>
    <div class="perk">${ico.escudo}<b>Compra segura</b><span>Atendimento humano no zap</span></div>
  </div>`;
