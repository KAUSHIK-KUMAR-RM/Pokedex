// Global variables and constants
let currentPokemon = null;
const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Load saved theme preference
  loadThemePreference();
  
  // Add event listeners
  setupEventListeners();
  
  // Initialize search suggestions (optional enhancement)
  initializeSearchSuggestions();
}

function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Search functionality
  const searchInput = document.getElementById('pokemonInput');
  searchInput.addEventListener('keypress', handleEnterKey);
  searchInput.addEventListener('input', handleSearchInput);
  
  // Search button click (assuming you have onclick="getPokemon()" in HTML)
  // If not, uncomment the line below:
  // document.querySelector('.search-btn').addEventListener('click', getPokemon);
}

function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    getPokemon();
  }
}

function handleSearchInput(event) {
  const value = event.target.value.trim();
  
  // Optional: Add search suggestions or validation here
  if (value.length > 0) {
    event.target.parentElement.classList.add('has-input');
  } else {
    event.target.parentElement.classList.remove('has-input');
  }
}

// Enhanced Pokemon fetching function
async function getPokemon() {
  const input = document.getElementById("pokemonInput").value.toLowerCase().trim();
  
  // Input validation
  if (!input) {
    showError('Please enter a Pokémon name or ID');
    return;
  }
  
  // Clear previous error states
  clearErrors();
  
  const url = `${API_BASE_URL}${input}`;
  const loading = document.getElementById("loading");
  const card = document.getElementById("pokemonCard");

  // Show loading state
  showLoading();
  hideCard();

  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Pokémon "${input}" not found. Please check the spelling or try a different name.`);
      } else {
        throw new Error(`Failed to fetch Pokémon data. Please try again later.`);
      }
    }

    const data = await res.json();
    currentPokemon = data; // Store for potential future use
    
    await displayPokemon(data);
    
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    hideLoading();
    showError(error.message);
  }
}

async function displayPokemon(data) {
  try {
    // Hide loading first
    hideLoading();
    
    // Basic Pokemon Information
    displayBasicInfo(data);
    
    // Display Pokemon Image
    await displayPokemonImage(data);
    
    // Display Types with enhanced styling
    displayPokemonTypes(data);
    
    // Display Pokemon Stats with animations
    displayPokemonStats(data);
    
    // Display Additional Info
    displayAdditionalInfo(data);
    
    // Show card with animation
    showCard();
    
    // Optional: Scroll to card on mobile
    scrollToCard();
    
  } catch (error) {
    console.error('Error displaying Pokemon:', error);
    showError('Failed to display Pokémon information');
  }
}

function displayBasicInfo(data) {
  // Pokemon name with proper capitalization
  const nameElement = document.getElementById("pokemonName");
  if (nameElement) {
    nameElement.textContent = capitalizeFirstLetter(data.name);
  }
  
  // Pokemon ID
  const idElement = document.getElementById("pokemonId");
  if (idElement) {
    idElement.textContent = `#${data.id.toString().padStart(3, '0')}`;
  }
}

async function displayPokemonImage(data) {
  const imageElement = document.getElementById("pokemonImage");
  if (!imageElement) return;
  
  // Try to get the best quality image available
  const imageUrl = data.sprites.other?.['official-artwork']?.front_default || 
                  data.sprites.other?.dream_world?.front_default ||
                  data.sprites.other?.home?.front_default ||
                  data.sprites.front_default;
  
  if (imageUrl) {
    // Create a promise to handle image loading
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageElement.src = imageUrl;
        imageElement.alt = `${data.name} artwork`;
        resolve();
      };
      img.onerror = () => {
        console.warn('Failed to load high-quality image, using default');
        imageElement.src = data.sprites.front_default;
        imageElement.alt = `${data.name} sprite`;
        resolve();
      };
      img.src = imageUrl;
    });
  }
}

function displayPokemonTypes(data) {
  const typeContainer = document.getElementById('typeContainer');
  if (!typeContainer) return;
  
  typeContainer.innerHTML = '';
  
  data.types.forEach((typeInfo, index) => {
    const badge = document.createElement('span');
    badge.className = `type-badge type-${typeInfo.type.name}`;
    badge.textContent = capitalizeFirstLetter(typeInfo.type.name);
    
    // Add staggered animation
    badge.style.animationDelay = `${index * 0.1}s`;
    badge.classList.add('fade-in');
    
    typeContainer.appendChild(badge);
  });
}

function displayAdditionalInfo(data) {
  // Base Experience
  const expElement = document.getElementById("pokemonExp");
  if (expElement) {
    expElement.textContent = data.base_experience || 'Unknown';
  }
  
  // Abilities
  const abilitiesElement = document.getElementById("pokemonAbilities");
  if (abilitiesElement) {
    const abilities = data.abilities.map(ability => 
      capitalizeFirstLetter(ability.ability.name.replace('-', ' '))
    ).join(', ');
    abilitiesElement.textContent = abilities;
  }
}

function displayPokemonStats(data) {
  const statsContainer = document.getElementById("pokemonStats");
  if (!statsContainer) return;
  
  statsContainer.innerHTML = "";
  
  // Get max stat value for better scaling
  const maxStat = Math.max(...data.stats.map(stat => stat.base_stat));
  const scaleMax = Math.max(maxStat, 100); // Minimum scale of 100
  
  data.stats.forEach((stat, index) => {
    const statItem = createStatElement(stat, scaleMax, index);
    statsContainer.appendChild(statItem);
  });
}

