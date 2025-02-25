// main.js - Core functionality for Velora Trading Platform

// Stock data from the top 50 symbols defined in fetch_data.py
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

// Generate sample stock data based on project structure
function generateStockData() {
    const stockData = {};
    
    top50Symbols.forEach(symbol => {
        // Generate random current price between $50 and $500
        const currentPrice = Math.random() * 450 + 50;
        // Generate random change between -5% and +5%
        const changePercent = (Math.random() * 10) - 5;
        const change = currentPrice * (changePercent / 100);
        const previousClose = currentPrice - change;
        
        // Generate volume (in millions)
        const volume = Math.floor(Math.random() * 90) + 10 + 'M';
        
        // Generate market cap (in billions or trillions)
        const marketCapValue = currentPrice * (Math.random() * 20 + 10);
        const marketCap = marketCapValue > 1000 ? 
            `$${(marketCapValue/1000).toFixed(2)}T` : 
            `$${marketCapValue.toFixed(2)}B`;
        
        // Determine recommendation based on changePercent
        let recommendation;
        if (changePercent > 2) {
            recommendation = 'BUY';
        } else if (changePercent < -2) {
            recommendation = 'SELL';
        } else {
            recommendation = 'HOLD';
        }
        
        // Generate predictions for next 3 days
        const predictions = [];
        let nextPrice = currentPrice;
        
        for (let i = 1; i <= 3; i++) {
            // Each day's prediction adds 0-3% to previous day
            const dailyChange = (Math.random() * 3);
            nextPrice = nextPrice * (1 + (dailyChange / 100));
            
            // Confidence decreases as we predict further into the future
            const confidence = Math.floor(95 - (i * 7) + (Math.random() * 10));
            
            predictions.push({
                day: i,
                price: nextPrice,
                confidence: confidence
            });
        }
        
        // Generate 30 days of historical data
        const historical = [];
        let historicalDate = new Date();
        historicalDate.setDate(historicalDate.getDate() - 30);
        
        let price = previousClose;
        for (let i = 0; i < 30; i++) {
            // Create date string
            const dateString = historicalDate.toISOString().split('T')[0];
            
            // Small random change for previous day
            price = price * (1 + ((Math.random() * 4) - 2) / 100);
            
            historical.push({
                date: dateString,
                price: price
            });
            
            // Move to next day
            historicalDate.setDate(historicalDate.getDate() + 1);
        }
        
        // Sort historical data by date
        historical.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Add to stock data
        stockData[symbol] = {
            name: companyNames[symbol],
            currentPrice: currentPrice,
            previousClose: previousClose,
            change: change,
            changePercent: changePercent,
            volume: volume,
            marketCap: marketCap,
            recommendation: recommendation,
            predictions: predictions,
            historical: historical
        };
    });
    
    return stockData;
}

// Generate stock data
const stockData = generateStockData();

// Current selected stock
let currentStock = 'AAPL';
let stockChart = null;
let timeframeInDays = 30;

// Initialize the chart
function initializeChart() {
    const ctx = document.getElementById('stockChartCanvas').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Will be populated with dates
            datasets: [
                {
                    label: 'Historical Price',
                    data: [], // Will be populated with historical prices
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Predicted Price',
                    data: [], // Will be populated with predicted prices
                    borderColor: '#6c38cc',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    tension: 0.2,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                }
            }
        }
    });
}

// Update the chart with stock data
function updateChart(stockSymbol, timeframe) {
    if (!stockChart) {
        initializeChart();
    }

    const stock = stockData[stockSymbol];
    if (!stock) {
        console.error('Stock data not found for:', stockSymbol);
        return;
    }

    // Show loading state
    document.getElementById('chartLoading').style.display = 'flex';
    
    // Simulate API call delay
    setTimeout(() => {
        // Update stock details
        document.getElementById('currentPrice').textContent = `$${stock.currentPrice.toFixed(2)}`;
        const changeElement = document.getElementById('priceChange');
        changeElement.textContent = `${stock.change > 0 ? '+' : ''}$${stock.change.toFixed(2)} (${stock.changePercent.toFixed(1)}%)`;
        changeElement.className = stock.change >= 0 ? 'metric-value price-up' : 'metric-value price-down';
        
        document.getElementById('volume').textContent = stock.volume;
        document.getElementById('marketCap').textContent = stock.marketCap;
        
        // Update recommendation
        const recommendationElement = document.getElementById('recommendation');
        recommendationElement.textContent = stock.recommendation;
        recommendationElement.className = `recommendation ${stock.recommendation.toLowerCase()}`;
        
        // Update predictions
        for (let i = 0; i < 3; i++) {
            if (stock.predictions[i]) {
                document.getElementById(`day${i+1}Price`).textContent = `$${stock.predictions[i].price.toFixed(2)}`;
                document.getElementById(`day${i+1}Confidence`).textContent = `${stock.predictions[i].confidence}%`;
                document.getElementById(`day${i+1}ConfidenceBar`).style.width = `${stock.predictions[i].confidence}%`;
            }
        }
        
        // Get historical data
        const filteredData = stock.historical;
        
        // Prepare chart data
        const labels = filteredData.map(item => item.date);
        const prices = filteredData.map(item => item.price);
        
        // Create prediction data - extend 3 days into the future
        const lastDate = new Date(labels[labels.length - 1]);
        const predictionLabels = [];
        const predictionData = new Array(labels.length).fill(null); // null for historical dates
        
        // Add prediction points for future dates
        for (let i = 1; i <= 3; i++) {
            const newDate = new Date(lastDate);
            newDate.setDate(lastDate.getDate() + i);
            const dateString = newDate.toISOString().split('T')[0];
            predictionLabels.push(dateString);
            predictionData.push(stock.predictions[i-1].price);
        }
        
        // Update chart data
        stockChart.data.labels = [...labels, ...predictionLabels];
        stockChart.data.datasets[0].data = [...prices, ...new Array(3).fill(null)]; // null for future dates
        stockChart.data.datasets[1].data = predictionData;
        stockChart.update();
        
        // Hide loading state
        document.getElementById('chartLoading').style.display = 'none';
    }, 1000); // Simulated 1-second delay
}

