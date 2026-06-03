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
        .or('Abstract.is.null,Abstract.eq.')

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

    const title = article.Title || "Sem título";
    const authors = article.Authors || "-";
    const affiliation = article.Affiliations || "-";
    const year = article.Year || "-";
    const journal = article["Source title"] || "-";
    const doi = article.DOI || "-";
    const abstract = article.Abstract || "-";
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
// CLEAN HELPERS (CORRIGIDO)
// ===========================

function isEmpty(value) {
    return value === null ||
        value === undefined ||
        String(value).trim() === "";
}

// ===========================
// DELETE ISBN / ISSN (CORRIGIDO)
// ===========================

async function deleteMissingISBNISSNHandler() {

    const ok = confirm("🚫 Remover artigos sem ISBN ou ISSN?");
    if (!ok) return;

    const { data, error } = await supabaseClient
        .from("csvarticles")
        .select("id, \"ISBN\", \"ISSN\"");

    if (error) {
        console.error(error);
        showError("Erro ao buscar artigos");
        return;
    }

    const toDelete = data.filter(article => {
        const isbnMissing = isEmpty(article.ISBN);
        const issnMissing = isEmpty(article.ISSN);
        return isbnMissing || issnMissing;
    });

    const ids = toDelete.map(a => a.id);

    if (!ids.length) {
        showSuccess("Nenhum artigo sem ISBN/ISSN encontrado!");
        return;
    }

    const { error: deleteError } = await supabaseClient
        .from("csvarticles")
        .delete()
        .in("id", ids);

    if (deleteError) {
        console.error(deleteError);
        showError("Erro ao deletar artigos");
        return;
    }

    showSuccess(`${ids.length} artigos removidos com sucesso!`);
    loadArticles();
}

// ===========================
// DELETE DOI (CORRIGIDO)
// ===========================

async function deleteMissingDOIHandler() {

    const ok = confirm("🚫 Remover artigos sem DOI?");
    if (!ok) return;

    const { data, error } = await supabaseClient
        .from("csvarticles")
        .select("DOI");

    if (error) {
        console.error(error);
        showError("Erro ao buscar artigos");
        return;
    }

    const toDelete = data.filter(article =>
        !article.DOI || String(article.DOI).trim() === ""
    );

    const ids = toDelete.map(a => a.id);

    if (!ids.length) {
        showSuccess("Nenhum artigo sem DOI encontrado!");
        return;
    }

    const { error: deleteError } = await supabaseClient
        .from("csvarticles")
        .delete()
        .in("id", ids);

    if (deleteError) {
        console.error(deleteError);
        showError("Erro ao deletar artigos");
        return;
    }

    showSuccess(`${ids.length} artigos removidos com sucesso!`);
    loadArticles();
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
document.getElementById("deleteISBNISSN")?.addEventListener("click", deleteMissingISBNISSNHandler);
document.getElementById("deleteMissingDOI")?.addEventListener("click", deleteMissingDOIHandler);