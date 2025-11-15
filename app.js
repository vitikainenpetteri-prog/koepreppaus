// app.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("prepForm");
  const output = document.getElementById("output");
  const fileInput = document.getElementById("images");

  if (!form) {
    console.error("prepForm-lomaketta ei löytynyt.");
    return;
  }

  // Debug: näytä heti kun käyttäjä valitsee tiedoston
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length === 0) {
      output.textContent = "Selaimen mielestä ei ole valittua tiedostoa.";
    } else {
      const f = fileInput.files[0];
      output.textContent =
        "Valittu tiedosto: " + f.name +
        " (" + Math.round(f.size / 1024) + " kB)";
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const subject = document.getElementById("subject").value;
    const grade = document.getElementById("grade").value;
    const goal = document.getElementById("goal").value;
    const images = fileInput.files;

    // Näytä debug-info ennen mitään rajoja
    output.textContent =
      "Submit painettu.\n" +
      "Selaimen mielestä tiedostoja: " + images.length + "\n";

    if (images.length === 0) {
      output.textContent += "Ei yhtään tiedostoa valittuna tämän mukaan.";
      // jatketaan silti, jotta nähdään ettei Worker kaadu
    }

    // Testivaihe: vain 1 kuva, max ~8 Mt
    if (images.length > 1) {
      output.textContent += "\nTestivaiheessa sallitaan vain 1 kuva kerrallaan.";
      return;
    }

    if (images.length === 1 && images[0].size > 8 * 1024 * 1024) {
      output.textContent += "\nKuva on liian suuri (max noin 8 Mt).";
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("grade", grade);
    formData.append("goal", goal);

    if (images.length === 1) {
      formData.append("images", images[0]);
      output.textContent +=
        "\nLähetetään tiedosto Workerille: " +
        images[0].name +
        " (" + Math.round(images[0].size / 1024) + " kB)";
    } else {
      output.textContent += "\nLähetetään lomake ilman kuvaa.";
    }

    try {
      const res = await fetch("https://bold-dawn-2443.vitikainenpetteri.workers.dev", {
        method: "POST",
        body: formData
      });

      let bodyText;
      try {
        bodyText = await res.text();
      } catch (e2) {
        bodyText = "(ei saatu vastauksen runkoa luettua)";
      }

      output.textContent +=
        "\n\nPalvelimen vastaus (" + res.status + "):\n" + bodyText;
    } catch (err) {
      output.textContent += "\n\nFetch-virhe: " + err.message;
    }
  });
});
