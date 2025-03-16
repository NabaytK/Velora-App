// Constants and configurations
const API_BASE_URL = '/api';

// DOM elements
const stockChartCanvas = document.getElementById('stockChartCanvas');
const chartLoading = document.getElementById('chartLoading');
const timeframeOptions = document.querySelectorAll('.timeframe-option');
const currentPrice = document.getElementById('currentPrice');
const priceChange = document.getElementById('priceChange');
const volume = document.getElementById('volume');
const marketCap = document.getElementById('marketCap');
const recommendation = document.getElementById('recommendation');
const predictionContainer = document.getElementById('predictionContainer');
const stockSelector = document.getElementById('stockSelector');
const stockSelectorModal = document.getElementById('stockSelectorModal');
const closeSelectorBtn = document.getElementById('closeSelectorBtn');
const stockGrid = document.getElementById('stockGrid');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const mfaOptions = document.querySelectorAll('.mfa-option');
const mfaInputSection = document.getElementById('mfaInputSection');
const chatMessages = document.getElementById('chatMessages');
const quizContainer = document.getElementById('quizContainer');

// Chat functionality
const chatInput = document.querySelector('.chat-input input');
const chatSendButton = document.querySelector('.chat-input button');

// Top 50 Symbols
const top50Symbols = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "PG",
  "MA", "HD", "CVX", "MRK", "ABBV", "LLY", "BAC", "PFE", "AVGO", "KO",
  "PEP", "TMO", "COST", "DIS", "CSCO", "ADBE", "WFC", "VZ", "ACN", "ABT",
  "CRM", "DHR", "INTC", "NFLX", "CMCSA", "TXN", "NEE", "QCOM", "HON", "AMGN",
  "IBM", "LOW", "INTU", "PM", "ORCL", "MCD"
];

// Company name mapping
const companyNames = {
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corp.",
  "GOOGL": "Alphabet Inc. (Google)",
  "AMZN": "Amazon.com Inc.",
  "TSLA": "Tesla Inc.",
  "NVDA": "NVIDIA Corp.",
  "META": "Meta Platforms Inc.",
  "JPM": "JPMorgan Chase & Co.",
  "V": "Visa Inc.",
  "PG": "Procter & Gamble Co.",
  "MA": "Mastercard Inc.",
  "HD": "Home Depot Inc.",
  "CVX": "Chevron Corp.",
  "MRK": "Merck & Co.",
  "ABBV": "AbbVie Inc.",
  "LLY": "Eli Lilly & Co.",
  "BAC": "Bank of America Corp.",
  "PFE": "Pfizer Inc.",
  "AVGO": "Broadcom Inc.",
  "KO": "Coca-Cola Co.",
  "PEP": "PepsiCo Inc.",
  "TMO": "Thermo Fisher Scientific",
  "COST": "Costco Wholesale Corp.",
  "DIS": "Walt Disney Co.",
  "CSCO": "Cisco Systems Inc.",
  "ADBE": "Adobe Inc.",
  "WFC": "Wells Fargo & Co.",
  "VZ": "Verizon Communications",
  "ACN": "Accenture PLC",
  "ABT": "Abbott Laboratories",
  "CRM": "Salesforce Inc.",
  "DHR": "Danaher Corp.",
  "INTC": "Intel Corp.",
  "NFLX": "Netflix Inc.",
  "CMCSA": "Comcast Corp.",
  "TXN": "Texas Instruments",
  "NEE": "NextEra Energy Inc.",
  "QCOM": "Qualcomm Inc.",
  "HON": "Honeywell International",
  "AMGN": "Amgen Inc.",
  "IBM": "IBM Corp.",
  "LOW": "Lowe's Companies Inc.",
  "INTU": "Intuit Inc.",
  "PM": "Philip Morris International",
  "ORCL": "Oracle Corp.",
  "MCD": "McDonald's Corp."
};

// ===================== CHART INITIALIZATION ======================
let stockChart = null;
let currentStock = 'AAPL';
let currentTimeframe = '30'; // Default: 1 month

// Initialize the chart
function initializeChart() {
  if (stockChartCanvas) {
    const ctx = stockChartCanvas.getContext('2d');
    stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Historical',
            data: [],
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: 'Predicted',
            data: [],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  }
}

