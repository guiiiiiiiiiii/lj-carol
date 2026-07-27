# Catálogo de Camisas

Catálogo digital para loja de camisas de time. O cliente navega por seções,
abre o produto e finaliza o pedido **no WhatsApp** — não há carrinho nem checkout.
A dona da loja cadastra e edita tudo por um painel próprio, sem mexer em código.

HTML + CSS + JavaScript puro (sem build, sem framework) e Firebase para os dados.

---

## Arquivos

```
index.html        vitrine — uma faixa por categoria, com amostra do estoque
categoria.html    lista completa de uma categoria (ou resultado de busca)
produto.html      página do produto, com botão de pedido no WhatsApp
admin.html        painel da loja (protegido por login)

css/loja.css      visual da loja
css/admin.css     visual do painel

js/config.js      >>> ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR <<<
js/db.js          acesso aos dados (Firebase ou navegador)
js/ui.js          cabeçalho, rodapé, card de produto, links de WhatsApp
js/home.js        js/categoria.js  js/produto.js  js/admin.js

firestore.rules          regras de segurança do banco
firestore.indexes.json   índices das consultas
```

---

## Rodando agora (sem Firebase)

Como são arquivos estáticos, basta um servidor local — abrir com duplo clique
não funciona, porque o navegador bloqueia módulos JavaScript em `file://`.

```bash
python -m http.server 5580
```

Depois acesse `http://localhost:5580`.

Enquanto o `js/config.js` não for preenchido, o site roda em **modo demonstração**:
os dados ficam no `localStorage` do próprio navegador e já vêm produtos de exemplo.
A senha do painel nesse modo é a que está em `DEMO_SENHA` (padrão: `carol123`).

---

## Ligando o Firebase (publicação de verdade)

1. Crie um projeto em <https://console.firebase.google.com>.
2. **Build > Authentication > Sign-in method** → ative **E-mail/senha**.
3. **Build > Firestore Database** → criar banco em **modo de produção**.
4. **Configurações do projeto > Seus apps > Web (`</>`)** → registre o app e
   copie o objeto `firebaseConfig`.
5. Cole esses valores em `js/config.js`, no lugar dos `"COLE_AQUI"`.

### Criar o acesso da dona da loja

1. **Authentication > Users > Adicionar usuário** — e-mail e senha dela.
2. Copie o **UID** que aparece na lista.
3. **Firestore > Iniciar coleção** com o nome `admins` → crie um documento cujo
   **ID é exatamente esse UID** (pode deixar um campo `email` dentro, só para
   você lembrar de quem é).

Só quem tem documento em `admins` consegue gravar. Sem isso, o login entra mas
qualquer tentativa de salvar é recusada pelo banco.

### Publicar regras e índices

Com o [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Sem o CLI, dá para colar o conteúdo de `firestore.rules` na aba **Regras** do
Firestore. Já os índices: abra o site uma vez, e o erro que aparecer no console
do navegador traz um link que cria o índice faltante com um clique.

### Hospedar

Qualquer hospedagem de site estático serve (Firebase Hosting, Vercel, Netlify,
GitHub Pages). Com o Firebase CLI:

```bash
firebase init hosting
firebase deploy --only hosting
```

---

## Como a dona usa o painel

Acesse `/admin.html` (também há o link **Área da loja** no rodapé).

| Aba | O que faz |
|---|---|
| **Produtos** | Cadastrar, editar, ocultar e excluir. O botão do olho tira o produto da loja sem apagá-lo. |
| **Categorias** | As seções da página inicial. O campo *Posição* define a ordem. |
| **Dados da loja** | Nome, WhatsApp, textos da home e os avisos da faixa preta. |
| **Backup** | Baixa um `.json` com o catálogo inteiro e permite repor depois. |

Detalhes que importam no dia a dia:

- **Fotos**: escolha a imagem normal do celular — ela é reduzida e comprimida no
  próprio navegador antes de salvar, para o catálogo carregar rápido no 4G.
  Uma foto de capa (obrigatória) e até três fotos extras por produto.
- **Preço "de"**: preencher esse campo é o que gera o selo vermelho de `% OFF`.
- **Posição**: número menor aparece primeiro, na home e na listagem.
- **WhatsApp**: pode digitar `(11) 98888-7777` — o código do país entra sozinho.
- **Seção vazia não aparece** na home; ela volta assim que tiver um produto.

---

## Decisões que valem conhecer

**O estoque não é exposto de uma vez.** A home mostra até 8 itens por categoria
em carrossel, e o resto fica atrás do "Ver todos". A página de categoria carrega
12 por vez, com botão de carregar mais. Isso mantém o site leve e dá ao cliente
uma sensação de vitrine organizada em vez de lista infinita.

**As imagens ficam no Firestore, não no Storage.** O Firebase Storage passou a
exigir plano pago em projetos novos. Guardando a miniatura comprimida junto do
produto (~30 KB) e as fotos grandes num documento separado, carregado só na
página do produto, o projeto inteiro roda no plano gratuito.

**A busca é por palavra.** Cada produto guarda um campo `palavras` com os termos
do nome; a consulta usa `array-contains`. Resolve bem o caso real ("espanha",
"retrô", "infantil") sem depender de serviço externo de busca.

**Modo demonstração.** `js/db.js` expõe a mesma interface para Firebase e para
`localStorage`. É o que permite testar o site inteiro, inclusive o painel, antes
de existir qualquer conta no Firebase.
