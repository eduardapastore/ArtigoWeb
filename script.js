alert("script.js carregou!");

console.log("script.js carregou!");

const container = document.getElementById("articles");

let articles = [];

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
    console.log("PRIMEIRO ARTIGO:", data[0]);
    console.log("COLUNAS:", Object.keys(data[0]));
  }

  renderArticles(data);

}

function renderArticles(list){

    container.innerHTML = "";

    list.forEach(article => {

        const tr =
        document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${article.title || article.Title || "-"}
            </td>

            <td>
                ${article.authors || article.Authors || "-"}
            </td>

            <td>
                ${article.affiliations || article.Affiliations || "-"}
            </td>

            <td>
                ${article.year || article.Year || "-"}
            </td>

            <td>
                ${article.source_title || article["Source title"] || "-"}
            </td>

            <td>

                <button
                    class="action-btn"
                    onclick='showArticle(${JSON.stringify(article)})'
                >
                    Ver
                </button>

            </td>

        `;

        container.appendChild(tr);

    });

}

loadArticles();

const themeButton =
document.getElementById("themeToggle");

const savedTheme =
localStorage.getItem("theme");

if(savedTheme){

    document.documentElement
    .setAttribute(
        "data-theme",
        savedTheme
    );

    updateIcon(savedTheme);

}

themeButton.addEventListener(
"click",
()=>{

    const currentTheme =
    document.documentElement
    .getAttribute("data-theme");

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

    updateIcon(newTheme);

});

function updateIcon(theme){

    themeButton.textContent =
    theme === "dark"
    ? "☀️"
    : "🌙";

}