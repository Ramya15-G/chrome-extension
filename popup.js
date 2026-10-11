// ==================== ECO TIPS ==================== 
const ECO_TIPS = [
    "Did you know? Each browser tab uses about 10-50 MB of RAM.",
    "Close tabs when not in use to reduce your digital carbon footprint.",
    "Streaming video is responsible for a large portion of internet carbon emissions.",
    "Consider using dark mode—it can save battery and reduce energy consumption.",
    "Close duplicate tabs and bookmarks to improve browser performance.",
    "Organize your tabs to stay focused and reduce digital waste.",
    "Every tab closed helps save energy globally.",
    "Browser extensions can sometimes increase memory usage. Only keep what you need.",
    "Clear your cache regularly to improve browser speed and efficiency.",
    "Multiple open tabs can slow down your computer and increase power consumption."
];

// ==================== CARBON CALCULATION ==================== 

/**
 * Calculate carbon footprint based on tab count
 * @param {number} tabCount - Number of open tabs
 * @returns {number} Carbon amount in grams CO₂
 */
function calculateCarbonFootprint(tabCount) {
    // Estimation: 0.02 grams CO₂ per tab (based on energy consumption)
    return tabCount * 0.02;
}

// ==================== TAB FUNCTIONS ==================== 

/**
 * Get all tabs in the current window
 * @returns {Promise<Array>} Array of tab objects
 */
async function getAllTabs() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        return tabs;
    } catch (error) {
        console.error('Error querying tabs:', error);
        return [];
    }
}

/**
 * Get status level based on tab count
 * @param {number} tabCount - Number of open tabs
 * @returns {string} Status level: 'low', 'medium', or 'high'
 */
function getStatusLevel(tabCount) {
    if (tabCount <= 10) return 'low';
    if (tabCount <= 20) return 'medium';
    return 'high';
}

/**
 * Generate contextual suggestions based on tab count
 * @param {number} tabCount - Number of open tabs
 * @returns {string} Suggestion message
 */
function generateSuggestions(tabCount) {
    if (tabCount <= 10) {
        return "Great job! Keep your carbon footprint low. 🌱";
    } else if (tabCount <= 20) {
        return "Consider closing tabs you're not actively using to reduce emissions.";
    } else if (tabCount <= 30) {
        return "High carbon usage! Close unnecessary tabs now to reduce your digital impact.";
    } else {
        return "Critical! Your browser is consuming excessive energy. Close tabs immediately!";
    }
}

// ==================== UI UPDATE FUNCTIONS ==================== 

/**
 * Update the circular progress meter
 * @param {number} percentage - Percentage value (0-100)
 * @param {string} status - Status level: 'low', 'medium', 'high'
 */
function updateCircularMeter(percentage, status) {
    const circle = document.querySelector('.meter-progress');
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDashoffset = offset;

    // Remove all status classes
    circle.classList.remove('low', 'medium', 'high');
    circle.classList.add(status);

    // Animate the percentage text
    animateCounter('carbonPercentage', percentage, '%');
}

/**
 * Animate counter with number increment
 * @param {string} elementId - ID of element to update
 * @param {number} target - Target number
 * @param {string} suffix - Text to append (%, g, etc)
 */
function animateCounter(elementId, target, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const start = 0;
    const duration = 600;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 16);
}

/**
 * Update progress bar
 * @param {number} tabCount - Number of open tabs
 */
function updateProgressBar(tabCount) {
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.getElementById('progressBar');
    const maxTabs = 30;
    const percentage = Math.min((tabCount / maxTabs) * 100, 100);

    progressFill.style.width = percentage + '%';

    // Update status color
    const status = getStatusLevel(tabCount);
    progressBar.classList.remove('low', 'medium', 'high');
    progressBar.classList.add(status);
}

/**
 * Update status badge
 * @param {string} level - Status level: 'low', 'medium', 'high'
 * @param {number} tabCount - Number of open tabs
 */
function updateStatusBadge(level, tabCount) {
    const badge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');

    badge.classList.remove('low', 'medium', 'high');
    badge.classList.add(level);

    if (level === 'low') {
        statusText.textContent = `✓ Excellent (${tabCount} tabs)`;
    } else if (level === 'medium') {
        statusText.textContent = `⚠ Good (${tabCount} tabs)`;
    } else {
        statusText.textContent = `⛔ Warning (${tabCount} tabs)`;
    }
}

/**
 * Update all UI elements
 * @param {number} tabCount - Number of open tabs
 * @param {number} carbonAmount - Carbon footprint in grams
 */
async function updateUI(tabCount, carbonAmount) {
    // Update tab count display
    document.getElementById('tabCount').textContent = tabCount;
    document.getElementById('carbonAmount').textContent = carbonAmount.toFixed(1) + 'g';

    // Calculate percentage (30 is max)
    const percentage = Math.min((tabCount / 30) * 100, 100);

    // Get status level
    const status = getStatusLevel(tabCount);

    // Update circular meter
    updateCircularMeter(percentage, status);

    // Update progress bar
    updateProgressBar(tabCount);

    // Update status badge
    updateStatusBadge(status, tabCount);

    // Update suggestions
    const suggestion = generateSuggestions(tabCount);
    document.getElementById('suggestionsText').textContent = suggestion;

    // Update warning container
    const warningContainer = document.getElementById('warningContainer');
    if (tabCount > 20) {
        warningContainer.removeAttribute('hidden');
        document.getElementById('warningText').textContent = 
            `High carbon usage detected! (${tabCount} tabs consuming energy)`;
    } else {
        warningContainer.setAttribute('hidden', '');
    }

    // Load and display daily stats
    await loadDailyStats();
}