// ===================== API FUNCTIONS ======================
// Fetch stock data from API
async function fetchStockData(symbol, days) {
  showLoader();
  
  try {
    // Try to fetch from the real API
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker: symbol }),
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Format the data for the chart
      const dates = [];
      const prices = [];
      
      // Add historical data
      if (data.historical && data.historical.length > 0) {
        data.historical.forEach(item => {
          dates.push(item.date);
          prices.push(item.price);
        });
      }
      
      // Return the formatted data
      return {
        dates,
        prices,
        currentPrice: data.current_price,
        change: data.percent_change,
        percentChange: data.percent_change,
        volume: "48.3M", // Placeholder
        marketCap: `$${(data.current_price * 2000000000 / 1000000000000).toFixed(2)}T`, // Placeholder
        prediction: data
      };
    } else {
      throw new Error("API call failed");
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    
    // Mock data for fallback
    const dates = [];
    const prices = [];
    const basePrice = Math.random() * 100 + 100;
    
    // Generate historical dates and prices
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate a price with some variation
      const noise = Math.sin(i / 5) * 10 + (Math.random() - 0.5) * 10;
      prices.push(basePrice + noise);
    }
    
    return {
      dates,
      prices,
      currentPrice: prices[prices.length - 1],
      change: prices[prices.length - 1] - prices[prices.length - 2],
      percentChange: ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]) * 100,
      volume: Math.floor(Math.random() * 50) + 20 + 'M',
      marketCap: (Math.floor(Math.random() * 2000) + 500) + 'B'
    };
  } finally {
    hideLoader();
  }
}

// Fetch prediction data from API
async function fetchPrediction(symbol) {
  try {
    console.log(`Fetching prediction for ${symbol}...`);
    
    // Try to use the real API
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker: symbol }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Prediction API response:', data);
        return data;
      }
    } catch (apiError) {
      console.warn('API call failed, using mock data:', apiError);
    }
    
    // If API call fails, use mock data
    const currentPrice = Math.floor(Math.random() * 200) + 100;
    const day1Change = (Math.random() * 6) - 2; // -2% to +4%
    const day2Change = day1Change + (Math.random() * 4) - 1; // Additional -1% to +3%
    const day3Change = day2Change + (Math.random() * 4) - 1; // Additional -1% to +3%
    
    const recommendation = day1Change > 2 ? 'BUY' : 
                          day1Change < -1 ? 'SELL' : 'HOLD';
    
    return {
      ticker: symbol,
      current_price: currentPrice,
      predicted_price: currentPrice * (1 + (day1Change / 100)),
      percent_change: day1Change,
      recommendation: recommendation,
      confidence: 75 + Math.floor(Math.random() * 20),
      explanation: `This is a ${recommendation.toLowerCase()} recommendation for ${symbol} based on our AI analysis.`,
      day1: {
        price: currentPrice * (1 + (day1Change / 100)),
        percent: day1Change,
        confidence: 85 + Math.floor(Math.random() * 10)
      },
      day2: {
        price: currentPrice * (1 + (day2Change / 100)),
        percent: day2Change,
        confidence: 75 + Math.floor(Math.random() * 15)
      },
      day3: {
        price: currentPrice * (1 + (day3Change / 100)),
        percent: day3Change,
        confidence: 70 + Math.floor(Math.random() * 15)
      }
    };
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return null;
  }
}

// ===================== UI UPDATE FUNCTIONS ======================
// Update chart with new data
function updateChart(symbol, stockData, predictionData) {
  if (!stockChart || !stockData) return;
  
  // Clear previous data
  stockChart.data.labels = [];
  stockChart.data.datasets[0].data = [];
  stockChart.data.datasets[1].data = [];
  
  // Update historical data
  stockChart.data.labels = stockData.dates;
  stockChart.data.datasets[0].data = stockData.prices;
  
  // Add prediction data if available
  if (predictionData) {
    const lastDate = new Date(stockData.dates[stockData.dates.length - 1]);
    
    // Add prediction points for 3 days
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(lastDate.getDate() + i);
      const dateString = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      stockChart.data.labels.push(dateString);
      
      // Add null to historical data (to create gap)
      stockChart.data.datasets[0].data.push(null);
      
      // Add prediction data
      let predPrice;
      if (i === 1) predPrice = predictionData.day1.price;
      else if (i === 2) predPrice = predictionData.day2.price;
      else predPrice = predictionData.day3.price;
      
      stockChart.data.datasets[1].data.push(predPrice);
    }
  }
  
  // Update chart
  stockChart.update();
}

