document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestionsBox");

  if (!searchInput) return;

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (!query) {
      suggestionsBox.classList.add("d-none");
      return;
    }

    try {
      const res = await fetch(`/listings/suggestions?q=${query}`);
      const data = await res.json();

      suggestionsBox.innerHTML = "";

      if (data.length === 0) {
        suggestionsBox.classList.add("d-none");
        return;
      }

      data.forEach(location => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = location;

        div.addEventListener("click", () => {
          searchInput.value = location;
          suggestionsBox.classList.add("d-none");
        });

        suggestionsBox.appendChild(div);
      });

      suggestionsBox.classList.remove("d-none");

    } catch (err) {
      console.error("Suggestion error:", err);
    }
  });

});