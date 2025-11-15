alert("app.js ladattu");  // näkyy kun skripti varmasti latautuu

document.getElementById("prepForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const output = document.getElementById("output");
  output.textContent = "Valmistellaan lähetystä...";

  const subject = document.getElementById("subject").value;
  const grade = document.getElementById("grade").value;
  const goal = document.getElementById("goal").value;
  const images = document.getElementById("images").files;

  // Pieni turvaraja: maksimissaan 1 kuva ja max 10 Mt
  if (images.length > 1) {
    output.textContent = "Testivaiheessa sallitaan nyt vain 1 kuva kerrallaan.";
    return;
  }

  if (images.length === 1 && images[0].size > 10 * 1024 * 1024) {
    output.textContent = "Kuva on liian suuri testiin (max noin 10 Mt).";
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
