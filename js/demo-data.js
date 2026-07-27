/* ============================================================
   DADOS DE DEMONSTRAÇÃO
   Usados só quando o Firebase ainda não foi configurado, para que
   o site já abra com conteúdo. Assim que a loja for populada pelo
   painel, esses dados deixam de aparecer.
   As imagens são desenhadas em SVG (nenhum arquivo externo).
   ============================================================ */

/** Gera uma imagem de camisa em SVG (data URI) para os produtos de exemplo. */
function camisa(corBase, corDetalhe, listras = false) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#212127"/><stop offset="1" stop-color="#141418"/>
      </linearGradient>
      <pattern id="mesh" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0V16M0 0H16" stroke="#2b2b33" stroke-width="1.2" fill="none"/>
      </pattern>
      <pattern id="st" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="5" height="14" fill="${corDetalhe}" opacity=".35"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#bg)"/>
    <rect width="400" height="400" fill="url(#mesh)"/>
    <g transform="translate(200 205)">
      <path d="M-96-70 -40-96 -22-84a22 22 0 0 0 44 0L40-96 96-70 78-18 58-26 58 96H-58V-26L-78-18Z"
        fill="${corBase}" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/>
      ${listras ? `<path d="M-96-70 -40-96 -22-84a22 22 0 0 0 44 0L40-96 96-70 78-18 58-26 58 96H-58V-26L-78-18Z" fill="url(#st)"/>` : ""}
      <path d="M-22-84a22 22 0 0 0 44 0" fill="none" stroke="${corDetalhe}" stroke-width="7"/>
      <path d="M-96-70 -78-18" stroke="${corDetalhe}" stroke-width="6" fill="none" opacity=".85"/>
      <path d="M96-70 78-18" stroke="${corDetalhe}" stroke-width="6" fill="none" opacity=".85"/>
      <circle cx="34" cy="-30" r="13" fill="rgba(255,255,255,.16)"/>
    </g>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export const CATEGORIAS_DEMO = [
  { id: "torcedor", nome: "Torcedor", slug: "torcedor", ordem: 1, ativa: true },
  { id: "jogador", nome: "Jogador", slug: "jogador", ordem: 2, ativa: true },
  { id: "retro", nome: "Retrô", slug: "retro", ordem: 3, ativa: true },
  { id: "infantil", nome: "Infantil", slug: "infantil", ordem: 4, ativa: true },
  { id: "feminina", nome: "Feminina", slug: "feminina", ordem: 5, ativa: true },
];

const base = {
  ativo: true,
  tamanhos: ["P", "M", "G", "GG", "XGG"],
  descricao:
    "Tecido dry-fit de alta qualidade, com respiro e caimento leve.\nEscudo e detalhes bordados.\nProduto de primeira linha (1:1).",
};

let n = 0;
const p = (o) => ({ id: "demo" + ++n, ordem: n, criadoEm: Date.now() - n * 6e5, ...base, ...o });

