const listRoot = document.querySelector("[data-shows]");
const todayNode = document.querySelector("[data-today]");

function localDateISO(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function normalizeDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return "";

  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function normalizeShow(show) {
  return {
    date: normalizeDate(show.date),
    location: String(show.location || ""),
    bands: Array.isArray(show.bands) ? show.bands.map(String) : []
  };
}

function categorizeShows(shows, today = localDateISO()) {
  const normalized = shows.map(normalizeShow).filter((show) => show.date && show.location);
  const future = normalized
    .filter((show) => show.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = normalized
    .filter((show) => show.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return { today, future, past };
}

function formatBands(bands) {
  return bands.length > 0 ? bands.join(" / ") : "tba";
}

function showLine(show) {
  return `${show.date}  ${show.location}\n            ${formatBands(show.bands)}`;
}

function section(title, shows) {
  const lines = shows.length > 0 ? shows.map(showLine).join("\n\n") : "none listed";

  return `
${title}
${"-".repeat(title.length)}
${lines}`;
}

function renderShows(data) {
  todayNode.textContent = `current date: ${data.today}`;
  listRoot.textContent = `${section("future shows", data.future)}\n\n${section("past shows", data.past)}`;
}

function fetchJson(path) {
  return fetch(path).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${path}.`);
    return response.json();
  });
}

fetchJson("shows-data.json")
  .then((shows) => categorizeShows(shows))
  .catch(() => fetchJson("/api/shows"))
  .then(renderShows)
  .catch((error) => {
    const hasRenderedShows = !/loading shows database|Could not load/.test(listRoot.textContent);
    if (hasRenderedShows) return;

    todayNode.textContent = "current date: unavailable";
    listRoot.textContent = error.message;
  });
