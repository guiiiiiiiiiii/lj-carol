/* ============================================================
   CAMADA DE DADOS
   ------------------------------------------------------------
   Uma única interface para o resto do site. Por baixo ela usa:
     • Firebase (Firestore + Auth) quando js/config.js está preenchido
     • localStorage quando não está (modo demonstração)

   Assim a loja funciona de imediato e, ao plugar o Firebase,
   nenhuma outra parte do código precisa mudar.
   ============================================================ */

import {
  firebaseConfig,
  FIREBASE_VERSION,
  CONFIG_PADRAO,
  DEMO_SENHA,
} from "./config.js";
import { CATEGORIAS_DEMO, PRODUTOS_DEMO } from "./demo-data.js";

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
const CHAVE_LOCAL = "catalogo_camisas_v1";

/** true quando js/config.js ainda tem os placeholders. */
export const MODO_DEMO = Object.values(firebaseConfig).some(
  (v) => !v || String(v).includes("COLE_AQUI")
);

/* ------------------------------------------------------------
   Utilidades compartilhadas
   ------------------------------------------------------------ */

export const semAcento = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const slugify = (s) =>
  semAcento(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/** Palavras indexáveis do produto, usadas na busca. */
function tokens(produto) {
  const texto = [produto.nome, produto.categoria, produto.colecao].join(" ");
  return [...new Set(semAcento(texto).split(/[^a-z0-9]+/).filter((t) => t.length > 2))].slice(0, 30);
}

/** Normaliza o produto antes de gravar (campos derivados + tipos). */
function normalizar(p) {
  const preco = Number(p.preco) || 0;
  const precoAntigo = Number(p.precoAntigo) || 0;
  return {
    nome: String(p.nome || "").trim(),
    categoria: p.categoria || "",
    colecao: (p.colecao || "").trim(),
    descricao: (p.descricao || "").trim(),
    preco,
    precoAntigo: precoAntigo > preco ? precoAntigo : 0,
    thumb: p.thumb || "",
    tamanhos: Array.isArray(p.tamanhos) ? p.tamanhos : [],
    estrelas: Number(p.estrelas) || 0,
    patch: !!p.patch,
    destaque: !!p.destaque,
    esgotado: !!p.esgotado,
    ativo: p.ativo !== false,
    ordem: Number(p.ordem) || 0,
    nomeLower: semAcento(p.nome),
    palavras: tokens(p),
    criadoEm: p.criadoEm || Date.now(),
    atualizadoEm: Date.now(),
  };
}

/* ============================================================
   IMPLEMENTAÇÃO LOCAL (modo demonstração)
   ============================================================ */

const local = {
  ler() {
    try {
      const bruto = localStorage.getItem(CHAVE_LOCAL);
      if (bruto) return JSON.parse(bruto);
    } catch (_) {}
    const inicial = {
      config: { ...CONFIG_PADRAO },
      categorias: structuredClone(CATEGORIAS_DEMO),
      produtos: structuredClone(PRODUTOS_DEMO).map(normalizar).map((p, i) => ({
        ...p,
        id: PRODUTOS_DEMO[i].id,
      })),
      fotos: {},
    };
    local.gravar(inicial);
    return inicial;
  },
  gravar(dados) {
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(dados));
    } catch (e) {
      console.warn("Não foi possível salvar localmente (espaço cheio?)", e);
      throw new Error(
        "O armazenamento do navegador encheu. Configure o Firebase para guardar as imagens sem limite."
      );
    }
  },
};

