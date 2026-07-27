/* ============================================================
   CONFIGURAÇÃO DO PROJETO
   ------------------------------------------------------------
   1) Crie um projeto em https://console.firebase.google.com
   2) Ative  Authentication > Sign-in method > E-mail/senha
   3) Ative  Firestore Database (modo produção)
   4) Em "Configurações do projeto > Seus apps > Web", copie o
      objeto de configuração e cole abaixo, no lugar dos "COLE_AQUI".

   Enquanto os campos não forem preenchidos, o site roda em
   MODO DEMONSTRAÇÃO: os dados ficam salvos apenas no navegador
   (localStorage) e servem para testar o layout e o painel.
   ============================================================ */

export const firebaseConfig = {
  apiKey: "AIzaSyCQhAU7QyGEgH-_SMeTXC-4smza3gHP604",
  authDomain: "loja-carol.firebaseapp.com",
  projectId: "loja-carol",
  storageBucket: "loja-carol.firebasestorage.app",
  messagingSenderId: "925844879545",
  appId: "1:925844879545:web:cd96645500680e66d08368",
  measurementId: "G-Y0L2XQB487"
};

/* Versão do SDK do Firebase carregada via CDN. */
export const FIREBASE_VERSION = "11.0.2";

/* Senha usada apenas no MODO DEMONSTRAÇÃO (sem Firebase configurado).
   Com o Firebase ativo, o login passa a ser o de verdade (e-mail + senha). */
export const DEMO_SENHA = "carol123";

/* Valores usados quando ainda não há nada salvo em "config/loja". */
export const CONFIG_PADRAO = {
  nome: "Carol Sports",
  slogan: "Camisas de time — atacado e varejo",
  whatsapp: "5511999999999", // formato: 55 + DDD + número (só dígitos)
  mensagemPadrao: "Olá! Vi o catálogo e queria saber mais sobre:",
  instagram: "",
  avisos: [
    "ENVIO PARA TODO O BRASIL",
    "PAGUE COM PIX E GANHE DESCONTO",
    "ATACADO A PARTIR DE 5 PEÇAS",
  ],
  heroTitulo: "Coleção 2026",
  heroTexto:
    "Camisas de torcedor, versão jogador, retrô, feminina e infantil. Escolha a peça e fale com a gente no WhatsApp.",
  rodapeTexto:
    "Catálogo digital. Preços e disponibilidade sujeitos a alteração — confirme no WhatsApp antes de fechar o pedido.",
};

/* Quantos produtos aparecem por vez. A ideia é nunca despejar o
   estoque inteiro de uma vez: a home mostra uma amostra por seção
   e a página da categoria carrega aos poucos. */
export const LIMITE_HOME = 8;
export const LIMITE_PAGINA = 12;