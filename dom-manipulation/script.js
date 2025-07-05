let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Stay hungry, stay foolish.", category: "Inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "The only limit to our realization of tomorrow is our doubts today.", category: "Motivation" }
    ];
    saveQuotes();
  }
  populateCategories();
  restoreFilter();
  displayRandomQuote();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function displayRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;

  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerHTML = `<p>${filteredQuotes[randomIndex].text}</p><small>— ${filteredQuotes[randomIndex].category}</small>`;
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Please fill both fields!');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  alert('Quote added!');
}

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  displayRandomQuote();
}

function restoreFilter() {
  const lastFilter = localStorage.getItem('selectedCategory');
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format!');
        return;
      }
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayRandomQuote();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert('Failed to import JSON!');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const serverData = await response.json();

  const serverQuotes = serverData.map(post => ({
    text: post.title,
    category: "Server"
  }));

  return serverQuotes;
}

async function postQuotesToServer(newQuotes) {
  for (const quote of newQuotes) {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
  }
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let conflictDetected = false;

    serverQuotes.forEach(serverQuote => {
      const localQuote = quotes.find(q => q.text === serverQuote.text);
      if (!localQuote) {
        quotes.push(serverQuote);
            } else if (localQuote.category !== serverQuote.category) {
              // Handle conflict if needed (currently just flagging)
              conflictDetected = true;
            }
          });
      
          if (conflictDetected) {
            alert('Some quotes had category conflicts and were not updated.');
          } else {
            saveQuotes();
            populateCategories();
            displayRandomQuote();
            alert('Quotes synchronized successfully!');
          }
        } catch (error) {
          alert('Failed to sync quotes with server!');
        }
      }
