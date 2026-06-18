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

    await loadPublicationsYear();

    await loadCitationsPerYear();

    await loadTopJournals();

    await loadTopAuthors();

    await loadTopKeywords();

    await loadOpenAccess();

    await loadLanguages();

    await loadConceptGroups();

    await loadKeywordNetwork();

    await loadCoauthorNetwork();
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

async function loadPublicationsYear() {

    const { data } = await supabaseClient
        .from("artigos")
        .select("year");

    const grouped = {};

    data.forEach(a => {
        grouped[a.year] = (grouped[a.year] || 0) + 1;
    });

    new Chart(
        document.getElementById("publicationsYear"),
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

async function loadCoauthorNetwork() {

    const { data, error } = await supabaseClient
        .from("artigo_autor")
        .select(`
            artigo_id,
            autor_id,
            autores(nome_completo)
        `);

    if (error) {
        console.error(error);
        return;
    }

    const articleMap = {};
    const authorsMap = {};

    data.forEach(row => {

        const nome = row.autores?.nome_completo;

        if (!nome) return;

        authorsMap[row.autor_id] = nome;

        if (!articleMap[row.artigo_id]) {
            articleMap[row.artigo_id] = [];
        }

        articleMap[row.artigo_id].push(row.autor_id);
    });

    const nodes = [];
    const edges = [];
    const addedEdges = new Set();

    Object.entries(authorsMap).forEach(([id, nome]) => {
        nodes.push({
            id,
            label: nome
        });
    });

    Object.values(articleMap).forEach(authors => {

        for (let i = 0; i < authors.length; i++) {

            for (let j = i + 1; j < authors.length; j++) {

                const a = authors[i];
                const b = authors[j];

                const edgeKey =
                    [a,b].sort().join("-");

                if (addedEdges.has(edgeKey))
                    continue;

                addedEdges.add(edgeKey);

                edges.push({
                    from: a,
                    to: b
                });
            }
        }
    });

    const container =
        document.getElementById("coauthorNetwork");

    new vis.Network(
        container,
        {
            nodes,
            edges
        },
        {
            physics:true
        }
    );
}

async function loadKeywordNetwork() {

    const { data, error } = await supabaseClient
        .from("artigo_keyword")
        .select(`
            artigo_id,
            keyword_id,
            keywords(keyword)
        `);

    if (error) {
        console.error(error);
        return;
    }

    const articleMap = {};
    const keywordMap = {};

    data.forEach(row => {

        const keyword =
            row.keywords?.keyword;

        if (!keyword) return;

        keywordMap[row.keyword_id] =
            keyword;

        if (!articleMap[row.artigo_id]) {
            articleMap[row.artigo_id] = [];
        }

        articleMap[row.artigo_id]
            .push(row.keyword_id);
    });

    const nodes = [];
    const edges = [];
    const addedEdges = new Set();

    Object.entries(keywordMap)
        .forEach(([id, keyword]) => {

        nodes.push({
            id,
            label: keyword
        });
    });

    Object.values(articleMap)
        .forEach(keywords => {

        for (let i = 0; i < keywords.length; i++) {

            for (let j = i + 1; j < keywords.length; j++) {

                const a = keywords[i];
                const b = keywords[j];

                const edgeKey =
                    [a,b].sort().join("-");

                if (addedEdges.has(edgeKey))
                    continue;

                addedEdges.add(edgeKey);

                edges.push({
                    from: a,
                    to: b
                });
            }
        }
    });

    const container =
        document.getElementById("keywordNetwork");

    new vis.Network(
        container,
        {
            nodes,
            edges
        },
        {
            physics:true
        }
    );
}

async function loadCitationsPerYear() {

    const { data } = await supabaseClient
        .from("artigos")
        .select("year,cited_by");

    const grouped = {};

    data.forEach(article => {

        const year = article.year || "Sem Ano";

        grouped[year] =
            (grouped[year] || 0)
            + (article.cited_by || 0);
    });

    new Chart(
        document.getElementById("citationsYear"),
        {
            type: "line",
            data: {
                labels: Object.keys(grouped),
                datasets: [{
                    label: "Citações",
                    data: Object.values(grouped)
                }]
            }
        }
    );
}

async function loadOpenAccess() {

    const { data } = await supabaseClient
        .from("artigos")
        .select("open_access");

    const map = {};

    data.forEach(item => {

        const access =
            item.open_access || "Não informado";

        map[access] =
            (map[access] || 0) + 1;
    });

    new Chart(
        document.getElementById("openAccessChart"),
        {
            type: "doughnut",
            data: {
                labels: Object.keys(map),
                datasets: [{
                    data: Object.values(map)
                }]
            }
        }
    );
}

async function loadConceptGroups() {

    const { data } = await supabaseClient
        .from("keywords")
        .select("tipo");

    const map = {};

    data.forEach(item => {

        const tipo =
            item.tipo || "Não Informado";

        map[tipo] =
            (map[tipo] || 0) + 1;
    });

    new Chart(
        document.getElementById("conceptGroups"),
        {
            type: "bar",
            data: {
                labels: Object.keys(map),
                datasets: [{
                    label: "Quantidade",
                    data: Object.values(map)
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
        .slice(0,20);

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
        .slice(0,15);

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
        .slice(0,15);

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



document.addEventListener("DOMContentLoaded", async () => {

    await testConnection();

    await loadDashboard();

});