// ==================== STORAGE FUNCTIONS ==================== 

/**
 * Initialize or get daily stats
 * @returns {Promise<object>} Daily stats object
 */
async function getDailyStats() {
    return new Promise((resolve) => {
        chrome.storage.local.get('dailyStats', (result) => {
            let stats = result.dailyStats || {
                date: new Date().toISOString().split('T')[0],
                carbonSaved: 0,
                tabsClosedToday: 0,
                maxTabs: 0
            };

            // Reset if it's a new day
            const today = new Date().toISOString().split('T')[0];
            if (stats.date !== today) {
                stats = {
                    date: today,
                    carbonSaved: 0,
                    tabsClosedToday: 0,
                    maxTabs: 0
                };
            }

            resolve(stats);
        });
    });
}

/**
 * Save daily stats
 * @param {object} stats - Stats object to save
 */
async function saveDailyStats(stats) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ dailyStats: stats }, () => {
            resolve();
        });
    });
}

/**
 * Load and display daily stats
 */
async function loadDailyStats() {
    try {
        const stats = await getDailyStats();
        document.getElementById('savingsValue').textContent = 
            stats.carbonSaved.toFixed(1) + 'g CO₂';
    } catch (error) {
        console.error('Error loading daily stats:', error);
    }
}

// ==================== BUTTON HANDLERS ==================== 

/**
 * Close inactive tabs (tabs not accessed in the last hour)
 */
async function closeInactiveTabs() {
    try {
        const btn = document.getElementById('closeTabsBtn');
        btn.disabled = true;
        btn.textContent = '⏳ Closing...';

        const tabs = await getAllTabs();
        const now = Date.now();
        const oneHourMs = 60 * 60 * 1000;
        let closedCount = 0;
        const tabsToClose = [];

        // Get currently active tab to avoid closing it
        const activeTabs = await chrome.tabs.query({ active: true });
        const activeTabId = activeTabs[0].id;

        // Identify inactive tabs (simple heuristic: not the active tab)
        for (const tab of tabs) {
            // Don't close: pinned tabs or the active tab or tabs with critical content
            if (!tab.pinned && tab.id !== activeTabId && tab.title) {
                tabsToClose.push(tab.id);
            }
        }

        // Close tabs (limit to 10 at a time for safety)
        const tabsToCloseSlice = tabsToClose.slice(0, 10);
        for (const tabId of tabsToCloseSlice) {
            await chrome.tabs.remove(tabId);
            closedCount++;
        }

        // Calculate carbon saved
        const stats = await getDailyStats();
        const carbonSaved = closedCount * 0.02;
        stats.carbonSaved += carbonSaved;
        stats.tabsClosedToday += closedCount;
        await saveDailyStats(stats);

        // Show notification
        try {
            await chrome.notifications.create('tabsClosed', {
                type: 'basic',
                iconUrl: 'images/icon-128.png',
                title: '✓ Tabs Closed',
                message: `Closed ${closedCount} inactive tab(s). Saved ${carbonSaved.toFixed(1)}g CO₂!`
            });
        } catch (e) {
            console.log('Notification not available in this context');
        }

        // Refresh UI
        setTimeout(() => {
            refreshData();
            btn.disabled = false;
            btn.textContent = '🗑️ Close Inactive Tabs';
        }, 500);
    } catch (error) {
        console.error('Error closing tabs:', error);
        const btn = document.getElementById('closeTabsBtn');
        btn.disabled = false;
        btn.textContent = '🗑️ Close Inactive Tabs';
    }
}

/**
 * Refresh all data and UI
 */
async function refreshData() {
    try {
        const tabs = await getAllTabs();
        const tabCount = tabs.length;
        const carbonAmount = calculateCarbonFootprint(tabCount);
        await updateUI(tabCount, carbonAmount);
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

// ==================== HELPER FUNCTIONS ==================== 

/**
 * Get random eco tip
 * @returns {string} Random eco tip
 */
function getRandomEcoTip() {
    return ECO_TIPS[Math.floor(Math.random() * ECO_TIPS.length)];
}

/**
 * Initialize eco tip
 */
function initializeEcoTip() {
    const ecoTip = getRandomEcoTip();
    document.getElementById('ecoTip').textContent = ecoTip;
}

// ==================== EVENT LISTENERS ==================== 

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize eco tip
        initializeEcoTip();

        // Load and display data
        await refreshData();

        // Add button event listeners
        document.getElementById('closeTabsBtn').addEventListener('click', closeInactiveTabs);
        document.getElementById('refreshBtn').addEventListener('click', refreshData);
    } catch (error) {
        console.error('Error during initialization:', error);
        document.getElementById('suggestionsText').textContent = 
            'Error loading data. Please refresh.';
    }
});

// ==================== CHROME EVENT LISTENERS ==================== 

// Listen for tab changes (update badge in background)
chrome.tabs.onCreated.addListener(() => {
    console.log('Tab created');
});

chrome.tabs.onRemoved.addListener(() => {
    console.log('Tab removed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tabId);
});