// Predefined responses for the AI chatbot
const botResponses = {
    buy: "Based on our LSTM model's analysis, this stock is marked as a 'Buy' due to three key factors:<br><br>1. Recent positive earnings report showing growth above expectations<br>2. Increased trading volume indicating strong market interest<br>3. Positive momentum with the stock trading above its 50-day moving average<br><br>The prediction has a high confidence score based on historical accuracy for this stock.",
    sell: "Our model suggests a 'Sell' recommendation based on:<br><br>1. Technical indicators showing overbought conditions<br>2. Recent negative earnings surprise<br>3. Decreasing volume on price increases, suggesting weakening momentum<br><br>The confidence score for this prediction is moderate, as the stock shows mixed signals.",
    hold: "The 'Hold' recommendation comes from our LSTM model analyzing:<br><br>1. Stable price action within a defined range<br>2. Average trading volume without significant changes<br>3. Mixed technical indicators not showing a clear direction<br><br>The model has moderate confidence in this prediction due to the mixed signals.",
    general: "I can help with understanding stock predictions, market analysis, and trading strategies. Just ask specific questions about stocks or predictions you see here!"
};

// Questions for the learning quiz
const quizQuestions = [
    {
        question: "What had the highest impact on this stock's 'Buy' recommendation?",
        options: ["Market sentiment", "Recent earnings report", "Trading volume", "Technical indicators"],
        correctAnswer: 1
    },
    {
        question: "Which model is used for the price predictions?",
        options: ["Random Forest", "LSTM neural network", "Linear Regression", "Moving Average"],
        correctAnswer: 1
    },
    {
        question: "What does a high confidence score mean?",
        options: ["The stock will definitely increase", "Historical predictions were accurate", "Many analysts agree", "The model is certain"],
        correctAnswer: 1
    },
    {
        question: "What data is used to train the prediction model?",
        options: ["Only price data", "Price, volume and technical indicators", "News headlines", "Social media sentiment"],
        correctAnswer: 1
    }
];

// Current quiz question
let currentQuiz = null;

// Add a message to the chat
function addMessage(text, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = text;
    
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Display a quiz question
function showQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    currentQuiz = quizQuestions[randomIndex];
    
    document.getElementById('quizQuestion').textContent = currentQuiz.question;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    currentQuiz.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.dataset.index = index;
        optionDiv.addEventListener('click', selectQuizOption);
        optionsContainer.appendChild(optionDiv);
    });
    
    quizContainer.style.display = 'block';
}

// Handle quiz option selection
function selectQuizOption(event) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => option.classList.remove('selected'));
    
    event.target.classList.add('selected');
}

// Process the user's chat message
function processMessage(message) {
    let response = botResponses.general;
    
    // Simple keyword matching
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('buy') || lowerMessage.includes('why buy')) {
        response = botResponses.buy;
        // Show a quiz after responding about "buy"
        setTimeout(showQuiz, 1000);
    } else if (lowerMessage.includes('sell') || lowerMessage.includes('why sell')) {
        response = botResponses.sell;
    } else if (lowerMessage.includes('hold') || lowerMessage.includes('why hold')) {
        response = botResponses.hold;
    } else if (lowerMessage.includes('how') && lowerMessage.includes('prediction')) {
        response = "Our predictions use Long Short-Term Memory (LSTM) neural networks, a type of recurrent neural network well-suited for time series forecasting. The model analyzes historical price patterns, trading volumes, and technical indicators to identify trends and make future price predictions.";
    } else if (lowerMessage.includes(currentStock.toLowerCase())) {
        response = `${currentStock} (${companyNames[currentStock]}) is currently showing a ${stockData[currentStock].recommendation} recommendation based on our LSTM model analysis. The model has a confidence level of ${stockData[currentStock].predictions[0].confidence}% for tomorrow's prediction.`;
    }
    
    return response;
}

