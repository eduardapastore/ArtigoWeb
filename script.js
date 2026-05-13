const API = "http://localhost:3000";

// =========================
// MOSTRAR TABELAS
// =========================
function mostrarTabela(id) {
  document.querySelectorAll(".tabela").forEach(t => {
    t.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");

  if (id === "artigos") carregarArtigos();
  if (id === "autores") carregarAutores();
  if (id === "referencias") carregarReferencias();
}

// =========================
// LIMPAR TABELA
// =========================
function limparTabela(id) {
  document.getElementById(id).innerHTML = "";
}

// =========================
// ARTIGOS
// =========================
async function carregarArtigos() {
  const res = await fetch(`${API}/Artigo`);
  const data = await res.json();

  limparTabela("tabelaArtigos");

  data.forEach(item => {
    criarLinha("tabelaArtigos", [
      item.titulo,
      item.descricao
    ]);
  });
}

// =========================
// AUTORES
// =========================
async function carregarAutores() {
  const res = await fetch(`${API}/Autor`);
  const data = await res.json();

  limparTabela("tabelaAutores");

  data.forEach(item => {
    criarLinha("tabelaAutores", [
      item.nome
    ]);
  });
}

// =========================
// REFERÊNCIAS
// =========================
async function carregarReferencias() {
  const res = await fetch(`${API}/Referencia`);
  const data = await res.json();

  limparTabela("tabelaReferencias");

  data.forEach(item => {
    criarLinha("tabelaReferencias", [
      item.referencia
    ]);
  });
}

// =========================
// FUNÇÃO GENÉRICA DE LINHA
// =========================
function criarLinha(tabelaId, valores) {
  const tabela = document.getElementById(tabelaId);

  const tr = document.createElement("tr");

  valores.forEach(valor => {
    const td = document.createElement("td");
    td.textContent = valor;
    tr.appendChild(td);
  });

  const tdAcao = document.createElement("td");

  const btn = document.createElement("button");
  btn.textContent = "Excluir";
  btn.classList.add("delete-btn");

  btn.onclick = () => {
    tr.remove();
  };

  tdAcao.appendChild(btn);
  tr.appendChild(tdAcao);

  tabela.appendChild(tr);
}