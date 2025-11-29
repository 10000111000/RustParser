const COLORS = [
    '#b0a513',
    '#6c757d',
    '#39c364',
    '#2d3033',
    '#b0a513',
    '#005cb0',
    '#9370db',
    '#b00000',
    '#8ee6fd',
    '#b07400',
    '#00248e'
];

function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '--';
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: amount < 1 ? 4 : 2,
    });
    return formatter.format(amount);
}

function calculateAndRenderMarketCap(coins) {
    const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    document.getElementById('total-market-cap').innerText = formatCurrency(totalMarketCap);

    const distributionContainer = document.getElementById('market-cap-distribution');
    distributionContainer.innerHTML = '';

    let colorIndex = 0;
    coins.forEach(coin => {
        const cap = coin.market_cap || 0;
        if (cap === 0) return;
        const percentage = (cap / totalMarketCap) * 100;

        if (percentage < 0.5) return; // Skip very small segments

        const segment = document.createElement('div');
        segment.className = 'market-cap-segment';
        segment.style.width = `${percentage.toFixed(2)}%`;
        segment.style.backgroundColor = COLORS[colorIndex % COLORS.length];

        const label = `${coin.symbol.toUpperCase()} (${percentage.toFixed(1)}%)`;
        segment.setAttribute('data-label', label);

        distributionContainer.appendChild(segment);
        colorIndex++;
    });
}

function renderPriceRange(coin, card) {
    const current = coin.current_price;
    const high = coin.high_24h || current;
    const low = coin.low_24h || current;

    const rangeContainer = document.createElement('div');
    rangeContainer.className = 'price-range-container';

    // Calculate position
    let position = 0;
    if (high !== low) {
        position = ((current - low) / (high - low)) * 100;
    }

    // Ensure it stays within bounds (0 to 100)
    position = Math.max(0, Math.min(100, position));

    rangeContainer.innerHTML = `
        <p class="symbol" style="margin-bottom: 10px;">24h Range: ${formatCurrency(low)} (Low) - ${formatCurrency(high)} (High)</p>
        <div class="price-range-bar">
            <div class="price-indicator" style="left: ${position.toFixed(2)}%;"></div>
        </div>
    `;
    card.appendChild(rangeContainer);
}

async function fetchData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();

        updateInterface(data);
    } catch (error) {
        document.getElementById('last-update').innerText = "CONNECTION LOST - RETRYING...";
    }
}

function updateInterface(data) {
    const statusEl = document.getElementById('market-status');
    statusEl.innerText = data.market_status;
    statusEl.className = `status-badge ${data.market_status.toLowerCase()}`;

    document.getElementById('last-update').innerText = `UPDATED: ${data.timestamp}`;

    const container = document.getElementById('crypto-container');
    container.innerHTML = '';

    let topGainer = { p: -9999, s: '' };
    let topLoser = { p: 9999, s: '' };

    calculateAndRenderMarketCap(data.coins);

    data.coins.forEach(coin => {
        const change = coin.price_change_percentage_24h || 0;
        const isUp = change >= 0;
        const changeClass = isUp ? 'price-up' : 'price-down';
        const sign = isUp ? '+' : '';

        if (change > topGainer.p) topGainer = { p: change, s: `${coin.symbol.toUpperCase()} ${sign}${change.toFixed(2)}%` };
        if (change < topLoser.p) topLoser = { p: change, s: `${coin.symbol.toUpperCase()} ${sign}${change.toFixed(2)}%` };

        const card = document.createElement('div');
        card.className = `crypto-card ${changeClass}`;
        card.innerHTML = `
            <div class="row">
                <span style="font-weight:bold">${coin.name}</span>
                <span class="symbol">${coin.symbol.toUpperCase()}</span>
            </div>
            <div class="row" style="margin-top:10px">
                <span class="price">${formatCurrency(coin.current_price)}</span>
            </div>
            <div class="row">
                <span class="symbol">24h Change</span>
                <span style="font-weight:bold">${sign}${change.toFixed(2)}%</span>
            </div>
        `;

        renderPriceRange(coin, card); // Add range visualization to card

        container.appendChild(card);
    });

    document.querySelector('#top-gainer h2').innerText = topGainer.s;
    document.querySelector('#top-loser h2').innerText = topLoser.s;
}

fetchData();
setInterval(fetchData, 10000);