const container =
document.getElementById("articles");

let articles = [];

async function loadArticles(){

const { data, error } =
await supabaseClient
.from("csvarticles")
.select("*");

if(error){

console.error(error);

return;

}

articles = data;

renderArticles(data);

}

loadArticles();

function renderArticles(list){

container.innerHTML = "";

list.forEach(article => {

const card =
document.createElement("div");

card.className = "card";

card.innerHTML = `
<h2>${article.title}</h2>

<p class="affiliation">
${article.affiliation}
</p>

<p>
${article.abstract}
</p>
`;

container.appendChild(card);

});

}

const searchInput =
document.getElementById("search");

if(searchInput){

  searchInput.addEventListener(
  "input",
  ()=>{

    const term =
    searchInput.value.toLowerCase();

    const filtered =
    articles.filter(article =>

      article.title
      .toLowerCase()
      .includes(term)

    );

    renderArticles(filtered);

  });

}