// ==================== CONSTANTS ==================== 
const TAB_COUNT_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const HIGH_TAB_THRESHOLD = 25;
const CARBON_PER_TAB = 0.02; // grams CO₂

// ==================== INITIALIZATION ==================== 

/**
 * Initialize the background service worker
 */
chrome.runtime.onInstalled.addListener(() => {
    console.log('Carbon Footprint Tracker installed');
    
    // Initialize storage
    chrome.storage.local.get(['dailyStats'], (result) => {
        if (!result.dailyStats) {
            const today = new Date().toISOString().split('T')[0];
            chrome.storage.local.set({
                dailyStats: {
                    date: today,
                    maxTabs: 0,
                    totalCarbon: 0,
                    tabsClosed: 0,
                    carbonSaved: 0
                }
            });
        }
    });

    // Set up alarms
    chrome.alarms.create('checkTabCount', { periodInMinutes: 5 });
    chrome.alarms.create('resetDailyStats', { periodInMinutes: 1440 }); // 24 hours
});

// ==================== TAB EVENT LISTENERS ==================== 

/**
 * Update badge when tab is created
 */
chrome.tabs.onCreated.addListener(async (tab) => {
    console.log('Tab created:', tab.id);
    await updateExtensionBadge();
    await updateDailyMaxTabs();
});

/**
 * Update badge when tab is removed
 */
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    console.log('Tab removed:', tabId);
    await updateExtensionBadge();
});

/**
 * Update badge when tab is updated
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Optionally track active tabs
    if (changeInfo.status === 'complete') {
        console.log('Tab completed loading:', tabId);
    }
});

// ==================== BADGE MANAGEMENT ==================== 

/**
 * Update the extension badge with current tab count
 */
async function updateExtensionBadge() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const tabCount = tabs.length;

        // Set badge text
        chrome.action.setBadgeText({ text: tabCount.toString() });

        // Set badge background color based on tab count
        let badgeColor;
        if (tabCount <= 10) {
            badgeColor = '#4ade80'; // Green
        } else if (tabCount <= 20) {
            badgeColor = '#fbbf24'; // Yellow
        } else {
            badgeColor = '#ef4444'; // Red
        }

        chrome.action.setBadgeBackgroundColor({ color: badgeColor });

        // Also update text color
        chrome.action.setBadgeTextColor({ color: '#ffffff' });

        console.log(`Badge updated: ${tabCount} tabs, color: ${badgeColor}`);
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// ==================== STORAGE & STATISTICS ==================== 

/**
 * Get current daily stats
 * @returns {Promise<object>} Daily stats object
 */
function getDailyStats() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['dailyStats'], (result) => {
            let stats = result.dailyStats || {
                date: new Date().toISOString().split('T')[0],
                maxTabs: 0,
                totalCarbon: 0,
                tabsClosed: 0,
                carbonSaved: 0
            };

            // Check if we need to reset for a new day
            const today = new Date().toISOString().split('T')[0];
            if (stats.date !== today) {
                stats = {
                    date: today,
                    maxTabs: 0,
                    totalCarbon: 0,
                    tabsClosed: 0,
                    carbonSaved: 0
                };
            }

            resolve(stats);
        });
    });
}

/**
 * Save daily stats
 * @param {object} stats - Stats to save
 */
function saveDailyStats(stats) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ dailyStats: stats }, () => {
            resolve();
        });
    });
}

/**
 * Update daily maximum tabs
 */
async function updateDailyMaxTabs() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const tabCount = tabs.length;
        
        const stats = await getDailyStats();
        
        // Update max tabs if current exceeds previous max
        if (tabCount > stats.maxTabs) {
            stats.maxTabs = tabCount;
            stats.totalCarbon = tabCount * CARBON_PER_TAB;
            await saveDailyStats(stats);
        }
    } catch (error) {
        console.error('Error updating daily max tabs:', error);
    }
}

/**
 * Reset daily stats at midnight
 */
async function resetDailyStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const newStats = {
            date: today,
            maxTabs: 0,
            totalCarbon: 0,
            tabsClosed: 0,
            carbonSaved: 0
        };
        
        await saveDailyStats(newStats);
        console.log('Daily stats reset for new day');
    } catch (error) {
        console.error('Error resetting daily stats:', error);
    }
}

// ==================== NOTIFICATIONS ==================== 

/**
 * Check tab count and show notification if threshold exceeded
 */
async function checkTabCountAndNotify() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const tabCount = tabs.length;

        if (tabCount > HIGH_TAB_THRESHOLD) {
            await showHighUsageAlert(tabCount);
        }
    } catch (error) {
        console.error('Error checking tab count:', error);
    }
}

/**
 * Show high usage notification
 * @param {number} tabCount - Current tab count
 */
async function showHighUsageAlert(tabCount) {
    try {
        const carbonAmount = (tabCount * CARBON_PER_TAB).toFixed(1);
        
        await chrome.notifications.create('highUsageAlert', {
            type: 'basic',
            iconUrl: 'images/icon-128.png',
            title: '🌫️ High Carbon Usage Alert',
            message: `You have ${tabCount} tabs open consuming ${carbonAmount}g CO₂. Close some tabs to reduce your digital footprint.`,
            priority: 2
        });

        console.log(`High usage alert shown: ${tabCount} tabs`);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// ==================== ALARM HANDLERS ==================== 

/**
 * Handle alarms for periodic checks
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm triggered:', alarm.name);

    if (alarm.name === 'checkTabCount') {
        // Check tab count every 5 minutes
        await checkTabCountAndNotify();
        await updateExtensionBadge();
        await updateDailyMaxTabs();
    } else if (alarm.name === 'resetDailyStats') {
        // Reset daily stats at midnight
        await resetDailyStats();
    }
});

// ==================== MESSAGE HANDLERS ==================== 

/**
 * Handle messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('Message received:', request);

    if (request.action === 'getStats') {
        const stats = await getDailyStats();
        sendResponse({ stats });
    } else if (request.action === 'updateBadge') {
        await updateExtensionBadge();
        sendResponse({ success: true });
    } else if (request.action === 'getTabCount') {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        sendResponse({ tabCount: tabs.length });
    }
});

// ==================== UTILITY FUNCTIONS ==================== 

/**
 * Get weekly history of tab usage
 */
async function getWeeklyHistory() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['weeklyHistory'], (result) => {
            const history = result.weeklyHistory || [];
            resolve(history.slice(-7)); // Return last 7 days
        });
    });
}

/**
 * Add today's stats to weekly history
 */
async function addToWeeklyHistory() {
    try {
        const stats = await getDailyStats();
        const history = await getWeeklyHistory();

        // Add today's stats if not already added
        const today = new Date().toISOString().split('T')[0];
        const existingIndex = history.findIndex(entry => entry.date === today);

        if (existingIndex >= 0) {
            history[existingIndex] = stats;
        } else {
            history.push(stats);
        }

        // Keep only last 7 days
        const recentHistory = history.slice(-7);

        return new Promise((resolve) => {
            chrome.storage.local.set({ weeklyHistory: recentHistory }, () => {
                resolve(recentHistory);
            });
        });
    } catch (error) {
        console.error('Error adding to weekly history:', error);
        return [];
    }
}

// ==================== INITIAL SETUP ==================== 

// Initial badge update when service worker starts
updateExtensionBadge();

console.log('Carbon Footprint Tracker background service worker loaded');
