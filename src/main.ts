import "./style.css";
import { searchCountry, type SearchCountryResponse } from "./searchCountry.ts";
import { type UiCard } from "./mapCountryResponse.ts";
import type { Country } from "./types.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;

const input = document.createElement("input");
input.type = "search";
input.placeholder = "Country name";

const statusLine = document.createElement("p");
statusLine.className = "status";
statusLine.role = "status";

const errorBox = document.createElement("div");
errorBox.className = "error";
errorBox.hidden = true;
const errorText = document.createElement("span");
errorText.textContent = "Failed to load data. ";
const retryButton = document.createElement("button");
retryButton.textContent = "Retry";
errorBox.append(errorText, retryButton);

const results = document.createElement("ul");
results.className = "results";

app.append(input, statusLine, errorBox, results);

const dialog = document.createElement("dialog");
dialog.className = "details";
const closeButton = document.createElement("button");
closeButton.type = "button";
closeButton.textContent = "Close";
closeButton.onclick = () => dialog.close();
const detailsContent = document.createElement("div");
detailsContent.className = "details-content";
dialog.append(closeButton, detailsContent);
// Clicks on the backdrop land on the dialog itself, not on its content.
dialog.onclick = (event) => {
  if (event.target === dialog) dialog.close();
};
app.append(dialog);

const showDetails = (country: Country) => {
  const title = document.createElement("h2");
  title.textContent = country.name;

  const rows: [string, string | undefined][] = [
    ["Native name", country.nativeName],
    ["Capital", country.capital],
    ["Region", [country.region, country.subregion].filter(Boolean).join(" · ")],
    ["Population", country.population?.toLocaleString("en-US")],
    [
      "Area",
      country.area ? `${country.area.toLocaleString("en-US")} km²` : undefined,
    ],
    ["Borders", country.borders?.join(", ")],
    [
      "Languages",
      country.languages
        ?.map((l) => l.name)
        .filter(Boolean)
        .join(", "),
    ],
    [
      "Currency",
      country.currencies
        ?.map((c) => [c.name, c.symbol].filter(Boolean).join(" "))
        .join(", "),
    ],
  ];
  const list = document.createElement("dl");
  for (const [label, value] of rows) {
    const term = document.createElement("dt");
    term.textContent = label;
    const definition = document.createElement("dd");
    definition.textContent = value || "—";
    list.append(term, definition);
  }

  detailsContent.replaceChildren(title, list);
  dialog.showModal();
};

let lastQuery = "";

const showStatus = (text: string) => {
  statusLine.textContent = text;
  statusLine.hidden = text === "";
};

const renderCard = (country: Country, card: UiCard): HTMLLIElement => {
  const item = document.createElement("li");
  item.className = "card";
  item.tabIndex = 0;
  item.onclick = () => showDetails(country);
  item.onkeydown = (event) => {
    if (event.key === "Enter") showDetails(country);
  };

  if (card.flag) {
    const flag = document.createElement("img");
    flag.src = card.flag;
    flag.alt = `Flag: ${card.name}`;
    flag.loading = "lazy";
    item.append(flag);
  }

  const name = document.createElement("h2");
  name.textContent = card.name;
  item.append(name);

  const fields: [string, string | undefined][] = [
    ["Capital", card.capital],
    ["Region", card.region],
    ["Population", card.population?.toLocaleString("ru-RU")],
  ];
  for (const [label, value] of fields) {
    const line = document.createElement("p");
    line.textContent = `${label}: ${value ?? "—"}`;
    item.append(line);
  }

  return item;
};

const showLoading = () => {
  results.replaceChildren();
  errorBox.hidden = true;
  showStatus("Loading...");
};

const showResults = (countries: SearchCountryResponse) => {
  errorBox.hidden = true;
  results.replaceChildren(
    ...countries.map(({ country, card }) => renderCard(country, card)),
  );
  showStatus(countries.length ? "" : "Ничего не найдено");
};

const showError = () => {
  results.replaceChildren();
  showStatus("");
  errorBox.hidden = false;
};

const search = searchCountry(
  (countries) => {
    if (lastQuery) showResults(countries);
  },
  () => {
    if (lastQuery) showError();
  },
);

const runSearch = (query: string) => {
  lastQuery = query;
  if (query) {
    showLoading();
  } else {
    results.replaceChildren();
    errorBox.hidden = true;
    showStatus("");
  }
  search.execute(query);
};

input.oninput = () => runSearch(input.value.trim());
retryButton.onclick = () => runSearch(lastQuery);
