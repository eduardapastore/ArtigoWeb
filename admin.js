const form =
document.getElementById("articleForm");

if(form){

form.addEventListener("submit",
async (e)=>{

e.preventDefault();

const file =
document.getElementById("pdf")
.files[0];

const fileName =
Date.now() + "-" + file.name;

const upload =
await supabaseClient.storage
.from("articles")
.upload(fileName,file);

if(upload.error){

console.error(upload.error);

alert("Erro ao enviar PDF");

return;

}

const { data } =
supabaseClient.storage
.from("articles")
.getPublicUrl(fileName);

const { error } =
await supabaseClient
.from("csvarticles")
.insert({

title:
document.getElementById("title").value,

affiliation:
document.getElementById("affiliation").value,

authors:
document.getElementById("authors").value,

year:
Number(
document.getElementById("year").value
),

abstract:
document.getElementById("abstract").value,

pdf_url:
data.publicUrl

});

if(error){

console.error(error);

alert("Erro ao salvar artigo");

return;

}

alert("Artigo cadastrado!");

form.reset();

});

}

const csvButton =
document.getElementById("importCSV");

if(csvButton){

csvButton.addEventListener(
"click",
importarCSV
);

}

async function importarCSV(){

  const file =
  document.getElementById("csvFile").files[0];

  Papa.parse(file,{

    header:true,
    skipEmptyLines:true,

    complete: async function(results){

      const artigos =
      results.data.map(row => ({

        title: row["Title"],
        authors: row["Authors"],
        affiliation: row["Affiliations"],
        abstract: row["Abstract"],
        year: Number(row["Year"])

      }));

      console.log(artigos);

      const { error } =
      await supabaseClient
      .from("csvarticles")
      .insert(artigos);

      if(error){

        console.error(error);
        alert("Erro ao importar CSV");
        return;

      }

      alert("CSV importado com sucesso!");

    }

  });

}