
// Pokemon database with IDs (first 1010 Pokemon as of 2024)
const POKEMON_IDS = Array.from({length: 1010}, (_, i) => i + 1);

// Function to find similar Pokemon IDs
function findSimilarIds(input) {
  let processedInput = input;
  if (/^\d+$/.test(input)) {
    processedInput = parseInt(input, 10).toString();
  }
  
  const inputStr = processedInput.toString();
  const suggestions = [];
  
  if (/^\d+$/.test(inputStr)) {
    for (let id of POKEMON_IDS) {
      const idStr = id.toString();
      if (idStr.includes(inputStr) && id.toString() !== inputStr) {
        suggestions.push(id);
      }
      if (suggestions.length >= 6) break;
    }
    
    if (suggestions.length === 0 && inputStr.length <= 3) {
      const paddedInput = inputStr.padStart(3, '0');
      const paddedNum = parseInt(paddedInput);
      if (paddedNum >= 1 && paddedNum <= 1010 && paddedNum.toString() !== inputStr) {
        suggestions.push(paddedNum);
      }
      
      const numInput = parseInt(inputStr);
      if (numInput >= 1 && numInput <= 1010 && numInput.toString() !== inputStr) {
        suggestions.push(numInput);
      }
    }
  }
  
  return suggestions.slice(0, 6);
}

// Function to display Pokemon not found message with suggestions
function showPokemonNotFound(input) {
  const defaultCards = document.getElementById("defaultCards");
  const pokemonCard = document.getElementById("pokemonCard");
  
  defaultCards.classList.add("hidden");
  
  const suggestions = findSimilarIds(input);
  
  let suggestionText = '';
  if (suggestions.length > 0) {
    suggestionText = `
      <div class="suggestions-section">
        <p class="suggestion-text">Try these IDs:</p>
        <div class="suggestion-buttons">
          ${suggestions.map(id => 
            `<button class="suggestion-btn" onclick="searchSuggestedPokemon(${id})" data-id="${id}">
              #${id.toString().padStart(3, '0')}
            </button>`
          ).join('')}
        </div>
      </div>
    `;
  }
  
  pokemonCard.innerHTML = `
    <div class="error-container">
      <h2 class="error-title">❌ Pokémon Not Found</h2>
      ${suggestionText}
      <button id="backToDefault" class="back-btn" onclick="showDefaultCards()">Back to Home</button>
    </div>
  `;
  
  pokemonCard.classList.remove("hidden");
}

// Function to search for suggested Pokemon
async function searchSuggestedPokemon(id) {
  const input = document.getElementById("pokemonInput");
  input.value = id;
  await getPokemon();
}

// Function to create animated background particles
function createParticles() {
  const particlesContainer = document.querySelector('.particles');
  const colors = ['#bb86fc', '#03dac6', '#cf6679'];
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
    particlesContainer.appendChild(particle);
  }
}

