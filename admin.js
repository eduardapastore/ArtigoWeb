const form =
  document.getElementById("articleForm");

if (form) {

  form.addEventListener("submit",
    async (e) => {

      e.preventDefault();

      const file =
        document.getElementById("pdf")
          .files[0];

      const fileName =
        Date.now() + "-" + file.name;

      const upload =
        await supabaseClient.storage
          .from("articles")
          .upload(fileName, file);

      if (upload.error) {

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

      if (error) {

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
  console.log("Botão encontrado:", csvButton);

if (csvButton) {

  csvButton.addEventListener(
    "click",
    importarCSV
  );

}

async function importarCSV() {

  const file =
    document.getElementById("csvFile").files[0];

  if (!file) {

    alert("Selecione um arquivo CSV");
    return;

  }

  Papa.parse(file, {

    header: true,
    skipEmptyLines: true,


    complete: async function (results) {
      console.log("CSV processado");

      console.log(results);
      if (results.errors.length > 0) {
        console.error(results.errors);
      }

      const totalOriginal =
        results.data.length;

      const artigos =
        results.data
          .map(row => ({

            "Authors": row["Authors"] || null,
            "Author full names": row["Author full names"] || null,
            "Author(s) ID": row["Author(s) ID"] || null,
            "Title": row["Title"] || null,
            "Year":
              row["Year"]?.trim()
                ? Number(row["Year"])
                : null,
            "Source title": row["Source title"] || null,
            "Volume": row["Volume"] || null,
            "Issue": row["Issue"] || null,
            "Art. No.": row["Art. No."] || null,
            "Page start": row["Page start"] || null,
            "Page end": row["Page end"] || null,
            "Cited by":
              row["Cited by"]?.trim()
                ? Number(row["Cited by"])
                : null,
            "DOI": row["DOI"] || null,
            "Link": row["Link"] || null,
            "Affiliations": row["Affiliations"] || null,
            "Authors with affiliations": row["Authors with affiliations"] || null,
            "Abstract": row["Abstract"] || null,
            "Author Keywords": row["Author Keywords"] || null,
            "Index Keywords": row["Index Keywords"] || null,
            "Molecular Sequence Numbers": row["Molecular Sequence Numbers"] || null,
            "Chemicals/CAS": row["Chemicals/CAS"] || null,
            "Tradenames": row["Tradenames"] || null,
            "Manufacturers": row["Manufacturers"] || null,
            "Funding Details": row["Funding Details"] || null,
            "Funding Texts": row["Funding Texts"] || null,
            "References": row["References"] || null,
            "Correspondence Address": row["Correspondence Address"] || null,
            "Editors": row["Editors"] || null,
            "Publisher": row["Publisher"] || null,
            "Sponsors": row["Sponsors"] || null,
            "Conference name": row["Conference name"] || null,
            "Conference date": row["Conference date"] || null,
            "Conference location": row["Conference location"] || null,
            "Conference code": row["Conference code"] || null,
            "ISSN": row["ISSN"] || null,
            "ISBN": row["ISBN"] || null,
            "CODEN": row["CODEN"] || null,
            "PubMed ID": row["PubMed ID"] || null,
            "Language of Original Document":
              row["Language of Original Document"] || null,
            "Abbreviated Source Title":
              row["Abbreviated Source Title"] || null,
            "Document Type": row["Document Type"] || null,
            "Publication Stage": row["Publication Stage"] || null,
            "Open Access": row["Open Access"] || null,
            "Source": row["Source"] || null,
            "EID": row["EID"] || null

          }))
          .filter(artigo => {

            const abstractValido =
              artigo["Abstract"] &&
              artigo["Abstract"].trim() !== "";

            const doiValido =
              artigo["DOI"] &&
              artigo["DOI"].trim() !== "";

            return abstractValido && doiValido;

          });

      const artigosSemDuplicados =
        artigos.filter(
          (artigo, index, self) =>
            index === self.findIndex(
              a => a["DOI"] === artigo["DOI"]
            )
        );

      const removidos =
        totalOriginal -
        artigosSemDuplicados.length;

      console.log(
        `Total CSV: ${totalOriginal}`
      );

      console.log(
        `Importados: ${artigosSemDuplicados.length}`
      );

      console.log(
        `Removidos: ${removidos}`
      );

      const batchSize = 500;

      for (
        let i = 0;
        i < artigosSemDuplicados.length;
        i += batchSize
      ) {

        const lote =
          artigosSemDuplicados.slice(
            i,
            i + batchSize
          );

        const { data, error } =
          await supabaseClient
            .from("csvarticles")
            .insert(lote)
            .select();

        if (error) {

          console.error(
            `❌ Erro ao enviar lote ${Math.floor(i / batchSize) + 1
            } para o Supabase:`,
            error
          );

          alert(
            `Erro ao importar lote ${Math.floor(i / batchSize) + 1
            }`
          );

          return;

        }

        console.log(
          `✅ Lote ${Math.floor(i / batchSize) + 1
          } enviado com sucesso para o Supabase.`
        );

        console.log(
          `📦 Registros enviados: ${lote.length}`
        );

        console.log(
          "📄 Primeiro registro enviado:",
          lote[0]
        );

        console.log(
          "📥 Resposta do Supabase:",
          data
        );

      }

      alert(
        `Importação concluída!\n\n` +
        `Total no CSV: ${totalOriginal}\n` +
        `Importados: ${artigosSemDuplicados.length}\n` +
        `Removidos: ${removidos}`
      );

    },

    error: function (error) {

      console.error(error);
      alert("Erro ao processar CSV");

    }

  });

}