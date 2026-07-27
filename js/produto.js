/* ============================================================
   PÁGINA DE PRODUTO
   Galeria + tamanhos + botão que abre o WhatsApp já com o
   modelo e o tamanho escolhidos escritos na mensagem.
   ============================================================ */

import { dados } from "./db.js";
import {
  montarLayout, cardProduto, brl, desconto, linkWhats, ico, esc, revelar,
} from "./ui.js";

const $ = (s) => document.querySelector(s);
const id = new URLSearchParams(location.search).get("id");

let cfg, produto, tamanhoEscolhido = "";

async function iniciar() {
  const layout = await montarLayout();
  cfg = layout.cfg;

  produto = id ? await dados.produto(id) : null;
  if (!produto) return naoEncontrado();

  document.title = `${produto.nome} — ${cfg.nome}`;
  const cat = layout.categorias.find((c) => c.slug === produto.categoria);

  $("#crumbs").innerHTML =
    `<a href="index.html">Início</a> / ` +
    (cat ? `<a href="categoria.html?c=${esc(cat.slug)}">${esc(cat.nome)}</a> / ` : "") +
    `<span>${esc(produto.nome)}</span>`;

  const fotos = [produto.thumb, ...(await dados.fotos(produto.id))].filter(Boolean);
  const off = desconto(produto);

  $("#detalhe").innerHTML = `
    <div class="prod__col--fotos">
      <div class="gallery__main">
        <img id="fotoGrande" src="${esc(fotos[0] || "")}" alt="${esc(produto.nome)}">
        ${produto.esgotado ? `<div class="card__sold">Esgotado</div>` : ""}
      </div>
      ${
        fotos.length > 1
          ? `<div class="gallery__thumbs">${fotos
              .map(
                (f, i) =>
                  `<button class="gallery__thumb ${i === 0 ? "is-active" : ""}" data-foto="${i}">
                     <img src="${esc(f)}" alt="Foto ${i + 1}"></button>`
              )
              .join("")}</div>`
          : ""
      }
    </div>

    <div class="prod__col--info">
      ${cat ? `<span class="prod__tag">${esc(cat.nome)}${produto.patch ? " · com patch" : ""}</span>` : ""}
      <h1>${esc(produto.nome)}</h1>

      <div class="prod__price">
        <strong>${brl(produto.preco)}</strong>
        ${produto.precoAntigo > produto.preco ? `<s>${brl(produto.precoAntigo)}</s>` : ""}
        ${off ? `<span class="card__off">${ico.tag}${off}% OFF</span>` : ""}
      </div>
      <p class="prod__note">Pagamento e frete combinados direto no WhatsApp.</p>

      ${
        produto.tamanhos?.length
          ? `<div class="field">
              <span class="field__label">Tamanho</span>
              <div class="sizes" id="tamanhos">
                ${produto.tamanhos.map((t) => `<button class="size" data-tam="${esc(t)}">${esc(t)}</button>`).join("")}
              </div>
            </div>`
          : ""
      }

      ${produto.descricao ? `<p class="prod__desc">${esc(produto.descricao)}</p>` : ""}

      <dl class="specs">
        ${linha("Modelo", produto.nome)}
        ${cat ? linha("Linha", cat.nome) : ""}
        ${produto.colecao ? linha("Coleção", produto.colecao) : ""}
        ${linha("Patch oficial", produto.patch ? "Incluso" : "Não incluso")}
        ${linha("Disponibilidade", produto.esgotado ? "Esgotado" : "Pronta entrega")}
      </dl>

      <div class="buybar">
        <a class="btn btn--wa btn--block btn--lg" id="btnWhats" href="#" target="_blank" rel="noopener">
          ${ico.whats} Pedir no WhatsApp
        </a>
      </div>
    </div>`;

  atualizarLink();

  /* troca da foto principal */
  document.querySelectorAll("[data-foto]").forEach((b) =>
    b.addEventListener("click", () => {
      $("#fotoGrande").src = fotos[Number(b.dataset.foto)];
      document.querySelectorAll("[data-foto]").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
    })
  );

  /* escolha de tamanho — entra na mensagem do WhatsApp */
  document.querySelectorAll("[data-tam]").forEach((b) =>
    b.addEventListener("click", () => {
      const jaAtivo = b.classList.contains("is-active");
      document.querySelectorAll("[data-tam]").forEach((x) => x.classList.remove("is-active"));
      if (!jaAtivo) b.classList.add("is-active");
      tamanhoEscolhido = jaAtivo ? "" : b.dataset.tam;
      atualizarLink();
    })
  );

  carregarRelacionados(cat);
}

const linha = (rot, val) =>
  `<div class="specs__row"><dt>${esc(rot)}</dt><dd>${esc(val)}</dd></div>`;

function atualizarLink() {
  $("#btnWhats").href = linkWhats(cfg, { ...produto, tamanho: tamanhoEscolhido });
}

async function carregarRelacionados(cat) {
  if (!cat) return;
  const { itens } = await dados.produtos({ categoria: cat.slug, limite: 9 });
  const outros = itens.filter((p) => p.id !== produto.id).slice(0, 8);
  if (!outros.length) return;

  $("#relacionados").innerHTML = `
    <section class="section reveal">
      <div class="section__head">
        <h2 class="section__title">Você também vai gostar</h2>
        <a class="section__all" href="categoria.html?c=${esc(cat.slug)}">Ver todos ${ico.seta}</a>
      </div>
      <div class="rail"><div class="rail__track">${outros.map((p) => cardProduto(p, cfg)).join("")}</div></div>
    </section>`;
  revelar();
}

function naoEncontrado() {
  $("#detalhe").outerHTML = `
    <div class="empty">
      ${ico.caixaVazia}
      <h3>Produto não encontrado</h3>
      <p>Esse item pode ter saído do catálogo.</p>
      <a class="btn btn--brand" href="categoria.html">Ver catálogo completo</a>
    </div>`;
}

iniciar().catch((e) => {
  console.error(e);
  document.getElementById("detalhe").innerHTML =
    `<div class="empty"><h3>Erro ao carregar</h3><p>${esc(e.message || e)}</p></div>`;
});
