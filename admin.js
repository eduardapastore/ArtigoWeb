async function getOrCreate(table, uniqueColumn, value, extra = {}) {

  if (!value || String(value).trim() === "") {
      return null;
  }

  const { data: existing } = await supabaseClient
      .from(table)
      .select("id")
      .eq(uniqueColumn, value)
      .maybeSingle();

  if (existing) {
      return existing.id;
  }

  const { data, error } = await supabaseClient
      .from(table)
      .insert({
          [uniqueColumn]: value,
          ...extra
      })
      .select("id")
      .single();

  if (error) {
      console.error(error);
      return null;
  }

  return data.id;
}

document
  .getElementById("importCSV")
  ?.addEventListener("click", importarCSV);

async function importarCSV() {

  const file =
      document.getElementById("csvFile").files[0];

  if (!file) {
      alert("Selecione um CSV");
      return;
  }

  Papa.parse(file, {

      header: true,
      skipEmptyLines: true,

      complete: async function(results) {

          const rows = results.data;

          console.log("Total linhas:", rows.length);

          let sucesso = 0;
          let erros = 0;

          for (const row of rows) {

              try {

                  await importarArtigo(row);

                  sucesso++;

                  if (sucesso % 50 === 0) {
                      console.log(
                          `${sucesso} artigos processados`
                      );
                  }

              } catch (err) {

                  erros++;

                  console.error(
                      "Erro artigo:",
                      row["Title"],
                      err
                  );
              }
          }

          alert(`
Importação concluída!

Sucesso: ${sucesso}
Erros: ${erros}
          `);

      },

      error: function(error) {

          console.error(error);

          alert(
              "Erro ao processar CSV"
          );
      }
  });
}

async function importarArtigo(row) {

  /* ==========================
     EVITA DUPLICADOS
  ========================== */

  if (row["DOI"]) {

      const { data: existente } =
          await supabaseClient
              .from("artigos")
              .select("id")
              .eq("doi", row["DOI"])
              .maybeSingle();

      if (existente) return;
  }

  /* ==========================
     PERIÓDICO
  ========================== */

  let periodicoId = null;

  if (row["Source title"]) {

      periodicoId =
          await getOrCreate(
              "periodicos",
              "source_title",
              row["Source title"],
              {
                  abbreviated_source_title:
                      row["Abbreviated Source Title"],

                  issn:
                      row["ISSN"],

                  isbn:
                      row["ISBN"],

                  coden:
                      row["CODEN"],

                  publisher:
                      row["Publisher"]
              }
          );
  }

  /* ==========================
     PUBLICAÇÃO
  ========================== */

  let publicacaoId = null;

  if (periodicoId) {

      const { data } =
          await supabaseClient
              .from("publicacoes")
              .insert({
                  periodico_id: periodicoId,
                  volume: row["Volume"],
                  issue: row["Issue"],
                  art_no: row["Art. No."],
                  page_start: row["Page start"],
                  page_end: row["Page end"]
              })
              .select("id")
              .single();

      publicacaoId = data?.id;
  }

  /* ==========================
     CONFERÊNCIA
  ========================== */

  let conferenciaId = null;

  if (row["Conference name"]) {

      conferenciaId =
          await getOrCreate(
              "conferencias",
              "nome",
              row["Conference name"],
              {
                  data:
                      row["Conference date"],

                  localizacao:
                      row["Conference location"],

                  codigo:
                      row["Conference code"]
              }
          );
  }

  /* ==========================
     ARTIGO
  ========================== */

  const { data: artigo, error } =
      await supabaseClient
          .from("artigos")
          .insert({

              title:
                  row["Title"],

              year:
                  row["Year"]
                      ? Number(row["Year"])
                      : null,

              abstract:
                  row["Abstract"],

              cited_by:
                  row["Cited by"]
                      ? Number(row["Cited by"])
                      : 0,

              doi:
                  row["DOI"],

              link:
                  row["Link"],

              correspondence_address:
                  row["Correspondence Address"],

              document_type:
                  row["Document Type"],

              publication_stage:
                  row["Publication Stage"],

              open_access:
                  row["Open Access"],

              source:
                  row["Source"],

              eid:
                  row["EID"],

              language_original:
                  row["Language of Original Document"],

              pubmed_id:
                  row["PubMed ID"],

              publicacao_id:
                  publicacaoId,

              conferencia_id:
                  conferenciaId

          })
          .select("id")
          .single();

  if (error) {
      throw error;
  }

  const artigoId = artigo.id;

  /* ==========================
     AUTORES
  ========================== */

  const autores =
      (row["Author full names"] || "")
          .split(";")
          .map(a => a.trim())
          .filter(Boolean);

  for (let i = 0; i < autores.length; i++) {

      const nome = autores[i];

      const autorId =
          await getOrCreate(
              "autores",
              "nome_completo",
              nome
          );

      if (!autorId) continue;

      await supabaseClient
          .from("artigo_autor")
          .upsert({
              artigo_id: artigoId,
              autor_id: autorId,
              ordem_autoria: i + 1
          });
  }

  /* ==========================
     KEYWORDS AUTOR
  ========================== */

  const authorKeywords =
      (row["Author Keywords"] || "")
          .split(";")
          .map(k => k.trim())
          .filter(Boolean);

  for (const keyword of authorKeywords) {

      const keywordId =
          await getOrCreate(
              "keywords",
              "keyword",
              keyword,
              {
                  tipo: "AUTHOR"
              }
          );

      if (!keywordId) continue;

      await supabaseClient
          .from("artigo_keyword")
          .upsert({
              artigo_id: artigoId,
              keyword_id: keywordId
          });
  }

  /* ==========================
     KEYWORDS INDEX
  ========================== */

  const indexKeywords =
      (row["Index Keywords"] || "")
          .split(";")
          .map(k => k.trim())
          .filter(Boolean);

  for (const keyword of indexKeywords) {

      const keywordId =
          await getOrCreate(
              "keywords",
              "keyword",
              keyword,
              {
                  tipo: "INDEX"
              }
          );

      if (!keywordId) continue;

      await supabaseClient
          .from("artigo_keyword")
          .upsert({
              artigo_id: artigoId,
              keyword_id: keywordId
          });
  }

  /* ==========================
     FINANCIAMENTOS
  ========================== */

  if (row["Funding Details"]) {

      const { data: financiamento } =
          await supabaseClient
              .from("financiamentos")
              .insert({
                  funding_details:
                      row["Funding Details"],

                  funding_texts:
                      row["Funding Texts"]
              })
              .select("id")
              .single();

      if (financiamento) {

          await supabaseClient
              .from("artigo_financiamento")
              .insert({
                  artigo_id: artigoId,
                  financiamento_id:
                      financiamento.id
              });
      }
  }

  console.log(
      "Importado:",
      row["Title"]
  );
}