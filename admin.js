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
        console.error("Erros encontrados:", results.errors);
      }

      const totalOriginal =
        results.data.length;

      const artigos =
        results.data.map(row => ({

          "Authors":
            row["Authors"] || null,

          "Author full names":
            row["Author full names"] || null,

          "Author(s) ID":
            row["Author(s) ID"] || null,

          "Title":
            row["Title"] || null,

          "Year":
            row["Year"]?.trim()
              ? Number(row["Year"])
              : null,

          "Source title":
            row["Source title"] || null,

          "Volume":
            row["Volume"] || null,

          "Issue":
            row["Issue"] || null,

          "Art. No.":
            row["Art. No."] || null,

          "Page start":
            row["Page start"] || null,

          "Page end":
            row["Page end"] || null,

          "Cited by":
            row["Cited by"]?.trim()
              ? Number(row["Cited by"])
              : null,

          "DOI":
            row["DOI"] || null,

          "Link":
            row["Link"] || null,

          "Affiliations":
            row["Affiliations"] || null,

          "Authors with affiliations":
            row["Authors with affiliations"] || null,

          "Abstract":
            row["Abstract"] || null,

          "Author Keywords":
            row["Author Keywords"] || null,

          "Index Keywords":
            row["Index Keywords"] || null,

          "Molecular Sequence Numbers":
            row["Molecular Sequence Numbers"] || null,

          "Chemicals/CAS":
            row["Chemicals/CAS"] || null,

          "Tradenames":
            row["Tradenames"] || null,

          "Manufacturers":
            row["Manufacturers"] || null,

          "Funding Details":
            row["Funding Details"] || null,

          "Funding Texts":
            row["Funding Texts"] || null,

          "References":
            row["References"] || null,

          "Correspondence Address":
            row["Correspondence Address"] || null,

          "Editors":
            row["Editors"] || null,

          "Publisher":
            row["Publisher"] || null,

          "Sponsors":
            row["Sponsors"] || null,

          "Conference name":
            row["Conference name"] || null,

          "Conference date":
            row["Conference date"] || null,

          "Conference location":
            row["Conference location"] || null,

          "Conference code":
            row["Conference code"] || null,

          "ISSN":
            row["ISSN"] || null,

          "ISBN":
            row["ISBN"] || null,

          "CODEN":
            row["CODEN"] || null,

          "PubMed ID":
            row["PubMed ID"] || null,

          "Language of Original Document":
            row["Language of Original Document"] || null,

          "Abbreviated Source Title":
            row["Abbreviated Source Title"] || null,

          "Document Type":
            row["Document Type"] || null,

          "Publication Stage":
            row["Publication Stage"] || null,

          "Open Access":
            row["Open Access"] || null,

          "Source":
            row["Source"] || null,

          "EID":
            row["EID"] || null

        }));

      console.log(
        `Total CSV: ${totalOriginal}`
      );

      console.log(
        "Primeiro registro:",
        artigos[0]
      );

      if (artigos.length === 0) {
        alert("Nenhum registro encontrado.");
        return;
      }

      const batchSize = 500;

      for (
        let i = 0;
        i < artigos.length;
        i += batchSize
      ) {

        const lote =
          artigos.slice(
            i,
            i + batchSize
          );

        console.log(
          `Enviando lote ${
            i / batchSize + 1
          }`
        );

        const {
          data,
          error
        } = await supabaseClient
          .from("csvarticles")
          .insert(lote)
          .select();

        if (error) {

          console.error(
            "Erro ao inserir lote:",
            error
          );

          alert(
            "Erro ao importar CSV:\n\n" +
            error.message
          );

          return;
        }

        console.log(
          `Lote ${
            i / batchSize + 1
          } inserido`,
          data
        );
      }

      alert(
        `${artigos.length} registros importados com sucesso!`
      );

    },

    error: function (error) {

      console.error(
        "Erro ao processar CSV:",
        error
      );

      alert(
        "Erro ao processar CSV"
      );

    }

  });

}