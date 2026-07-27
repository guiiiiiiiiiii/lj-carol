/* ============================================================
   PAINEL DA LOJA
   Login + cadastro de produtos, categorias, dados da loja e backup.
   As imagens são reduzidas no próprio navegador antes de salvar,
   para o catálogo continuar leve no celular do cliente.
   ============================================================ */

import { dados, MODO_DEMO, slugify, semAcento } from "./db.js";
import { DEMO_SENHA, CONFIG_PADRAO } from "./config.js";
import { ico, brl, esc, toast } from "./ui.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* estado da tela */
const st = {
  produtos: [],
  categorias: [],
  cfg: {},
  fotosExtras: [],
  thumb: "",
  tamanhos: [],
};

/* tamanhos oferecidos por padrão no formulário */
const TAMANHOS_SUGERIDOS = ["PP", "P", "M", "G", "GG", "XGG", "16", "18", "20", "22", "24", "26", "28"];

/* ============================================================
   LOGIN
   ============================================================ */

$("#loginMark").innerHTML = ico.logo;
$("#admLogo").innerHTML = ico.logo + "<span>Painel da loja</span>";

if (MODO_DEMO) {
  $("#loginSub").innerHTML =
    `Modo demonstração — o Firebase ainda não foi configurado. Entre com a senha <b>${esc(DEMO_SENHA)}</b> (definida em <code>js/config.js</code>).`;
  $("#email").removeAttribute("required");
  $("#email").placeholder = "(não é usado no modo demonstração)";
}

$("#formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#btnEntrar");
  const erro = $("#loginErro");
  erro.hidden = true;
  btn.disabled = true;
  btn.textContent = "Entrando…";
  try {
    await dados.entrar($("#email").value.trim(), $("#senha").value);
  } catch (ex) {
    erro.hidden = false;
    erro.textContent = traduzirErro(ex);
  } finally {
    btn.disabled = false;
    btn.textContent = "Entrar";
  }
});

$("#btnSair").addEventListener("click", async () => {
  await dados.sair();
  location.reload();
});

function traduzirErro(ex) {
  const codigo = ex?.code || "";
  const mapa = {
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Não existe conta com esse e-mail.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "permission-denied": "Sua conta não tem permissão de administradora.",
  };
  return mapa[codigo] || ex?.message || "Não foi possível entrar.";
}

/* entra no painel assim que a sessão é confirmada */
await dados.observarAuth((usuario) => {
  if (!usuario) return;
  $("#telaLogin").style.display = "none";
  $("#painel").classList.add("is-on");
  $("#admEmail").textContent = usuario.email || "";
  carregarTudo();
});

/* ============================================================
   ABAS
   ============================================================ */

$$(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.classList.toggle("is-on", x === t));
    $$(".painel").forEach((p) => p.classList.toggle("is-on", p.id === "aba-" + t.dataset.aba));
  })
);

/* ============================================================
   CARGA INICIAL
   ============================================================ */

async function carregarTudo() {
  $("#infoAmbiente").innerHTML = MODO_DEMO
    ? `<b>Modo demonstração.</b> Tudo o que você cadastrar fica guardado só neste navegador — some se limpar os dados ou trocar de aparelho.
       Para publicar de verdade, preencha <code>js/config.js</code> com as chaves do Firebase.`
    : `<b>Conectado ao Firebase.</b> As alterações aparecem na loja para todo mundo assim que você salva.`;

  await Promise.all([recarregarCategorias(), recarregarProdutos(), carregarConfig()]);
}