const apiLocal = {
  async config() {
    return { ...CONFIG_PADRAO, ...local.ler().config };
  },
  async salvarConfig(c) {
    const d = local.ler();
    d.config = { ...d.config, ...c };
    local.gravar(d);
  },
  async categorias() {
    return local.ler().categorias.slice().sort((a, b) => a.ordem - b.ordem);
  },
  async salvarCategoria(cat) {
    const d = local.ler();
    const id = cat.id || slugify(cat.nome);
    const i = d.categorias.findIndex((c) => c.id === id);
    const novo = { ...cat, id, slug: id, ordem: Number(cat.ordem) || 0, ativa: cat.ativa !== false };
    i >= 0 ? (d.categorias[i] = novo) : d.categorias.push(novo);
    local.gravar(d);
    return id;
  },
  async excluirCategoria(id) {
    const d = local.ler();
    d.categorias = d.categorias.filter((c) => c.id !== id);
    local.gravar(d);
  },
  async produtos({ categoria, busca, destaque, limite = 12, cursor = 0, todos = false } = {}) {
    let lista = local.ler().produtos.slice();
    if (!todos) lista = lista.filter((p) => p.ativo);
    if (categoria) lista = lista.filter((p) => p.categoria === categoria);
    if (destaque) lista = lista.filter((p) => p.destaque);
    if (busca) {
      const t = semAcento(busca);
      lista = lista.filter(
        (p) => semAcento(p.nome).includes(t) || (p.palavras || []).some((w) => w.includes(t))
      );
    }
    lista.sort((a, b) => a.ordem - b.ordem || b.criadoEm - a.criadoEm);
    const inicio = Number(cursor) || 0;
    return {
      itens: lista.slice(inicio, inicio + limite),
      proximo: inicio + limite < lista.length ? inicio + limite : null,
      total: lista.length,
    };
  },
  async produto(id) {
    return local.ler().produtos.find((p) => p.id === id) || null;
  },
  async fotos(id) {
    return local.ler().fotos[id] || [];
  },
  async salvarProduto(p, fotos) {
    const d = local.ler();
    const id = p.id || "p" + Date.now().toString(36);
    const dados = { ...normalizar(p), id };
    const i = d.produtos.findIndex((x) => x.id === id);
    i >= 0 ? (d.produtos[i] = dados) : d.produtos.push(dados);
    if (fotos) d.fotos[id] = fotos;
    local.gravar(d);
    return id;
  },
  async excluirProduto(id) {
    const d = local.ler();
    d.produtos = d.produtos.filter((p) => p.id !== id);
    delete d.fotos[id];
    local.gravar(d);
  },
  async entrar(_email, senha) {
    if (senha !== DEMO_SENHA)
      throw new Error("Senha incorreta. No modo demonstração a senha é definida em js/config.js.");
    sessionStorage.setItem(CHAVE_LOCAL + "_auth", "1");
    document.dispatchEvent(new CustomEvent("auth", { detail: { email: "demo@local" } }));
    return { email: "demo@local" };
  },
  async sair() {
    sessionStorage.removeItem(CHAVE_LOCAL + "_auth");
    document.dispatchEvent(new CustomEvent("auth", { detail: null }));
  },
  observarAuth(cb) {
    const logado = sessionStorage.getItem(CHAVE_LOCAL + "_auth") === "1";
    setTimeout(() => cb(logado ? { email: "demo@local" } : null), 0);
    document.addEventListener("auth", (e) => cb(e.detail));
  },
  async exportar() {
    return local.ler();
  },
  async importar(dados) {
    local.gravar(dados);
  },
};

/* ============================================================
   IMPLEMENTAÇÃO FIREBASE
   ============================================================ */

let fb = null;

