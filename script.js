async function getPokemon() {
  const input = document.getElementById("pokemonInput").value.toLowerCase();
  const url = `https://pokeapi.co/api/v2/pokemon/${input}`;
  const loading = document.getElementById("loading");
  const card = document.getElementById("pokemonCard");

  // Show loading, hide card
  loading.classList.remove("hidden");
  card.classList.add("hidden");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Pokémon not found");

    const data = await res.json();

    // Basic Info
    document.getElementById("pokemonName").innerText = data.name.toUpperCase();
    document.getElementById("pokemonImage").src = data.sprites.front_default;
    document.getElementById("pokemonType").innerText = data.types.map(t => t.type.name).join(", ");
    document.getElementById("pokemonExp").innerText = data.base_experience;
    document.getElementById("pokemonAbilities").innerText = data.abilities.map(a => a.ability.name).join(", ");

    // Stats with progress bars
    const statsList = document.getElementById("pokemonStats");
    statsList.innerHTML = "";
    data.stats.forEach(stat => {
      const li = document.createElement("li");
      const value = stat.base_stat;
      li.innerHTML = `<span>${stat.stat.name.toUpperCase()}: ${value}</span>`;
      li.style.setProperty("--stat-width", `${Math.min(value, 100)}%`);
      statsList.appendChild(li);
    });

    // Hide loading, show card
    loading.classList.add("hidden");
    card.classList.remove("hidden");
  } catch (error) {
    alert(error.message);
    loading.classList.add("hidden");
  }
}

// Dark Mode Toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const btn = document.getElementById("themeToggle");
  if (document.body.classList.contains("dark")) {
    btn.textContent = "☀️ Light Mode";
  } else {
    btn.textContent = "🌙 Dark Mode";
  }
});