async function recarregarCategorias() {
  st.categorias = await dados.categorias();

  const opcoes = st.categorias.map((c) => `<option value="${esc(c.slug)}">${esc(c.nome)}</option>`).join("");
  $("#pCategoria").innerHTML = opcoes || `<option value="">— crie uma categoria primeiro —</option>`;
  $("#filtroCategoria").innerHTML =
    `<option value="">Todas as categorias</option>` + opcoes;

  $("#listaCategorias").innerHTML = st.categorias.length
    ? st.categorias
        .map(
          (c) => `
      <div class="item">
        <div class="item__img" style="display:grid;place-items:center;color:var(--txt-3);font-weight:800">${c.ordem || "–"}</div>
        <div class="item__info">
          <p class="item__nome">${esc(c.nome)}</p>
          <div class="item__meta">
            <span>${esc(c.slug)}</span>
            <span class="pill ${c.ativa !== false ? "pill--on" : "pill--off"}">${c.ativa !== false ? "Visível" : "Oculta"}</span>
            <span>${st.produtos.filter((p) => p.categoria === c.slug).length} produtos</span>
          </div>
        </div>
        <div class="item__acoes">
          <button title="Editar" data-cat-edit="${esc(c.id)}">${ico.lapis}</button>
          <button class="del" title="Excluir" data-cat-del="${esc(c.id)}">${ico.lixeira}</button>
        </div>
      </div>`
        )
        .join("")
    : `<div class="vazio">Nenhuma categoria ainda. Crie a primeira (ex.: Torcedor, Jogador, Retrô).</div>`;

  $$("[data-cat-edit]").forEach((b) =>
    b.addEventListener("click", () => abrirCategoria(st.categorias.find((c) => c.id === b.dataset.catEdit)))
  );
  $$("[data-cat-del]").forEach((b) =>
    b.addEventListener("click", async () => {
      const cat = st.categorias.find((c) => c.id === b.dataset.catDel);
      const usados = st.produtos.filter((p) => p.categoria === cat.slug).length;
      const aviso = usados
        ? `\n\nAtenção: ${usados} produto(s) estão nessa categoria e vão sumir da loja até serem movidos.`
        : "";
      if (!confirm(`Excluir a categoria "${cat.nome}"?${aviso}`)) return;
      await dados.excluirCategoria(cat.id);
      toast("Categoria excluída");
      await recarregarCategorias();
    })
  );
}

async function recarregarProdutos() {
  const { itens } = await dados.produtos({ limite: 1000, todos: true });
  st.produtos = itens;
  renderProdutos();
}

function renderProdutos() {
  const termo = semAcento($("#filtroBusca").value.trim());
  const cat = $("#filtroCategoria").value;
  const status = $("#filtroStatus").value;

  const lista = st.produtos
    .filter((p) => (!termo ? true : semAcento(p.nome).includes(termo)))
    .filter((p) => (!cat ? true : p.categoria === cat))
    .filter((p) => {
      if (status === "ativo") return p.ativo;
      if (status === "inativo") return !p.ativo;
      if (status === "esgotado") return p.esgotado;
      return true;
    })
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0) || (b.criadoEm || 0) - (a.criadoEm || 0));

  const publicados = st.produtos.filter((p) => p.ativo).length;
  $("#resumoProdutos").textContent =
    `${st.produtos.length} no total · ${publicados} publicados · ${st.produtos.length - publicados} ocultos`;

  $("#listaProdutos").innerHTML = lista.length
    ? lista
        .map((p) => {
          const nomeCat = st.categorias.find((c) => c.slug === p.categoria)?.nome || p.categoria || "sem categoria";
          return `
      <div class="item ${p.ativo ? "" : "is-off"}">
        <img class="item__img" src="${esc(p.thumb || "")}" alt="">
        <div class="item__info">
          <p class="item__nome">${esc(p.nome)}</p>
          <div class="item__meta">
            <span class="item__preco">${brl(p.preco)}</span>
            <span>${esc(nomeCat)}</span>
            <span class="pill ${p.ativo ? "pill--on" : "pill--off"}">${p.ativo ? "Publicado" : "Oculto"}</span>
            ${p.destaque ? `<span class="pill pill--dest">Destaque</span>` : ""}
            ${p.esgotado ? `<span class="pill">Esgotado</span>` : ""}
          </div>
        </div>
        <div class="item__acoes">
          <button title="${p.ativo ? "Ocultar da loja" : "Publicar na loja"}" data-toggle="${esc(p.id)}">${p.ativo ? ico.olho : ico.olhoOff}</button>
          <button title="Editar" data-edit="${esc(p.id)}">${ico.lapis}</button>
          <button class="del" title="Excluir" data-del="${esc(p.id)}">${ico.lixeira}</button>
        </div>
      </div>`;
        })
        .join("")
    : `<div class="vazio">Nenhum produto ${st.produtos.length ? "com esses filtros" : "cadastrado ainda"}.</div>`;

  $$("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => abrirProduto(st.produtos.find((p) => p.id === b.dataset.edit)))
  );
  $$("[data-toggle]").forEach((b) =>
    b.addEventListener("click", async () => {
      const p = st.produtos.find((x) => x.id === b.dataset.toggle);
      await dados.salvarProduto({ ...p, ativo: !p.ativo });
      toast(p.ativo ? "Produto ocultado" : "Produto publicado");
      await recarregarProdutos();
    })
  );
  $$("[data-del]").forEach((b) =>
    b.addEventListener("click", async () => {
      const p = st.produtos.find((x) => x.id === b.dataset.del);
      if (!confirm(`Excluir "${p.nome}"? Essa ação não pode ser desfeita.`)) return;
      await dados.excluirProduto(p.id);
      toast("Produto excluído");
      await recarregarProdutos();
    })
  );
}