async function firebase() {
  if (fb) return fb;
  const [app, store, auth] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-firestore.js`),
    import(`${CDN}/firebase-auth.js`),
  ]);
  const application = app.initializeApp(firebaseConfig);
  fb = {
    ...store,
    ...auth,
    db: store.getFirestore(application),
    auth: auth.getAuth(application),
  };
  return fb;
}

const apiFirebase = {
  async config() {
    const f = await firebase();
    const snap = await f.getDoc(f.doc(f.db, "config", "loja"));
    return { ...CONFIG_PADRAO, ...(snap.exists() ? snap.data() : {}) };
  },
  async salvarConfig(c) {
    const f = await firebase();
    await f.setDoc(f.doc(f.db, "config", "loja"), c, { merge: true });
  },
  async categorias() {
    const f = await firebase();
    const snap = await f.getDocs(f.query(f.collection(f.db, "categorias"), f.orderBy("ordem")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async salvarCategoria(cat) {
    const f = await firebase();
    const id = cat.id || slugify(cat.nome);
    await f.setDoc(f.doc(f.db, "categorias", id), {
      nome: cat.nome,
      slug: id,
      ordem: Number(cat.ordem) || 0,
      ativa: cat.ativa !== false,
    });
    return id;
  },
  async excluirCategoria(id) {
    const f = await firebase();
    await f.deleteDoc(f.doc(f.db, "categorias", id));
  },
  async produtos({ categoria, busca, destaque, limite = 12, cursor = null, todos = false } = {}) {
    const f = await firebase();
    const filtros = [];
    if (!todos) filtros.push(f.where("ativo", "==", true));
    if (categoria) filtros.push(f.where("categoria", "==", categoria));
    if (destaque) filtros.push(f.where("destaque", "==", true));
    if (busca) filtros.push(f.where("palavras", "array-contains", semAcento(busca).split(/\s+/)[0]));

    let q = f.query(
      f.collection(f.db, "produtos"),
      ...filtros,
      f.orderBy("ordem"),
      f.limit(limite + 1)
    );
    if (cursor) q = f.query(q, f.startAfter(cursor));

    const snap = await f.getDocs(q);
    const docs = snap.docs.slice(0, limite);
    return {
      itens: docs.map((d) => ({ id: d.id, ...d.data() })),
      proximo: snap.docs.length > limite ? docs[docs.length - 1] : null,
      total: null, // o Firestore não devolve contagem junto; a UI se vira sem isso
    };
  },
  async produto(id) {
    const f = await firebase();
    const snap = await f.getDoc(f.doc(f.db, "produtos", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async fotos(id) {
    const f = await firebase();
    const snap = await f.getDoc(f.doc(f.db, "fotos", id));
    return snap.exists() ? snap.data().lista || [] : [];
  },
  async salvarProduto(p, fotos) {
    const f = await firebase();
    const ref = p.id
      ? f.doc(f.db, "produtos", p.id)
      : f.doc(f.collection(f.db, "produtos"));
    await f.setDoc(ref, normalizar(p));
    if (fotos) await f.setDoc(f.doc(f.db, "fotos", ref.id), { lista: fotos });
    return ref.id;
  },
  async excluirProduto(id) {
    const f = await firebase();
    await f.deleteDoc(f.doc(f.db, "produtos", id));
    try {
      await f.deleteDoc(f.doc(f.db, "fotos", id));
    } catch (_) {}
  },
  async entrar(email, senha) {
    const f = await firebase();
    const cred = await f.signInWithEmailAndPassword(f.auth, email, senha);
    return cred.user;
  },
  async sair() {
    const f = await firebase();
    await f.signOut(f.auth);
  },
  async observarAuth(cb) {
    const f = await firebase();
    f.onAuthStateChanged(f.auth, cb);
  },
  async exportar() {
    const [config, categorias, prods] = await Promise.all([
      apiFirebase.config(),
      apiFirebase.categorias(),
      apiFirebase.produtos({ limite: 1000, todos: true }),
    ]);
    return { config, categorias, produtos: prods.itens, fotos: {} };
  },
  async importar(dados) {
    const f = await firebase();
    const lote = f.writeBatch(f.db);
    (dados.categorias || []).forEach((c) =>
      lote.set(f.doc(f.db, "categorias", c.id || slugify(c.nome)), {
        nome: c.nome,
        slug: c.slug || slugify(c.nome),
        ordem: Number(c.ordem) || 0,
        ativa: c.ativa !== false,
      })
    );
    (dados.produtos || []).forEach((p) => {
      const ref = p.id ? f.doc(f.db, "produtos", p.id) : f.doc(f.collection(f.db, "produtos"));
      lote.set(ref, normalizar(p));
    });
    if (dados.config) lote.set(f.doc(f.db, "config", "loja"), dados.config, { merge: true });
    await lote.commit();
  },
};

/* ============================================================
   EXPORT — a API única usada pelas páginas
   ============================================================ */

export const dados = MODO_DEMO ? apiLocal : apiFirebase;
