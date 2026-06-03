console.log("script.js carregado!");

const container =
document.getElementById("articles");

let articles = [];

/* ===========================
   CARREGAR ARTIGOS
=========================== */

async function loadArticles(){

    const { data, error } =
    await supabaseClient
    .from("csvarticles")
    .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if(error){

        console.error(error);

        return;

    }

    articles = data;

    if(data.length > 0){

        createTableHeader(
            Object.keys(data[0])
        );

    }

    renderArticles(data);

}

/* ===========================
   CRIAR CABEÇALHO
=========================== */

function createTableHeader(columns){

    const head =
    document.getElementById("tableHead");

    head.innerHTML = "";

    const tr =
    document.createElement("tr");

    columns.forEach(column => {

        const th =
        document.createElement("th");

        th.textContent =
        column;

        tr.appendChild(th);

    });

    const actionTh =
    document.createElement("th");

    actionTh.textContent =
    "Ações";

    tr.appendChild(actionTh);

    head.appendChild(tr);

}

/* ===========================
   RENDERIZAR ARTIGOS
=========================== */

function renderArticles(list){

    container.innerHTML = "";

    list.forEach(article => {

        const tr =
        document.createElement("tr");

        Object.entries(article)
        .forEach(([key,value]) => {

            const td =
            document.createElement("td");

            let text =
            value ?? "-";

            if(typeof text === "string" &&
               text.length > 150){

                text =
                text.substring(0,150) +
                "...";

            }

            td.textContent =
            text;

            tr.appendChild(td);

        });

        const actionTd =
        document.createElement("td");

        const btn =
        document.createElement("button");

        btn.className =
        "action-btn";

        btn.textContent =
        "Ver";

        btn.addEventListener(
        "click",
        ()=>{

            showArticle(article);

        });

        actionTd.appendChild(btn);

        tr.appendChild(actionTd);

        container.appendChild(tr);

    });

}

/* ===========================
   MODAL
=========================== */

function showArticle(article){

    const modal =
    document.getElementById("modal");

    const body =
    document.getElementById("modal-body");

    let html = "";

    Object.entries(article)
    .forEach(([key,value]) => {

        html += `

            <div style="
                margin-bottom:20px;
                border-bottom:1px solid #ddd;
                padding-bottom:12px;
            ">

                <strong>
                    ${key}
                </strong>

                <p>
                    ${value ?? "-"}
                </p>

            </div>

        `;

    });

    body.innerHTML = html;

    modal.classList.remove(
        "hidden"
    );

}

/* ===========================
   FECHAR MODAL
=========================== */

const closeButton =
document.getElementById("close");

if(closeButton){

    closeButton.addEventListener(
    "click",
    ()=>{

        document
        .getElementById("modal")
        .classList.add(
            "hidden"
        );

    });

}

/* ===========================
   PESQUISA
=========================== */

const searchInput =
document.getElementById("search");

if(searchInput){

    searchInput.addEventListener(
    "input",
    ()=>{

        const term =
        searchInput.value
        .toLowerCase();

        const filtered =
        articles.filter(article =>

            JSON.stringify(article)
            .toLowerCase()
            .includes(term)

        );

        renderArticles(
            filtered
        );

    });

}

/* ===========================
   TEMA
=========================== */

const themeButton =
document.getElementById(
    "themeToggle"
);

function updateIcon(theme){

    themeButton.textContent =
    theme === "dark"
    ? "☀️"
    : "🌙";

}

const savedTheme =
localStorage.getItem(
    "theme"
);

if(savedTheme){

    document.documentElement
    .setAttribute(
        "data-theme",
        savedTheme
    );

    updateIcon(savedTheme);

}

if(themeButton){

    themeButton.addEventListener(
    "click",
    ()=>{

        const currentTheme =
        document.documentElement
        .getAttribute(
            "data-theme"
        );

        const newTheme =
        currentTheme === "dark"
        ? "light"
        : "dark";

        document.documentElement
        .setAttribute(
            "data-theme",
            newTheme
        );

        localStorage.setItem(
            "theme",
            newTheme
        );

        updateIcon(
            newTheme
        );

    });

}

/* ===========================
   INICIAR
=========================== */

loadArticles();