// Load quotes from localStorage or fallback defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show random quote and store in sessionStorage
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  quoteDisplay.innerHTML = `
    <p><strong>Category:</strong> ${randomQuote.category}</p>
    <blockquote>"${randomQuote.text}"</blockquote>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Populate category dropdown
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  // Restore last filter
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    dropdown.value = lastFilter;
    filterQuotes();
  }
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  filtered.forEach(q => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>Category:</strong> ${q.category}</p>
      <blockquote>"${q.text}"</blockquote>
      <hr />
    `;
    quoteDisplay.appendChild(div);
  });
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes) || !importedQuotes.every(q => q.text && q.category)) {
        alert("Invalid JSON format.");
        return;
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Error reading JSON file.");
    }
  };

  fileReader.readAsText(event.target.files[0]);
}

// Sync quotes with server (simulated using JSONPlaceholder)
function syncWithServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(serverData => {
      const syncedQuotes = serverData.slice(0, 5).map(item => ({
        text: item.title,
        category: "Server"
      }));

      const newQuotes = syncedQuotes.filter(
        sq => !quotes.some(lq => lq.text === sq.text)
      );

      if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes synced from server!");
      }
    })
    .catch(err => console.error("Sync failed:", err));
}

// Initial setup on page load
window.onload = function () {
  populateCategories();

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `
      <p><strong>Category:</strong> ${quote.category}</p>
      <blockquote>"${quote.text}"</blockquote>
    `;
  }

  syncWithServer(); // initial sync
};

// Sync every 60 seconds
setInterval(syncWithServer, 60000);