// Update stock metrics display
function updateStockMetrics(symbol, stockData, predictionData) {
  if (!stockData) return;
  
  // Update current price
  if (currentPrice) {
    currentPrice.textContent = `$${stockData.currentPrice.toFixed(2)}`;
  }
  
  // Update price change
  if (priceChange) {
    const changeValue = stockData.change.toFixed(2);
    const percentChangeValue = stockData.percentChange.toFixed(1);
    
    priceChange.textContent = `${changeValue >= 0 ? '+' : ''}$${Math.abs(changeValue).toFixed(2)} (${changeValue >= 0 ? '+' : ''}${percentChangeValue}%)`;
    priceChange.className = `metric-value ${changeValue >= 0 ? 'price-up' : 'price-down'}`;
  }
  
  // Update volume
  if (volume) {
    volume.textContent = stockData.volume;
  }
  
  // Update market cap
  if (marketCap) {
    marketCap.textContent = stockData.marketCap;
  }
  
  // Update recommendation
  if (recommendation && predictionData) {
    recommendation.textContent = predictionData.recommendation;
    recommendation.className = `recommendation ${predictionData.recommendation.toLowerCase()}`;
  }
}

// Update prediction display
function updatePredictionDisplay(predictionData) {
  if (!predictionContainer || !predictionData) return;
  
  // Day 1 prediction
  if (document.getElementById('day1Price')) {
    document.getElementById('day1Price').textContent = `$${predictionData.day1.price.toFixed(2)}`;
    document.getElementById('day1Confidence').textContent = `${predictionData.day1.confidence.toFixed(0)}%`;
    document.getElementById('day1ConfidenceBar').style.width = `${predictionData.day1.confidence}%`;
  }
  
  // Day 2 prediction
  if (document.getElementById('day2Price')) {
    document.getElementById('day2Price').textContent = `$${predictionData.day2.price.toFixed(2)}`;
    document.getElementById('day2Confidence').textContent = `${predictionData.day2.confidence.toFixed(0)}%`;
    document.getElementById('day2ConfidenceBar').style.width = `${predictionData.day2.confidence}%`;
  }
  
  // Day 3 prediction
  if (document.getElementById('day3Price')) {
    document.getElementById('day3Price').textContent = `$${predictionData.day3.price.toFixed(2)}`;
    document.getElementById('day3Confidence').textContent = `${predictionData.day3.confidence.toFixed(0)}%`;
    document.getElementById('day3ConfidenceBar').style.width = `${predictionData.day3.confidence}%`;
  }
}

// Show loader
function showLoader() {
  if (chartLoading) {
    chartLoading.style.display = 'flex';
  }
}

// Hide loader
function hideLoader() {
  if (chartLoading) {
    chartLoading.style.display = 'none';
  }
}

// ===================== STOCK GRID FUNCTIONS ======================
// Generate stock grid items
function generateStockGrid() {
  if (!stockGrid) return;
  
  stockGrid.innerHTML = '';
  
  top50Symbols.forEach(symbol => {
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.dataset.symbol = symbol;
    
    card.innerHTML = `
      <div class="stock-symbol">${symbol}</div>
      <div class="stock-name">${companyNames[symbol] || symbol}</div>
    `;
    
    card.addEventListener('click', () => {
      selectStock(symbol);
      stockSelectorModal.style.display = 'none';
    });
    
    stockGrid.appendChild(card);
  });
}

// Select a stock
function selectStock(symbol) {
  currentStock = symbol;
  loadStockData();
}

// ===================== CHAT FUNCTIONS ======================
// Send chat message
function sendChatMessage() {
  if (!chatInput || !chatMessages) return;
  
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Add user message
  addChatMessage(message, 'user-message');
  
  // Clear input
  chatInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot-message typing-indicator';
  typingIndicator.innerHTML = `
    <div class="message-content">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Simulate bot response
  setTimeout(() => {
    // Remove typing indicator
    typingIndicator.remove();
    
    // Bot responses based on keywords
    let response;
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('prediction') || lowerMsg.includes('forecast')) {
      response = `Based on our AI analysis, ${currentStock} shows a potential change of ${(Math.random() * 6 - 2).toFixed(1)}% in the next trading day. This prediction has a confidence level of approximately ${75 + Math.floor(Math.random() * 20)}%.`;
    } else if (lowerMsg.includes('buy') || lowerMsg.includes('sell')) {
      const rec = Math.random() > 0.5 ? 'buy' : 'sell';
      response = `Our AI model currently suggests a "${rec.toUpperCase()}" recommendation for ${currentStock} based on recent price movements and market sentiment analysis.`;
    } else if (lowerMsg.includes('market') || lowerMsg.includes('trend')) {
      response = `The overall market is showing ${Math.random() > 0.5 ? 'bullish' : 'bearish'} signals today. Major indices are ${Math.random() > 0.5 ? 'up' : 'down'} with technology and healthcare sectors leading the ${Math.random() > 0.5 ? 'gains' : 'losses'}.`;
    } else if (lowerMsg.includes('risk')) {
      response = `For ${currentStock}, our volatility analysis indicates a ${Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'} risk profile. Always consider your risk tolerance before making investment decisions.`;
    } else {
      response = `Thank you for your message. Is there anything specific about ${currentStock} or another stock you'd like to know about? I can help with predictions, market analysis, or trading strategies.`;
    }
    
    // Add bot response
    addChatMessage(response, 'bot-message');
    
    // Show quiz randomly
    if (Math.random() > 0.7) {
      showQuiz();
    }
  }, 1000 + Math.random() * 1000);
}

