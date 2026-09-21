const query = (selector) => document.querySelector(selector);
const advancedToggle = query('#advancedToggle');
const advancedRow = query('#advancedRow');
const searchButton = query('#searchButton');
const toast = query('#toast');
const cards = [...document.querySelectorAll('.car-card')];
const favoriteStorageKey = 'velocity-favorites';

const getSavedFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
  } catch {
    return [];
  }
};

const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
  } catch {
  }
};

advancedToggle?.addEventListener('click', () => {
  const isOpen = !advancedRow.hidden;
  advancedRow.hidden = isOpen;
  advancedToggle.firstChild.textContent = isOpen ? '＋ Advanced search ' : '− Hide advanced search ';
});

document.querySelectorAll('.favorite').forEach((button, index) => {
  const savedFavorites = getSavedFavorites();
  if (savedFavorites.includes(index)) {
    button.classList.add('saved');
    button.textContent = '♥';
    button.setAttribute('aria-label', 'Remove car from favorites');
  }
  button.addEventListener('click', () => {
    const favorites = getSavedFavorites();
    const isSaved = button.classList.toggle('saved');
    button.textContent = isSaved ? '♥' : '♡';
    button.setAttribute('aria-label', isSaved ? 'Remove car from favorites' : 'Add car to favorites');
    const nextFavorites = isSaved ? [...new Set([...favorites, index])] : favorites.filter((favorite) => favorite !== index);
    saveFavorites(nextFavorites);
    showToast(isSaved ? 'Saved to your favorites' : 'Removed from favorites');
  });
});

const filterInventory = () => {
  const make = query('#make')?.value || '';
  const price = query('#price')?.value || '';
  let visible = 0;
  cards.forEach((card) => {
    const makeMatches = !make || card.dataset.make === make;
    const priceMatches = !price || (price.includes('Under') && card.dataset.price === 'low') || (price.includes('50,000') && card.dataset.price === 'mid') || (price.includes('Over') && card.dataset.price === 'high');
    const isVisible = makeMatches && priceMatches;
    card.hidden = !isVisible;
    if (isVisible) visible += 1;
  });
  query('#emptyState').hidden = visible !== 0;
  showToast(visible ? `${visible} curated ${visible === 1 ? 'car' : 'cars'} found` : 'No cars match those filters');
  query('#inventory')?.scrollIntoView({ behavior: 'smooth' });
};

searchButton?.addEventListener('click', filterInventory);
query('#resetButton')?.addEventListener('click', () => {
  ['#make', '#price', '#year', '#bodyType', '#fuel'].forEach((selector) => {
    const field = query(selector);
    if (field) field.selectedIndex = 0;
  });
  cards.forEach((card) => { card.hidden = false; });
  query('#emptyState').hidden = true;
  showToast('Search reset');
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.mode === 'sell') {
      searchButton.querySelector('span').textContent = 'Start a valuation';
      showToast('Ready to value your car');
      query('#sell')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      searchButton.querySelector('span').textContent = 'Search inventory';
    }
  });
});

document.querySelectorAll('.brands button').forEach((brand) => {
  brand.addEventListener('click', () => {
    const makeField = query('#make');
    const matchingOption = [...makeField.options].find((option) => option.text.toLowerCase() === brand.textContent.trim().toLowerCase());
    if (matchingOption) {
      makeField.value = matchingOption.value;
      filterInventory();
    }
  });
});

query('#newsletterForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  query('#formMessage').textContent = 'You are on the list. See you in your inbox.';
  event.target.querySelector('input').value = '';
  showToast('Welcome to the Velocity list');
});

const menuButton = query('#menuButton');
const mobileNav = query('#mobileNav');
menuButton?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? '×' : '☰';
});
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = '☰';
}));

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2600);
}
