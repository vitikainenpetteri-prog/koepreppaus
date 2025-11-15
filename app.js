alert("app.js ladattu");  // näkyy heti kun sivu aukeaa, jos skripti toimii

document.getElementById("prepForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const subject = document.getElementById("subject").value;
  const grade = document.getElementById("grade").value;
  const goal = document.getElementById("goal").value;
  const images = document.getElementById("images").files;

  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("grade", grade);
  formData.append("goal", goal);
  for (let i = 0; i < images.length; i++) {
    formData.append("images", images[i]);
  }

  try {
    const res = await fetch("https://bold-dawn-2443.vitikainenpetteri.workers.dev", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      document.getElementById("output").textContent =
        "Virhe: " + res.status + " " + res.statusText + "\n" + errText;
      return;
    }

    const text = await res.text();
    document.getElementById("output").textContent = text;
  } catch (err) {
    document.getElementById("output").textContent = "Fetch-virhe: " + err.message;
  }
});
