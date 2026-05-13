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

// ARTIGOS
document
  .getElementById("formArtigos")
  .addEventListener("submit", function(e){

    e.preventDefault();

    const titulo = document.getElementById("tituloArtigo").value;

    const descricao = document.getElementById("descricaoArtigo").value;

    criarLinha("tabelaArtigos", [titulo, descricao]);

    this.reset();
});

// AUTORES
document
  .getElementById("formAutores")
  .addEventListener("submit", function(e){

    e.preventDefault();

    const nome = document.getElementById("nomeAutor").value;

    const email = document.getElementById("emailAutor").value;

    criarLinha("tabelaAutores", [nome, email]);

    this.reset();
});

// PALAVRAS-CHAVE
document
  .getElementById("formPalavras")
  .addEventListener("submit", function(e){

    e.preventDefault();

    const palavra = document.getElementById("palavraChave").value;

    criarLinha("tabelaPalavras", [palavra]);

    this.reset();
});

// REFERÊNCIAS
document
  .getElementById("formReferencias")
  .addEventListener("submit", function(e){

    e.preventDefault();

    const referencia = document.getElementById("referenciaTexto").value;

    criarLinha("tabelaReferencias", [referencia]);

    this.reset();
});