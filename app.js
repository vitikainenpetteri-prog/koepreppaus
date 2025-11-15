// app.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("prepForm");
  const output = document.getElementById("output");

  if (!form) {
    console.error("prepForm-lomaketta ei löytynyt.");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    output.textContent = "Valmistellaan lähetystä...";

    const subject = document.getElementById("subject").value;
    const grade = document.getElementById("grade").value;
    const goal = document.getElementById("goal").value;
    const images = document.getElementById("images").files;

    // Testivaihe: sallitaan vain 1 kuva, max ~8 Mt
    if (images.length > 1) {
      output.textContent = "Testivaiheessa sallitaan nyt vain 1 kuva kerrallaan.";
      return;
    }

    if (images.length === 1 && images[0].size > 8 * 1024 * 1024) {
      output.textContent = "Kuva on liian suuri (max noin 8 Mt).";
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("grade", grade);
    formData.append("goal", goal);

    if (images.length === 1) {
      formData.append("images", images[0]);
    }

    output.textContent = "Lähetetään palvelimelle... tämä voi kestää hetken.";

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

      if (!res.ok) {
        output.textContent =
          "Virhe palvelimelta: " + res.status + " " + res.statusText + "\n\n" + bodyText;
        return;
      }

      output.textContent = bodyText;
    } catch (err) {
      output.textContent = "Fetch-virhe (selaimen päässä): " + err.message;
    }
  });
});