// Main Pokemon search function
async function getPokemon() {
  let input = document.getElementById("pokemonInput").value.toLowerCase().trim();
  if (!input) {
    showEmptySearchError();
    return;
  }

  if (/^\d+$/.test(input)) {
    input = parseInt(input, 10).toString();
  }

  const url = `https://pokeapi.co/api/v2/pokemon/${input}`;
  const loading = document.getElementById("loading");
  const card = document.getElementById("pokemonCard");
  const defaultCards = document.getElementById("defaultCards");

  defaultCards.classList.add("hidden");
  loading.classList.remove("hidden");
  card.classList.add("hidden");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Pokémon not found`);
    }

    const data = await res.json();

    document.getElementById("pokemonInput").value = '';

    document.getElementById("pokemonName").innerText = capitalizeName(data.name);
    
    const imageElement = document.getElementById("pokemonImage");
    imageElement.src = data.sprites.front_default || 
                       data.sprites.front_shiny || 
                       data.sprites.other?.['official-artwork']?.front_default ||
                       'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    
    imageElement.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    };
    
    document.getElementById("pokemonType").innerText = data.types.map(t => t.type.name).join(", ");
    document.getElementById("pokemonExp").innerText = data.base_experience || "N/A";
    document.getElementById("pokemonAbilities").innerText = data.abilities.map(a => a.ability.name).join(", ");

    const statsList = document.getElementById("pokemonStats");
    statsList.innerHTML = "";
    
    if (data.stats && data.stats.length > 0) {
      data.stats.forEach((stat, index) => {
        const li = document.createElement("li");
        const value = stat.base_stat;
        const percentage = Math.min((value / 150) * 100, 100);
        li.innerHTML = `<span>${stat.stat.name.toUpperCase()}: ${value}</span>`;
        li.style.setProperty("--stat-width", "0%");
        statsList.appendChild(li);

        setTimeout(() => {
          li.style.setProperty("--stat-width", `${percentage}%`);
        }, index * 200 + 500);
      });
    }

    setTimeout(() => {
      loading.classList.add("hidden");
      card.classList.remove("hidden");
      
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }, 300);

  } catch (error) {
    loading.classList.add("hidden");
    
    if (error.name === 'AbortError') {
      showTimeoutError();
    } else {
      showPokemonNotFound(input);
    }
  }
}

// Function to load Pokemon from default card click
async function loadDefaultPokemon(pokemonName) {
  let processedName = pokemonName;
  
  if (/^\d+$/.test(pokemonName)) {
    processedName = parseInt(pokemonName, 10).toString();
  }

  const loading = document.getElementById("loading");
  const card = document.getElementById("pokemonCard");
  const defaultCards = document.getElementById("defaultCards");

  defaultCards.classList.add("hidden");
  loading.classList.remove("hidden");
  card.classList.add("hidden");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const url = `https://pokeapi.co/api/v2/pokemon/${processedName}`;
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error("Pokémon not found");

    const data = await res.json();

    document.getElementById("pokemonName").innerText = capitalizeName(data.name);
    
    const imageElement = document.getElementById("pokemonImage");
    imageElement.src = data.sprites.front_default || 
                       data.sprites.front_shiny || 
                       data.sprites.other?.['official-artwork']?.front_default ||
                       'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    
    imageElement.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    };
    
    document.getElementById("pokemonType").innerText = data.types.map(t => t.type.name).join(", ");
    document.getElementById("pokemonExp").innerText = data.base_experience || "N/A";
    document.getElementById("pokemonAbilities").innerText = data.abilities.map(a => a.ability.name).join(", ");

    const statsList = document.getElementById("pokemonStats");
    statsList.innerHTML = "";
    
    if (data.stats && data.stats.length > 0) {
      data.stats.forEach((stat, index) => {
        const li = document.createElement("li");
        const value = stat.base_stat;
        const percentage = Math.min((value / 150) * 100, 100);
        li.innerHTML = `<span>${stat.stat.name.toUpperCase()}: ${value}</span>`;
        li.style.setProperty("--stat-width", "0%");
        statsList.appendChild(li);

        setTimeout(() => {
          li.style.setProperty("--stat-width", `${percentage}%`);
        }, index * 200 + 500);
      });
    }

    setTimeout(() => {
      loading.classList.add("hidden");
      card.classList.remove("hidden");
      
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }, 300);

  } catch (error) {
    loading.classList.add("hidden");
    
    if (error.name === 'AbortError') {
      showTimeoutError();
    } else {
      showPokemonNotFound(pokemonName);
    }
  }
}

