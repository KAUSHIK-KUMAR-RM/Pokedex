async function getPokemon() {
  const input = document.getElementById("pokemonInput").value.toLowerCase();
  const url = `https://pokeapi.co/api/v2/pokemon/${input}`;
  
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

    // Stats
    const statsList = document.getElementById("pokemonStats");
    statsList.innerHTML = ""; // clear old stats
    data.stats.forEach(stat => {
      const li = document.createElement("li");
      li.textContent = `${stat.stat.name.toUpperCase()}: ${stat.base_stat}`;
      statsList.appendChild(li);
    });

    document.getElementById("pokemonCard").classList.remove("hidden");
  } catch (error) {
    alert(error.message);
  }
}

// Dark Mode Toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Change button text dynamically
  const btn = document.getElementById("themeToggle");
  if (document.body.classList.contains("dark")) {
    btn.textContent = "☀️ Light Mode";
  } else {
    btn.textContent = "🌙 Dark Mode";
  }
});

