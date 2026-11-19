const API_KEY = import.meta.env.VITE_OMDB_KEY; // from .env, never hardcoded
const OMDB_URL = 'https://www.omdbapi.com/';
const MOCK_URL = 'http://localhost:3001/watchlist'; // JSON Server

const $ = (id) => document.getElementById(id);
let current = null;

function setStatus(msg, isError = false) {
  $('status').textContent = msg;
  $('status').className = isError ? 'error' : '';
}

async function searchMovie() {
  const title = $('title').value.trim();
  if (!title) return setStatus('Enter a movie title.', true);
  if (!API_KEY) return setStatus('API key missing: add VITE_OMDB_KEY to .env', true);

  setStatus('Loading...');
  $('result').hidden = true;
  try {
    const res = await fetch(`${OMDB_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`); // GET
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.Response === 'False') throw new Error(data.Error || 'Movie not found');

    current = data;
    $('titleYear').textContent = `${data.Title} (${data.Year})`;
    $('rating').textContent = data.imdbRating;
    $('plot').textContent = data.Plot;
    $('result').hidden = false;
    setStatus('');
  } catch (err) {
    setStatus(`Error: ${err.message}`, true);
  }
}

async function addToWatchlist() {
  if (!current) return;
  const payload = { title: current.Title, year: current.Year, rating: current.imdbRating };
  try {
    const res = await fetch(MOCK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setStatus(`"${payload.title}" added to watchlist.`);
  } catch (err) {
    setStatus(`Could not save (is JSON Server running?): ${err.message}`, true);
  }
}

$('searchBtn').addEventListener('click', searchMovie);
$('title').addEventListener('keydown', (e) => e.key === 'Enter' && searchMovie());
$('watchBtn').addEventListener('click', addToWatchlist);
