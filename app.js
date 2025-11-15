// app.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("prepForm");
  const statusEl = document.getElementById("status");
  const fileInput = document.getElementById("images");
  const fileListEl = document.getElementById("fileList");
  const outputCard = document.getElementById("outputCard");
  const output = document.getElementById("output");
  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const pdfBtn = document.getElementById("downloadPdf");

  const WORKER_URL = "https://bold-dawn-2443.vitikainenpetteri.workers.dev";

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? "Luodaan preppausta..." : "Luo preppaus";
  }

  // Näytä tiedostolista kun käyttäjä valitsee kuvia
  fileInput.addEventListener("change", function () {
    fileListEl.textContent = "";
    const files = Array.from(fileInput.files || []);
    if (files.length === 0) {
      fileListEl.textContent = "Ei valittuja tiedostoja.";
      return;
    }
    const lines = files.map(
      f => `• ${f.name} (${Math.round(f.size / 1024)} kB)`
    );
    fileListEl.textContent = "Valitut kuvat:\n" + lines.join("\n");
  });

  // Lomakkeen tyhjennys
  clearBtn.addEventListener("click", function () {
    form.reset();
    fileListEl.textContent = "";
    setStatus("");
    output.innerHTML = "";
    outputCard.style.display = "none";
  });

  // PDF-lataus
  pdfBtn.addEventListener("click", function () {
    if (!output.innerHTML.trim()) {
      setStatus("Ei preppausta ladattavaksi PDF:nä.");
      return;
    }

    const opt = {
      margin:       10,
      filename:     'koepreppaus.pdf',
      image:        { type: 'jpeg', quality: 0.95 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setStatus("Luodaan PDF-tiedostoa...");
    html2pdf().from(output).set(opt).save().then(() => {
      setStatus("PDF ladattu.");
    }).catch(err => {
      console.error(err);
      setStatus("Virhe PDF:n luonnissa.");
    });
  });

  // Lähetys Workerille
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const grade = document.getElementById("grade").value.trim();
    const goal = document.getElementById("goal").value.trim();
    const files = Array.from(fileInput.files || []);

    // Kevyet tarkistukset
    if (!subject) {
      setStatus("Lisää oppiaine.");
      return;
    }
    if (!grade) {
      setStatus("Lisää luokka-aste.");
      return;
    }
    if (!goal) {
      setStatus("Lisää tavoitenumero.");
      return;
    }
    if (files.length === 0) {
      setStatus("Valitse vähintään yksi kuva koealueesta.");
      return;
    }

    // Karkea raja: max 6 kuvaa, yksittäinen max ~8 Mt
    if (files.length > 6) {
      setStatus("Testivaiheessa max 6 kuvaa kerrallaan.");
      return;
    }
    const tooBig = files.find(f => f.size > 8 * 1024 * 1024);
    if (tooBig) {
      setStatus(`Tiedosto "${tooBig.name}" on liian iso (max ~8 Mt / kuva).`);
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("grade", grade);
    formData.append("goal", goal);
    files.forEach(f => formData.append("images", f));

    setStatus("Lähetetään palvelimelle... tämä voi kestää hetken.");
    setLoading(true);
    outputCard.style.display = "block";
    output.innerHTML = "<p><em>Preppausta luodaan...</em></p>";

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: formData
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Virhevastauksen runko:", text);
        output.innerHTML = `<p><strong>Virhe palvelimelta (${res.status}):</strong></p><pre>${text}</pre>`;
        setStatus("Virhe palvelimelta.");
        setLoading(false);
        return;
      }

      // Vastauksen oletetaan olevan yksinkertaista HTML:ää
      output.innerHTML = text;
      setStatus("Preppaus valmis.");
    } catch (err) {
      console.error(err);
      output.innerHTML = `<p><strong>Fetch-virhe:</strong> ${err.message}</p>`;
      setStatus("Yhteysvirhe (fetch).");
    } finally {
      setLoading(false);
    }
  });
});