// Add message to chat
function addChatMessage(text, className) {
  if (!chatMessages) return;
  
  const message = document.createElement('div');
  message.className = `message ${className}`;
  message.innerHTML = `<div class="message-content">${text}</div>`;
  
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show quiz
function showQuiz() {
  if (!quizContainer) return;
  
  const quizzes = [
    {
      question: "Which of these factors has the strongest influence on stock price movements?",
      options: ["Company Earnings", "Social Media Mentions", "CEO Twitter Activity", "Office Location"]
    },
    {
      question: "What is a 'Bull Market'?",
      options: ["Rising Stock Prices", "Falling Stock Prices", "Stable Stock Prices", "Market Dominated by Bullish Investors"]
    },
    {
      question: "Which pattern indicates a potential price reversal?",
      options: ["Head and Shoulders", "Triangle Formation", "Linear Regression", "Fibonacci Sequence"]
    }
  ];
  
  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  
  document.getElementById('quizQuestion').textContent = randomQuiz.question;
  
  const optionsContainer = document.getElementById('quizOptions');
  optionsContainer.innerHTML = '';
  
  randomQuiz.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'quiz-option';
    optionElement.textContent = option;
    optionElement.dataset.index = index;
    
    optionElement.addEventListener('click', function() {
      // Remove selected class from all options
      document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Add selected class to clicked option
      this.classList.add('selected');
    });
    
    optionsContainer.appendChild(optionElement);
  });
  
  quizContainer.style.display = 'block';
  
  // Add submit event listener
  const submitButton = quizContainer.querySelector('.quiz-submit');
  submitButton.onclick = function() {
    const selectedOption = optionsContainer.querySelector('.selected');
    if (selectedOption) {
      // Always give correct answer feedback for demo
      addChatMessage(`Correct! "${selectedOption.textContent}" is the right answer. +10 points added to your learning score.`, 'bot-message');
      quizContainer.style.display = 'none';
    }
  };
}

// ===================== INITIALIZATION FUNCTIONS ======================
// Load stock data
async function loadStockData() {
  console.log(`Loading data for ${currentStock} with timeframe ${currentTimeframe}`);
  
  // Fetch stock data
  const stockData = await fetchStockData(currentStock, parseInt(currentTimeframe));
  
  // Fetch prediction
  const predictionData = await fetchPrediction(currentStock);
  
  // Update UI
  updateChart(currentStock, stockData, predictionData);
  updateStockMetrics(currentStock, stockData, predictionData);
  updatePredictionDisplay(predictionData);
}

// ===================== EVENT LISTENERS ======================
// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing application...');
  
  // Initialize chart
  initializeChart();
  
  // Load stock data
  loadStockData();
  
  // Generate stock grid
  generateStockGrid();
  
  // Add event listeners for timeframe selection
  timeframeOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all options
      timeframeOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      this.classList.add('active');
      
      // Update timeframe and reload data
      currentTimeframe = this.dataset.days;
      loadStockData();
    });
  });
  
  // Stock selector event
  if (stockSelector) {
    stockSelector.addEventListener('click', () => {
      stockSelectorModal.style.display = 'block';
    });
  }
  
  // Close selector button event
  if (closeSelectorBtn) {
    closeSelectorBtn.addEventListener('click', () => {
      stockSelectorModal.style.display = 'none';
    });
  }
  
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginModal.style.display = 'none';
    });
  }
  
  // MFA option selection
  mfaOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      mfaOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      this.classList.add('selected');
      
      // Update MFA input label
      const method = this.dataset.method;
      const label = document.querySelector('label[for="mfaCode"]');
      
      if (label) {
        if (method === 'app') {
          label.textContent = 'Enter 6-digit code from Authenticator App';
        } else if (method === 'sms') {
          label.textContent = 'Enter 6-digit code sent to your phone';
        } else if (method === 'email') {
          label.textContent = 'Enter 6-digit code sent to your email';
        }
      }
    });
  });
  
  // Chat send button
  if (chatSendButton) {
    chatSendButton.addEventListener('click', sendChatMessage);
  }
  
  // Chat input enter key
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === stockSelectorModal) {
      stockSelectorModal.style.display = 'none';
    }
  });
  
  console.log('Application initialized');
});