export const PRODUTOS_DEMO = [
  p({ nome: "Camisa Espanha 2026 Home", categoria: "torcedor", preco: 62, precoAntigo: 159.9, estrelas: 2, thumb: camisa("#d8232f", "#f5c344", true) }),
  p({ nome: "Camisa Espanha 2026 Home (Com Patch)", categoria: "torcedor", preco: 74, precoAntigo: 159.9, estrelas: 2, patch: true, thumb: camisa("#c8202b", "#123a8c", true) }),
  p({ nome: "Camisa Argentina 2026 Home", categoria: "torcedor", preco: 62, precoAntigo: 159.9, estrelas: 2, thumb: camisa("#75aadb", "#ffffff", true) }),
  p({ nome: "Camisa Brasil 2026 Home", categoria: "torcedor", preco: 68, precoAntigo: 169.9, estrelas: 2, thumb: camisa("#f7d117", "#0f9d58") }),
  p({ nome: "Camisa Portugal 2026 Away", categoria: "torcedor", preco: 62, precoAntigo: 159.9, estrelas: 1, thumb: camisa("#f4f4f2", "#c8202b") }),
  p({ nome: "Camisa França 2026 Home", categoria: "torcedor", preco: 64, precoAntigo: 159.9, estrelas: 2, thumb: camisa("#1b3d8f", "#e1121f") }),

  p({ nome: "Camisa Espanha 2026 Away — Versão Jogador", categoria: "jogador", preco: 79, precoAntigo: 329.9, estrelas: 2, thumb: camisa("#f2efe6", "#6d1a2a") }),
  p({ nome: "Camisa Espanha 2026 Home — Versão Jogador", categoria: "jogador", preco: 82, precoAntigo: 349.9, estrelas: 2, patch: true, thumb: camisa("#cf1f2b", "#132c6b", true) }),
  p({ nome: "Camisa Alemanha 2026 — Versão Jogador", categoria: "jogador", preco: 84, precoAntigo: 349.9, estrelas: 2, thumb: camisa("#efefef", "#141414") }),
  p({ nome: "Camisa Inglaterra 2026 — Versão Jogador", categoria: "jogador", preco: 84, precoAntigo: 339.9, estrelas: 1, thumb: camisa("#fbfbfb", "#1b3d8f") }),

  p({ nome: "Camisa Retrô Espanha 2010", categoria: "retro", preco: 89, precoAntigo: 259.9, estrelas: 2, thumb: camisa("#8e1420", "#f0c040") }),
  p({ nome: "Camisa Retrô Brasil 2002", categoria: "retro", preco: 95, precoAntigo: 289.9, estrelas: 2, thumb: camisa("#f5d316", "#0a6b3d") }),
  p({ nome: "Camisa Retrô Itália 1994", categoria: "retro", preco: 92, precoAntigo: 279.9, estrelas: 1, thumb: camisa("#1e4fa3", "#ffffff") }),
  p({ nome: "Camisa Retrô Holanda 1988", categoria: "retro", preco: 92, precoAntigo: 279.9, estrelas: 1, thumb: camisa("#ef6c17", "#111111") }),

  p({ nome: "Kit Infantil Espanha 2026 Home", categoria: "infantil", preco: 80, precoAntigo: 339.9, thumb: camisa("#d8232f", "#16265e", true), tamanhos: ["16", "18", "20", "22", "24", "26", "28"] }),
  p({ nome: "Kit Infantil Espanha 2026 Away", categoria: "infantil", preco: 80, precoAntigo: 339.9, thumb: camisa("#f2efe6", "#6d1a2a"), tamanhos: ["16", "18", "20", "22", "24", "26", "28"] }),
  p({ nome: "Kit Infantil Brasil 2026 Home", categoria: "infantil", preco: 85, precoAntigo: 349.9, thumb: camisa("#f7d117", "#0f9d58"), tamanhos: ["16", "18", "20", "22", "24", "26", "28"] }),
  p({ nome: "Kit Infantil Argentina 2026", categoria: "infantil", preco: 85, precoAntigo: 349.9, thumb: camisa("#75aadb", "#ffffff", true), tamanhos: ["16", "18", "20", "22", "24", "26", "28"] }),

  p({ nome: "Camisa Espanha 2026 Home — Feminina", categoria: "feminina", preco: 62, precoAntigo: 329.9, thumb: camisa("#d8232f", "#f5c344", true), tamanhos: ["PP", "P", "M", "G", "GG"] }),
  p({ nome: "Camisa Espanha 2026 Away — Feminina", categoria: "feminina", preco: 62, precoAntigo: 329.9, thumb: camisa("#f2efe6", "#6d1a2a"), tamanhos: ["PP", "P", "M", "G", "GG"] }),
  p({ nome: "Camisa Brasil 2026 — Feminina", categoria: "feminina", preco: 68, precoAntigo: 329.9, thumb: camisa("#f7d117", "#0f9d58"), tamanhos: ["PP", "P", "M", "G", "GG"] }),
  p({ nome: "Camisa Portugal 2026 — Feminina", categoria: "feminina", preco: 62, precoAntigo: 319.9, thumb: camisa("#8e1420", "#0a6b3d"), tamanhos: ["PP", "P", "M", "G", "GG"] }),
];
