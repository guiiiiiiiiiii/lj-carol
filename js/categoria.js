/* ============================================================
   CATEGORIA / BUSCA
   Lista paginada: carrega um lote por vez ("Carregar mais"),
   em vez de derrubar o estoque inteiro na tela.
   URL: categoria.html?c=<slug>   ou   categoria.html?q=<busca>
   ============================================================ */

import { dados } from "./db.js";
import { LIMITE_PAGINA } from "./config.js";
import { montarLayout, cardProduto, skeletons, ico, esc, revelar, linkWhats } from "./ui.js";

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const slug = params.get("c") || "";
const busca = (params.get("q") || "").trim();

const estado = { cursor: null, fim: false, carregando: false, itens: [], cfg: null };

async function iniciar() {
  const { cfg, categorias } = await montarLayout({ ativo: slug });
  estado.cfg = cfg;

  const cat = categorias.find((c) => c.slug === slug);
  const titulo = busca ? `Busca: “${busca}”` : cat ? cat.nome : "Catálogo completo";

  document.title = `${titulo} — ${cfg.nome}`;
  $("#tituloPagina").textContent = titulo;
  $("#crumbAtual").textContent = titulo;

  /* atalhos entre categorias, sempre visíveis nesta página */
  $("#chips").innerHTML =
    `<a class="chip ${!slug && !busca ? "is-active" : ""}" href="categoria.html">Tudo</a>` +
    categorias
      .map(
        (c) =>
          `<a class="chip ${c.slug === slug ? "is-active" : ""}" href="categoria.html?c=${esc(c.slug)}">${esc(c.nome)}</a>`
      )
      .join("");

  $("#grade").innerHTML = skeletons(8);
  $("#ordenar").addEventListener("change", ordenar);

  await carregarMais(true);
}

async function carregarMais(primeira = false) {
  if (estado.carregando || estado.fim) return;
  estado.carregando = true;
  $("#rodapeLista").innerHTML = `<p>Carregando…</p>`;

  try {
    const { itens, proximo, total } = await dados.produtos({
      categoria: slug || undefined,
      busca: busca || undefined,
      limite: LIMITE_PAGINA,
      cursor: estado.cursor,
    });

    if (primeira) {
      $("#grade").innerHTML = "";
      if (total != null) {
        $("#contador").textContent =
          total === 0 ? "Nenhum item" : total === 1 ? "1 item disponível" : `${total} itens disponíveis`;
      }
    }

    estado.itens.push(...itens);
    estado.cursor = proximo;
    estado.fim = !proximo;

    $("#grade").insertAdjacentHTML(
      "beforeend",
      itens.map((p) => `<div class="reveal">${cardProduto(p, estado.cfg)}</div>`).join("")
    );
    revelar();

    $("#resumo").textContent = estado.itens.length
      ? `Mostrando ${estado.itens.length} ${estado.itens.length === 1 ? "item" : "itens"}`
      : "";

    if (!estado.itens.length) {
      mostrarVazio();
      return;
    }

    $("#rodapeLista").innerHTML = estado.fim
      ? `<p>Você viu tudo desta seção.</p>
         <a class="btn btn--ghost" href="categoria.html">Ver o catálogo completo</a>`
      : `<button class="btn btn--brand btn--lg" id="btnMais">Carregar mais</button>
         <p>Mostrando ${estado.itens.length} ${estado.itens.length === 1 ? "item" : "itens"}</p>`;

    $("#btnMais")?.addEventListener("click", () => carregarMais());
  } catch (e) {
    console.error(e);
    $("#rodapeLista").innerHTML = `<p>Não foi possível carregar: ${esc(e.message || e)}</p>`;
  } finally {
    estado.carregando = false;
  }
}

function mostrarVazio() {
  const wa = linkWhats(estado.cfg);
  $("#grade").innerHTML = "";
  $("#rodapeLista").innerHTML = `
    <div class="empty">
      ${ico.caixaVazia}
      <h3>Nada por aqui</h3>
      <p>${busca ? "Nenhum modelo encontrado para essa busca." : "Esta seção ainda não tem produtos publicados."}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn--ghost" href="categoria.html">Ver catálogo completo</a>
        <a class="btn btn--wa" href="${wa}" target="_blank" rel="noopener">${ico.whats} Pedir no WhatsApp</a>
      </div>
    </div>`;
  $("#contador").textContent = "";
}

/** Reordena o que já está na tela (sem ir buscar de novo no servidor). */
function ordenar() {
  const modo = $("#ordenar").value;
  const lista = estado.itens.slice();
  const cmp = {
    menor: (a, b) => a.preco - b.preco,
    maior: (a, b) => b.preco - a.preco,
    nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    ordem: (a, b) => (a.ordem || 0) - (b.ordem || 0),
  }[modo];
  lista.sort(cmp);
  $("#grade").innerHTML = lista
    .map((p) => `<div class="reveal is-in">${cardProduto(p, estado.cfg)}</div>`)
    .join("");
}

iniciar().catch((e) => {
  console.error(e);
  document.getElementById("grade").innerHTML =
    `<div class="empty"><h3>Erro ao carregar</h3><p>${esc(e.message || e)}</p></div>`;
});