["#filtroBusca", "#filtroCategoria", "#filtroStatus"].forEach((s) =>
  $(s).addEventListener("input", renderProdutos)
);

/* ============================================================
   MODAL DE PRODUTO
   ============================================================ */

const modal = $("#modalProduto");

function abrirProduto(p = null) {
  if (!st.categorias.length) {
    toast("Crie uma categoria antes de cadastrar produtos");
    return;
  }
  $("#modalTitulo").textContent = p ? "Editar produto" : "Novo produto";
  $("#pId").value = p?.id || "";
  $("#pNome").value = p?.nome || "";
  $("#pCategoria").value = p?.categoria || st.categorias[0]?.slug || "";
  $("#pColecao").value = p?.colecao || "";
  $("#pPreco").value = p?.preco || "";
  $("#pPrecoAntigo").value = p?.precoAntigo || "";
  $("#pOrdem").value = p?.ordem ?? proximaOrdem();
  $("#pDescricao").value = p?.descricao || "";
  $("#pEstrelas").value = String(p?.estrelas || 0);
  $("#pPatch").checked = !!p?.patch;
  $("#pAtivo").checked = p ? !!p.ativo : true;
  $("#pDestaque").checked = !!p?.destaque;
  $("#pEsgotado").checked = !!p?.esgotado;

  st.thumb = p?.thumb || "";
  st.tamanhos = p?.tamanhos?.slice() || ["P", "M", "G", "GG"];
  st.fotosExtras = [];

  renderThumb();
  renderTamanhos();
  $("#previewExtras").innerHTML = "";

  if (p) dados.fotos(p.id).then((f) => { st.fotosExtras = f || []; renderExtras(); });

  modal.classList.add("is-on");
  document.body.style.overflow = "hidden";
}

const proximaOrdem = () => (st.produtos.reduce((m, p) => Math.max(m, p.ordem || 0), 0) || 0) + 1;

function fecharProduto() {
  modal.classList.remove("is-on");
  document.body.style.overflow = "";
}

$("#btnNovo").addEventListener("click", () => abrirProduto());
$("#fecharModal").addEventListener("click", fecharProduto);
$("#cancelarProduto").addEventListener("click", fecharProduto);
modal.addEventListener("click", (e) => { if (e.target === modal) fecharProduto(); });

/* ---------- tamanhos ---------- */

function renderTamanhos() {
  const todos = [...new Set([...TAMANHOS_SUGERIDOS, ...st.tamanhos])];
  $("#pTamanhos").innerHTML = todos
    .map(
      (t) =>
        `<button type="button" class="tamanho ${st.tamanhos.includes(t) ? "is-on" : ""}" data-tam="${esc(t)}">${esc(t)}</button>`
    )
    .join("");
  $$("#pTamanhos [data-tam]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = b.dataset.tam;
      st.tamanhos = st.tamanhos.includes(t) ? st.tamanhos.filter((x) => x !== t) : [...st.tamanhos, t];
      renderTamanhos();
    })
  );
}

$("#pTamanhoNovo").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const t = e.target.value.trim().toUpperCase();
  if (t && !st.tamanhos.includes(t)) st.tamanhos.push(t);
  e.target.value = "";
  renderTamanhos();
});

/* ---------- imagens ---------- */

/**
 * Reduz e comprime a imagem no navegador.
 * A miniatura precisa ser leve (aparece em lista); as fotos da
 * página do produto podem ser um pouco maiores.
 */