// Function to return to default cards view
function showDefaultCards() {
  const card = document.getElementById("pokemonCard");
  const defaultCards = document.getElementById("defaultCards");
  
  card.classList.add("hidden");
  defaultCards.classList.remove("hidden");
  
  document.getElementById("pokemonInput").value = '';
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Function to create ripple effect for buttons
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  
  const x = event.type === 'click' ? event.clientX - rect.left - size / 2 : event.changedTouches[0].clientX - rect.left - size / 2;
  const y = event.type === 'click' ? event.clientY - rect.top - size / 2 : event.changedTouches[0].clientY - rect.top - size / 2;
  
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'rgba(255, 255, 255, 0.4)';
  ripple.style.transform = 'scale(0)';
  ripple.style.animation = 'ripple 0.6s linear';
  
  if (!document.querySelector('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Helper functions for error handling
function showEmptySearchError() {
  const pokemonCard = document.getElementById("pokemonCard");
  const defaultCards = document.getElementById("defaultCards");
  
  defaultCards.classList.add("hidden");
  pokemonCard.innerHTML = `
    <div class="error-container">
      <h2 class="error-title">⚠️ Empty Search</h2>
      <p class="error-message">Please enter a Pokémon name or ID to search!</p>
      <button id="backToDefault" class="back-btn">Back to Home</button>
    </div>
  `;
  pokemonCard.classList.remove("hidden");
  
  setTimeout(() => {
    document.getElementById("pokemonInput").focus();
  }, 100);
}

function showTimeoutError() {
  const pokemonCard = document.getElementById("pokemonCard");
  const defaultCards = document.getElementById("defaultCards");
  
  defaultCards.classList.add("hidden");
  pokemonCard.innerHTML = `
    <div class="error-container">
      <h2 class="error-title">⏰ Request Timeout</h2>
      <p class="error-message">The request is taking too long. Please check your internet connection and try again.</p>
      <button id="backToDefault" class="back-btn">Back to Home</button>
    </div>
  `;
  pokemonCard.classList.remove("hidden");
}

// Utility function to capitalize Pokemon names properly
function capitalizeName(name) {
  return name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  
  // Search input enter key event listener
  document.getElementById("pokemonInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      getPokemon();
    }
  });

  // Search button
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      getPokemon();
    });
    searchBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      getPokemon();
    });
    searchBtn.addEventListener('click', createRipple);
    searchBtn.addEventListener('touchend', createRipple);
  }

  // Default card click event listeners
  document.querySelectorAll('.default-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const pokemonName = this.getAttribute('data-pokemon');
      loadDefaultPokemon(pokemonName);
    });
    
    card.addEventListener('touchend', function(e) {
      e.preventDefault();
      const pokemonName = this.getAttribute('data-pokemon');
      loadDefaultPokemon(pokemonName);
    });
  });

  // Back button event delegation
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'backToDefault') {
      showDefaultCards();
    }
  });

  // Add ripple effects to back and suggestion buttons
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.classList.contains('back-btn') || e.target.classList.contains('suggestion-btn'))) {
      createRipple(e);
    }
  });

  // Mobile-specific optimizations
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('mobile-device');
    
    document.querySelectorAll('button, .default-card').forEach(element => {
      element.addEventListener('touchend', function(e) {
        e.preventDefault();
      });
    });
    
    const input = document.getElementById("pokemonInput");
    input.addEventListener('focus', function() {
      setTimeout(() => {
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  }

  // Network status handling
  window.addEventListener('online', function() {
    console.log('Back online');
  });

  window.addEventListener('offline', function() {
    const pokemonCard = document.getElementById("pokemonCard");
    const defaultCards = document.getElementById("defaultCards");
    
    defaultCards.classList.add("hidden");
    pokemonCard.innerHTML = `
      <div class="error-container">
        <h2 class="error-title">📡 No Connection</h2>
        <p class="error-message">You are offline. Please check your internet connection and try again.</p>
        <button id="backToDefault" class="back-btn">Back to Home</button>
      </div>
    `;
    pokemonCard.classList.remove("hidden");
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const card = document.getElementById('pokemonCard');
      if (!card.classList.contains('hidden')) {
        showDefaultCards();
      }
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      document.getElementById('pokemonInput').focus();
    }
  });

  console.log('Pokédex loaded successfully! 🎮');
  console.log('Shortcuts: ESC = Back to home, Ctrl/Cmd + K = Focus search');
});