function createStatElement(stat, scaleMax, index) {
  const statItem = document.createElement("div");
  statItem.className = "stat-item";
  
  const statName = formatStatName(stat.stat.name);
  const statValue = stat.base_stat;
  const percentage = Math.min((statValue / scaleMax) * 100, 100);
  
  statItem.innerHTML = `
    <div class="stat-header">
      <span class="stat-name">${statName}</span>
      <span class="stat-value">${statValue}</span>
    </div>
    <div class="stat-bar">
      <div class="stat-fill" data-width="${percentage}"></div>
    </div>
  `;
  
  // Animate stat bars with delay
  setTimeout(() => {
    const fillElement = statItem.querySelector('.stat-fill');
    fillElement.style.width = `${percentage}%`;
  }, 150 + (index * 100));
  
  return statItem;
}

function formatStatName(name) {
  const nameMap = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Attack',
    'special-defense': 'Sp. Defense',
    'speed': 'Speed'
  };
  
  return nameMap[name] || capitalizeFirstLetter(name.replace('-', ' '));
}

// Theme Management
function toggleTheme() {
  document.body.classList.toggle("dark");
  updateThemeButton();
  saveThemePreference();
}

function updateThemeButton() {
  const btn = document.getElementById("themeToggle");
  const icon = btn.querySelector('i');
  const text = btn.querySelector('span');
  
  if (document.body.classList.contains("dark")) {
    icon.className = "fas fa-sun";
    text.textContent = "Light Mode";
  } else {
    icon.className = "fas fa-moon";
    text.textContent = "Dark Mode";
  }
}

function saveThemePreference() {
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem('pokemonApp_darkMode', isDark);
}

function loadThemePreference() {
  const isDark = localStorage.getItem('pokemonApp_darkMode') === 'true';
  if (isDark) {
    document.body.classList.add("dark");
    updateThemeButton();
  }
}

// UI State Management
function showLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.classList.remove("hidden");
    loading.classList.add("fade-in");
  }
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.classList.add("hidden");
    loading.classList.remove("fade-in");
  }
}

function showCard() {
  const card = document.getElementById("pokemonCard");
  if (card) {
    card.classList.remove("hidden");
    card.classList.add("fade-in");
  }
}

function hideCard() {
  const card = document.getElementById("pokemonCard");
  if (card) {
    card.classList.add("hidden");
    card.classList.remove("fade-in");
  }
}

// Error Handling
function showError(message) {
  // Create or update error display
  let errorDiv = document.getElementById('error-message');
  
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.className = 'error-message';
    
    const container = document.querySelector('.container');
    const searchSection = document.querySelector('.search-section');
    container.insertBefore(errorDiv, searchSection.nextSibling);
  }
  
  errorDiv.innerHTML = `
    <div class="error-content">
      <i class="fas fa-exclamation-triangle"></i>
      <span>${message}</span>
      <button onclick="clearErrors()" class="error-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  errorDiv.classList.remove('hidden');
  errorDiv.classList.add('fade-in');
  
  // Auto-hide after 5 seconds
  setTimeout(clearErrors, 5000);
}

function clearErrors() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.classList.add('hidden');
    errorDiv.classList.remove('fade-in');
  }
}

// Utility Functions
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function scrollToCard() {
  const card = document.getElementById("pokemonCard");
  if (card && window.innerWidth <= 768) {
    setTimeout(() => {
      card.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 300);
  }
}

// Optional: Search Suggestions (can be enhanced further)
function initializeSearchSuggestions() {
  // Popular Pokemon for suggestions
  const popularPokemon = [
    'pikachu', 'charizard', 'bulbasaur', 'squirtle', 'mew', 'mewtwo',
    'lucario', 'garchomp', 'dragonite', 'gyarados', 'alakazam', 'gengar'
  ];
  
  const searchInput = document.getElementById('pokemonInput');
  if (!searchInput) return;
  
  searchInput.addEventListener('focus', function() {
    // You can implement search suggestions here
    // This is a placeholder for potential future enhancement
  });
}

// Random Pokemon Feature (bonus)
function getRandomPokemon() {
  const randomId = Math.floor(Math.random() * 1010) + 1; // Gen 1-9 Pokemon
  document.getElementById('pokemonInput').value = randomId;
  getPokemon();
}

// Keyboard shortcuts (bonus feature)
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + K to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    document.getElementById('pokemonInput').focus();
  }
  
  // Escape to clear search
  if (event.key === 'Escape') {
    clearErrors();
    document.getElementById('pokemonInput').blur();
  }
});

// Add CSS for error messages (add this to your CSS file)
const errorStyles = `
.error-message {
  margin: 1rem auto;
  max-width: 500px;
  padding: 0;
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  overflow: hidden;
  animation: shake 0.5s ease-in-out;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  color: #ef4444;
  font-weight: 500;
}

.error-content i:first-child {
  font-size: 1.2rem;
}

.error-close {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-left: auto;
  transition: background-color 0.2s ease;
}

.error-close:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

body.dark .error-message {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

body.dark .error-content {
  color: #fca5a5;
}

body.dark .error-close {
  color: #fca5a5;
}
`;

// Inject error styles if not already present
if (!document.getElementById('error-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'error-styles';
  styleSheet.textContent = errorStyles;
  document.head.appendChild(styleSheet);
}

// Export functions for potential module use
window.getPokemon = getPokemon;
window.getRandomPokemon = getRandomPokemon;
window.clearErrors = clearErrors;