function comprimir(arquivo, maxLado, qualidade) {
  return new Promise((ok, falha) => {
    const leitor = new FileReader();
    leitor.onerror = () => falha(new Error("Não foi possível ler a imagem."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => falha(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const l = Math.round(img.width * escala);
        const a = Math.round(img.height * escala);
        const cv = document.createElement("canvas");
        cv.width = l;
        cv.height = a;
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#17171c"; // fundo para imagens com transparência
        ctx.fillRect(0, 0, l, a);
        ctx.drawImage(img, 0, 0, l, a);
        ok(cv.toDataURL("image/jpeg", qualidade));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function renderThumb() {
  $("#previewPrincipal").innerHTML = st.thumb
    ? `<div class="foto"><img src="${esc(st.thumb)}" alt="">
         <button type="button" class="foto__del" data-rm-thumb>${ico.x}</button>
         <span class="foto__cap">capa</span></div>`
    : "";
  $("[data-rm-thumb]")?.addEventListener("click", () => {
    st.thumb = "";
    renderThumb();
  });
}

function renderExtras() {
  $("#previewExtras").innerHTML = st.fotosExtras
    .map(
      (f, i) => `<div class="foto"><img src="${esc(f)}" alt="">
        <button type="button" class="foto__del" data-rm-extra="${i}">${ico.x}</button></div>`
    )
    .join("");
  $$("[data-rm-extra]").forEach((b) =>
    b.addEventListener("click", () => {
      st.fotosExtras.splice(Number(b.dataset.rmExtra), 1);
      renderExtras();
    })
  );
}

function ligarDrop(zonaId, inputId, aoReceber) {
  const zona = $(zonaId);
  const input = $(inputId);
  zona.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    aoReceber([...input.files]);
    input.value = "";
  });
  ["dragenter", "dragover"].forEach((ev) =>
    zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add("is-over"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove("is-over"); })
  );
  zona.addEventListener("drop", (e) =>
    aoReceber([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/")))
  );
}

ligarDrop("#dropPrincipal", "#filePrincipal", async (arquivos) => {
  if (!arquivos[0]) return;
  try {
    st.thumb = await comprimir(arquivos[0], 620, 0.72);
    renderThumb();
  } catch (e) {
    toast(e.message);
  }
});

ligarDrop("#dropExtras", "#fileExtras", async (arquivos) => {
  for (const arq of arquivos.slice(0, 3 - st.fotosExtras.length)) {
    try {
      st.fotosExtras.push(await comprimir(arq, 1000, 0.74));
    } catch (e) {
      toast(e.message);
    }
  }
  if (arquivos.length && st.fotosExtras.length >= 3) toast("Máximo de 3 fotos extras");
  renderExtras();
});

/* ---------- salvar produto ---------- */

$("#salvarProduto").addEventListener("click", async () => {
  const form = $("#formProduto");
  if (!form.reportValidity()) return;
  if (!st.thumb) {
    toast("Escolha a foto principal do produto");
    return;
  }

  const btn = $("#salvarProduto");
  btn.disabled = true;
  btn.textContent = "Salvando…";

  try {
    await dados.salvarProduto(
      {
        id: $("#pId").value || undefined,
        nome: $("#pNome").value,
        categoria: $("#pCategoria").value,
        colecao: $("#pColecao").value,
        preco: $("#pPreco").value,
        precoAntigo: $("#pPrecoAntigo").value,
        ordem: $("#pOrdem").value,
        descricao: $("#pDescricao").value,
        estrelas: $("#pEstrelas").value,
        patch: $("#pPatch").checked,
        ativo: $("#pAtivo").checked,
        destaque: $("#pDestaque").checked,
        esgotado: $("#pEsgotado").checked,
        tamanhos: st.tamanhos,
        thumb: st.thumb,
        criadoEm: st.produtos.find((p) => p.id === $("#pId").value)?.criadoEm,
      },
      st.fotosExtras
    );
    toast("Produto salvo");
    fecharProduto();
    await recarregarProdutos();
    await recarregarCategorias();
  } catch (e) {
    console.error(e);
    toast(e.message || "Não foi possível salvar");
  } finally {
    btn.disabled = false;
    btn.textContent = "Salvar produto";
  }
});

/* ============================================================
   MODAL DE CATEGORIA
   ============================================================ */

const modalCat = $("#modalCategoria");

function abrirCategoria(c = null) {
  $("#modalCatTitulo").textContent = c ? "Editar categoria" : "Nova categoria";
  $("#cId").value = c?.id || "";
  $("#cNome").value = c?.nome || "";
  $("#cOrdem").value = c?.ordem ?? st.categorias.length + 1;
  $("#cAtiva").checked = c ? c.ativa !== false : true;
  modalCat.classList.add("is-on");
  document.body.style.overflow = "hidden";
}

function fecharCategoria() {
  modalCat.classList.remove("is-on");
  document.body.style.overflow = "";
}

$("#btnNovaCat").addEventListener("click", () => abrirCategoria());
$("#fecharModalCat").addEventListener("click", fecharCategoria);
$("#cancelarCat").addEventListener("click", fecharCategoria);
modalCat.addEventListener("click", (e) => { if (e.target === modalCat) fecharCategoria(); });

$("#salvarCat").addEventListener("click", async () => {
  if (!$("#formCategoria").reportValidity()) return;
  const nome = $("#cNome").value.trim();
  try {
    await dados.salvarCategoria({
      id: $("#cId").value || slugify(nome),
      nome,
      ordem: $("#cOrdem").value,
      ativa: $("#cAtiva").checked,
    });
    toast("Categoria salva");
    fecharCategoria();
    await recarregarCategorias();
  } catch (e) {
    toast(e.message || "Não foi possível salvar");
  }
});

/* ============================================================
   DADOS DA LOJA
   ============================================================ */

async function carregarConfig() {
  st.cfg = await dados.config();
  const c = { ...CONFIG_PADRAO, ...st.cfg };
  $("#cfgNome").value = c.nome || "";
  $("#cfgWhats").value = c.whatsapp || "";
  $("#cfgMsg").value = c.mensagemPadrao || "";
  $("#cfgSlogan").value = c.slogan || "";
  $("#cfgInsta").value = c.instagram || "";
  $("#cfgHeroTitulo").value = c.heroTitulo || "";
  $("#cfgHeroTexto").value = c.heroTexto || "";
  $("#cfgAvisos").value = (c.avisos || []).join("\n");
  $("#cfgRodape").value = c.rodapeTexto || "";
}

/** Aceita "(11) 98888-7777" e devolve "5511988887777". */
function normalizarWhats(valor) {
  const n = String(valor).replace(/\D/g, "");
  return n.length === 10 || n.length === 11 ? "55" + n : n;
}

$("#formLoja").addEventListener("submit", async (e) => {
  e.preventDefault();
  const whats = normalizarWhats($("#cfgWhats").value);
  if (whats.length < 12 || whats.length > 13) {
    toast("Confira o WhatsApp: use DDD + número (ex.: 11988887777)");
    return;
  }
  $("#cfgWhats").value = whats;
  try {
    await dados.salvarConfig({
      nome: $("#cfgNome").value.trim(),
      whatsapp: whats,
      mensagemPadrao: $("#cfgMsg").value.trim(),
      slogan: $("#cfgSlogan").value.trim(),
      instagram: $("#cfgInsta").value.trim(),
      heroTitulo: $("#cfgHeroTitulo").value.trim(),
      heroTexto: $("#cfgHeroTexto").value.trim(),
      avisos: $("#cfgAvisos").value.split("\n").map((s) => s.trim()).filter(Boolean),
      rodapeTexto: $("#cfgRodape").value.trim(),
    });
    toast("Dados da loja salvos");
  } catch (ex) {
    toast(ex.message || "Não foi possível salvar");
  }
});

/* ============================================================
   BACKUP
   ============================================================ */

$("#btnExportar").addEventListener("click", async () => {
  const conteudo = await dados.exportar();
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `catalogo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Backup baixado");
});

$("#btnImportar").addEventListener("click", () => $("#arquivoImport").click());

$("#arquivoImport").addEventListener("change", async (e) => {
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  if (!confirm("Importar este arquivo? Os itens do backup serão gravados por cima dos atuais.")) return;
  try {
    const conteudo = JSON.parse(await arquivo.text());
    if (!conteudo.produtos && !conteudo.categorias) throw new Error("Arquivo fora do formato esperado.");
    await dados.importar(conteudo);
    toast("Backup importado");
    await carregarTudo();
  } catch (ex) {
    toast(ex.message || "Arquivo inválido");
  } finally {
    e.target.value = "";
  }
});