// Submit the quiz answer
function submitQuizAnswer() {
    const selectedOption = document.querySelector('.quiz-option.selected');
    if (!selectedOption) {
        alert('Please select an answer');
        return;
    }
    
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const isCorrect = selectedIndex === currentQuiz.correctAnswer;
    
    // Hide quiz container
    document.getElementById('quizContainer').style.display = 'none';
    
    // Add feedback message
    if (isCorrect) {
        addMessage("Correct! You've earned 10 points. Your understanding of our prediction model is improving.", false);
    } else {
        addMessage(`Not quite. The correct answer is: ${currentQuiz.options[currentQuiz.correctAnswer]}. Keep learning!`, false);
    }
}

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

// Handle MFA selection
function selectMFAMethod(method) {
    const options = document.querySelectorAll('.mfa-option');
    options.forEach(option => option.classList.remove('selected'));
    
    const selectedOption = document.querySelector(`.mfa-option[data-method="${method}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        
        // Update MFA input label
        const label = document.querySelector('label[for="mfaCode"]');
        if (method === 'app') {
            label.textContent = 'Enter 6-digit code from Authenticator App';
        } else if (method === 'sms') {
            label.textContent = 'Enter 6-digit code sent to your phone';
        } else if (method === 'email') {
            label.textContent = 'Enter 6-digit code sent to your email';
        }
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mfaCode = document.getElementById('mfaCode').value;
    
    if (!email || !password || !mfaCode) {
        alert('Please fill in all fields');
        return;
    }
    
    // In a real app, you would call your API for authentication
    // For this demo, just close the modal and proceed
    document.getElementById('loginModal').style.display = 'none';
}

// Show stock selector modal
function showStockSelector() {
    // Populate the stock grid
    const stockGrid = document.getElementById('stockGrid');
    stockGrid.innerHTML = '';
    
    Object.keys(stockData).forEach(symbol => {
        const stockCard = document.createElement('div');
        stockCard.className = `stock-card ${symbol === currentStock ? 'selected' : ''}`;
        stockCard.innerHTML = `
            <div class="stock-name">${symbol}</div>
            <div class="stock-details">${stockData[symbol].name}</div>
        `;
        stockCard.addEventListener('click', () => selectStock(symbol));
        stockGrid.appendChild(stockCard);
    });
    
    document.getElementById('stockSelectorModal').style.display = 'block';
}

// Select a stock
function selectStock(symbol) {
    currentStock = symbol;
    document.getElementById('stockSelectorModal').style.display = 'none';
    updateChart(currentStock, timeframeInDays);
}

// Update watchlist items
function updateWatchlist() {
    const watchlistContainer = document.querySelector('.stock-list');
    watchlistContainer.innerHTML = '';
    
    // Create a watchlist of 5 random stocks
    const watchlistStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    
    watchlistStocks.forEach(symbol => {
        const stock = stockData[symbol];
        if (!stock) return;
        
        const listItem = document.createElement('li');
        listItem.className = 'stock-item';
        listItem.innerHTML = `
            <div class="stock-info">
                <div class="stock-name">${symbol}</div>
                <div class="stock-details">${stock.name}</div>
            </div>
            <div class="stock-price">
                <div class="price-value">$${stock.currentPrice.toFixed(2)}</div>
                <div class="price-change ${stock.change >= 0 ? 'price-up' : 'price-down'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(1)}%
                </div>
            </div>
        `;
        
        listItem.addEventListener('click', () => {
            currentStock = symbol;
            updateChart(currentStock, timeframeInDays);
        });
        
        watchlistContainer.appendChild(listItem);
    });
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chart with default stock
    initializeChart();
    updateChart(currentStock, timeframeInDays);
    
    // Update watchlist
    updateWatchlist();
    
    // Set up timeframe selector
    const timeframeOptions = document.querySelectorAll('.timeframe-option');
    timeframeOptions.forEach(option => {
        option.addEventListener('click', function() {
            timeframeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            timeframeInDays = this.dataset.days === 'max' ? 'max' : parseInt(this.dataset.days);
            updateChart(currentStock, timeframeInDays);
        });
    });
    
    // Set up stock selector
    document.getElementById('stockSelector').addEventListener('click', showStockSelector);
    document.getElementById('closeSelectorBtn').addEventListener('click', function() {
        document.getElementById('stockSelectorModal').style.display = 'none';
    });
    
    // Set up chat input
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            
            // Process message and get response
            setTimeout(() => {
                const response = processMessage(message);
                addMessage(response, false);
            }, 500);
        }
    }
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    // Set up quiz submit button
    document.querySelector('.quiz-submit').addEventListener('click', submitQuizAnswer);
    
    // Set up MFA options
    const mfaOptions = document.querySelectorAll('.mfa-option');
    mfaOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectMFAMethod(this.dataset.method);
        });
    });
    
    // Set up login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // User icon click should show login
    document.getElementById('userIcon').addEventListener('click', showLoginModal);
});
