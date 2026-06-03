console.log("script.js carregado!");

// ===========================
// ELEMENTOS (SAFE)
// ===========================

const container = document.getElementById("articles");
const tableHead = document.getElementById("tableHead");

// evita crash se DOM ainda não carregou
if (!container || !tableHead) {
    console.error("DOM não carregado corretamente");
}

// ===========================
// STATE
// ===========================

let articles = [];

// ===========================
// UTIL
// ===========================

function showSuccess(message) {
    alert("✅ " + message);
}

function showError(message) {
    alert("❌ " + message);
}

// ===========================
// CARREGAR ARTIGOS
// ===========================

async function loadArticles() {

    const { data, error } = await supabaseClient
        .from("csvarticles")
        .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
        console.error(error);
        showError("Erro ao carregar artigos");
        return;
    }

    articles = data || [];

    if (articles.length > 0) {
        createTableHeader(Object.keys(articles[0]));
    }

    renderArticles(articles);
}

// ===========================
// DELETE TODOS
// ===========================

async function deleteAllArticles() {

    const ok = confirm("⚠️ Isso vai apagar TODOS os artigos. Deseja continuar?");
    if (!ok) return;

    const ok2 = confirm("🚨 Última confirmação: apagar tudo?");
    if (!ok2) return;

    const { error } = await supabaseClient
        .from("csvarticles")
        .delete()
        .neq("id", 0);

    if (error) {
        console.error(error);
        showError("Erro ao deletar todos os artigos");
        return;
    }

    showSuccess("Todos os artigos foram removidos!");
    loadArticles();
}

// ===========================
// DELETE SEM ABSTRACT
// ===========================

async function deleteNoAbstractArticles() {

    const ok = confirm("⚠️ Remover artigos sem abstract?");
    if (!ok) return;

    const { error } = await supabaseClient
        .from("csvarticles")
        .delete()
        .or("abstract.is.null,abstract.eq.''");

    if (error) {
        console.error(error);
        showError("Erro ao remover artigos sem abstract");
        return;
    }

    showSuccess("Artigos sem abstract removidos!");
    loadArticles();
}

// ===========================
// CABEÇALHO
// ===========================

function createTableHeader(columns) {

    if (!tableHead) return;

    tableHead.innerHTML = "";

    const tr = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        tr.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.textContent = "Ações";

    tr.appendChild(actionTh);
    tableHead.appendChild(tr);
}

// ===========================
// RENDER
// ===========================

function renderArticles(list) {

    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="100%">Nenhum artigo encontrado</td>
            </tr>
        `;
        return;
    }

    list.forEach(article => {

        const tr = document.createElement("tr");

        Object.entries(article).forEach(([key, value]) => {

            const td = document.createElement("td");

            let text = value ?? "-";

            if (typeof text === "string" && text.length > 150) {
                text = text.substring(0, 150) + "...";
            }

            td.textContent = text;
            tr.appendChild(td);
        });

        const actionTd = document.createElement("td");

        const btn = document.createElement("button");
        btn.className = "action-btn";
        btn.textContent = "Ver";

        btn.addEventListener("click", () => {
            showArticle(article);
        });

        actionTd.appendChild(btn);
        tr.appendChild(actionTd);

        container.appendChild(tr);
    });
}

// ===========================
// MODAL
// ===========================

function showArticle(article) {

    const modal = document.getElementById("modal");
    const body = document.getElementById("modal-body");

    const title = article.Title || article.title || "Sem título";
    const authors = article.Authors || article.authors || "-";
    const affiliation = article.Affiliations || article.affiliations || "-";
    const year = article.Year || article.year || "-";
    const journal = article["Source title"] || article.source_title || "-";
    const doi = article.DOI || "-";
    const abstract = article.Abstract || article.abstract || "-";
    const link = article.Link || "#";

    body.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
        </div>

        <div class="modal-grid">
            <div class="modal-card"><div class="modal-label">Autores</div><div class="modal-value">${authors}</div></div>
            <div class="modal-card"><div class="modal-label">Ano</div><div class="modal-value">${year}</div></div>
            <div class="modal-card"><div class="modal-label">Periódico</div><div class="modal-value">${journal}</div></div>
            <div class="modal-card"><div class="modal-label">DOI</div><div class="modal-value">${doi}</div></div>
        </div>

        <div class="modal-section">
            <div class="modal-label">Filiação</div>
            <div class="modal-value">${affiliation}</div>
        </div>

        <div class="modal-section">
            <div class="modal-label">Resumo</div>
            <div class="modal-abstract">${abstract}</div>
        </div>

        <div class="modal-actions">
            <a href="${link}" target="_blank" class="modal-btn primary">
                Abrir Artigo
            </a>
        </div>
    `;

    modal?.classList.remove("hidden");
}

// ===========================
// FECHAR MODAL
// ===========================

document.getElementById("close")?.addEventListener("click", () => {
    document.getElementById("modal")?.classList.add("hidden");
});

// ===========================
// PESQUISA
// ===========================

document.getElementById("search")?.addEventListener("input", (e) => {

    const term = e.target.value.toLowerCase();

    const filtered = articles.filter(article =>
        JSON.stringify(article).toLowerCase().includes(term)
    );

    renderArticles(filtered);
});

// ===========================
// TEMA
// ===========================

const themeButton = document.getElementById("themeToggle");

if (themeButton) {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    themeButton.addEventListener("click", () => {

        const current = document.documentElement.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

// ===========================
// INIT
// ===========================

document.addEventListener("DOMContentLoaded", loadArticles);

// ===========================
// BOTÕES SIDEBAR
// ===========================

document.getElementById("deleteAllBtn")?.addEventListener("click", deleteAllArticles);
document.getElementById("deleteNoAbstractBtn")?.addEventListener("click", deleteNoAbstractArticles);