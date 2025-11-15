document.getElementById("prepForm").onsubmit = async function (e) {
  e.preventDefault();

  const subject = document.getElementById("subject").value;
  const grade = document.getElementById("grade").value;
  const goal = document.getElementById("goal").value;
  const images = document.getElementById("images").files;

  // tee FormData backendille
  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("grade", grade);
  formData.append("goal", goal);

  for (let i = 0; i < images.length; i++) {
    formData.append("images", images[i]);
  }

  const res = await fetch("https://bold-dawn-2443.vitikainenpetteri.workers.dev", {
    method: "POST",
    body: formData
  });

  const text = await res.text();
  document.getElementById("output").textContent = text;
};
