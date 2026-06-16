console.log("analytics carregado");

async function testConnection() {

    const { data, error } = await supabaseClient
        .from("artigos")
        .select("*")
        .limit(5);

    console.log("ARTIGOS:", data);
    console.log("ERRO:", error);
}

async function loadDashboard() {

    await loadCards();

    await loadArticlesPerYear();

    await loadTopAuthors();

    await loadTopKeywords();

    await loadTopJournals();

    await loadLanguages();

    await loadMostCited();
}

/* =======================
   CARDS
======================= */

async function loadCards() {

    const { count: totalArtigos } = await supabaseClient
        .from("artigos")
        .select("*", { count: "exact", head: true });

    const { count: totalAutores } = await supabaseClient
        .from("autores")
        .select("*", { count: "exact", head: true });

    const { count: totalKeywords } = await supabaseClient
        .from("keywords")
        .select("*", { count: "exact", head: true });

    document.getElementById("totalArtigos").textContent = totalArtigos || 0;
    document.getElementById("totalAutores").textContent = totalAutores || 0;
    document.getElementById("totalKeywords").textContent = totalKeywords || 0;
}

/* =======================
   ARTIGOS POR ANO
======================= */

async function loadArticlesPerYear() {

    const { data } = await supabaseClient
        .from("artigos")
        .select("year");

    const grouped = {};

    data.forEach(a => {
        grouped[a.year] = (grouped[a.year] || 0) + 1;
    });

    new Chart(
        document.getElementById("articlesPerYear"),
        {
            type: "line",
            data: {
                labels: Object.keys(grouped),
                datasets: [{
                    label: "Artigos",
                    data: Object.values(grouped)
                }]
            }
        }
    );
}

/* =======================
   AUTORES
======================= */

async function loadTopAuthors() {

    const { data } = await supabaseClient
        .from("artigo_autor")
        .select(`
            autor_id,
            autores(nome_completo)
        `);

    const map = {};

    data.forEach(item => {

        const nome = item.autores?.nome_completo;

        if (!nome) return;

        map[nome] = (map[nome] || 0) + 1;
    });

    const sorted = Object.entries(map)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,10);

    new Chart(
        document.getElementById("topAuthors"),
        {
            type:"bar",
            data:{
                labels:sorted.map(x=>x[0]),
                datasets:[{
                    label:"Artigos",
                    data:sorted.map(x=>x[1])
                }]
            }
        }
    );
}

/* =======================
   KEYWORDS
======================= */

async function loadTopKeywords() {

    const { data } = await supabaseClient
        .from("artigo_keyword")
        .select(`
            keyword_id,
            keywords(keyword)
        `);

    const map = {};

    data.forEach(item => {

        const keyword = item.keywords?.keyword;

        if (!keyword) return;

        map[keyword] = (map[keyword] || 0) + 1;
    });

    const sorted = Object.entries(map)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,10);

    new Chart(
        document.getElementById("topKeywords"),
        {
            type:"bar",
            data:{
                labels:sorted.map(x=>x[0]),
                datasets:[{
                    label:"Ocorrências",
                    data:sorted.map(x=>x[1])
                }]
            }
        }
    );
}

/* =======================
   PERIÓDICOS
======================= */

async function loadTopJournals() {

    const { data } = await supabaseClient
        .from("vw_artigos_frontend")
        .select('"Source title"');

    const map = {};

    data.forEach(item => {

        const journal = item["Source title"];

        if (!journal) return;

        map[journal] = (map[journal] || 0) + 1;
    });

    const sorted = Object.entries(map)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,10);

    new Chart(
        document.getElementById("topJournals"),
        {
            type:"bar",
            data:{
                labels:sorted.map(x=>x[0]),
                datasets:[{
                    label:"Artigos",
                    data:sorted.map(x=>x[1])
                }]
            }
        }
    );
}

/* =======================
   IDIOMAS
======================= */

async function loadLanguages() {

    const { data } = await supabaseClient
        .from("artigos")
        .select("language_original");

    const map = {};

    data.forEach(item => {

        const lang = item.language_original || "Não informado";

        map[lang] = (map[lang] || 0) + 1;
    });

    new Chart(
        document.getElementById("languagesChart"),
        {
            type:"pie",
            data:{
                labels:Object.keys(map),
                datasets:[{
                    data:Object.values(map)
                }]
            }
        }
    );
}

/* =======================
   MAIS CITADOS
======================= */

async function loadMostCited() {

    const { data } = await supabaseClient
        .from("artigos")
        .select("title,cited_by")
        .order("cited_by",{ascending:false})
        .limit(10);

    new Chart(
        document.getElementById("mostCited"),
        {
            type:"bar",
            data:{
                labels:data.map(x=>x.title.substring(0,30)),
                datasets:[{
                    label:"Citações",
                    data:data.map(x=>x.cited_by || 0)
                }]
            }
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);

document.addEventListener("DOMContentLoaded", async () => {

    await testConnection();

    await loadDashboard();

});