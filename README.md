# Carbon Footprint Tracker - Chrome Extension

A production-ready Chrome extension that tracks your digital carbon footprint based on open browser tabs and helps you reduce unnecessary energy consumption.

## Features

✨ **Real-time Tab Monitoring**
- Live tracking of open tabs with carbon footprint calculation
- Visual indicators (🟢 Good, 🟡 Medium, 🔴 High)
- Animated circular progress meter

🌫️ **Carbon Footprint Calculation**
- Calculates CO₂ emissions based on tab count (0.02g per tab)
- Real-time updates as tabs open/close
- Daily statistics and carbon savings tracking

🗑️ **Smart Tab Management**
- Close inactive tabs with one click
- Automatic carbon savings calculation
- Notification system for high usage alerts

📊 **Analytics & Insights**
- Daily stats with maximum tab count
- Carbon savings tracker
- Eco-tips that rotate on each popup open
- Weekly history of tab usage

🎨 **Modern UI/UX**
- Dark theme with glassmorphism effects
- Smooth animations and transitions
- Responsive design
- Light theme support (respects system preferences)

## Project Structure

```
carbon-footprint-tracker/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html             # Popup UI structure
├── popup.js               # Popup logic and interactions
├── styles.css             # Comprehensive styling with animations
├── background.js          # Service worker for tab monitoring
├── images/                # Icon folder (see Icon Setup below)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md              # This file
```

## Installation & Setup

### Step 1: Prepare Icons

You need to create or add three PNG icons to the `images/` folder:

- **icon-16.png** - 16x16 pixels (browser toolbar)
- **icon-48.png** - 48x48 pixels (extension list)
- **icon-128.png** - 128x128 pixels (Chrome Web Store)

**Option A: Create Simple Icons**
1. Create new 16x16, 48x48, and 128x128 PNG images
2. Add a green earth emoji or carbon footprint design
3. Save them in the `images/` folder

**Option B: Use Online Generator**
- Visit https://convertio.co/ to convert emoji to PNG
- Or https://favicon-generator.org/ for quick icon generation

**Option C: Temporary Placeholder**
For testing without real icons, you can temporarily use:
```javascript
// In manifest.json, you can comment out icon references during testing
```

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `carbon-footprint-tracker/` folder
5. The extension should now appear in your extensions list

### Step 3: Pin to Toolbar (Optional)

1. Click the **Extensions** menu in Chrome
2. Find "Carbon Footprint Tracker"
3. Click the **pin icon** to add to your toolbar

## Usage

### Main Popup Features

**📊 Circular Progress Meter**
- Visual representation of carbon usage percentage
- Changes color based on tab count:
  - 🟢 Green (0-10 tabs)
  - 🟡 Yellow (11-20 tabs)
  - 🔴 Red (21+ tabs with warning effects)

**📑 Tab Count Display**
- Shows current number of open tabs
- Real-time updates

**🌫️ CO₂ Amount**
- Displays calculated carbon footprint in grams
- Updates automatically as tabs change

**💡 Recommendations**
- Dynamic suggestions based on tab usage
- Helpful eco-tips

**🗑️ Close Inactive Tabs**
- Closes up to 10 inactive tabs at once
- Shows notification with carbon saved
- Updates daily savings statistics

**🔄 Refresh Data**
- Manually refresh all statistics
- Re-query tab count from browser

**📊 Daily Stats**
- Today's total carbon savings
- Tabs closed counter
- Persistent tracking across sessions

## How It Works

### Carbon Calculation
- Formula: `tab_count × 0.02g CO₂`
- Each open tab consumes approximately 10-50 MB of RAM
- This translates to approximately 0.02g CO₂ per tab per hour

### Tab Monitoring
The background service worker monitors:
- Tab creation events
- Tab removal events
- Tab update events

### Daily Statistics
- Tracks maximum tabs open today
- Calculates total carbon generated
- Records tabs closed and carbon saved
- Automatically resets at midnight

### Notifications
- Shows alert when tabs exceed 25
- Displays when tabs are successfully closed
- Provides actionable recommendations

## Configuration Files

### manifest.json
- Manifest V3 configuration
- Permissions: tabs, storage, alarms, notifications
- Host: all URLs

### styles.css
- 1000+ lines of production-ready CSS
- CSS variables for theming
- Smooth animations and transitions
- Glassmorphism effects
- Responsive design
- Light/dark theme support

### popup.js
- Core calculation functions
- UI update logic
- Chrome storage API integration
- Event handlers for buttons
- Tab management functions

### background.js
- Service worker implementation
- Tab event listeners
- Badge management
- Alarm scheduling
- Statistics tracking
- Notification system

## Chrome APIs Used

```javascript
chrome.tabs.query()           // Get tab information
chrome.tabs.remove()          // Close tabs
chrome.tabs.onCreated          // Listen for new tabs
chrome.tabs.onRemoved          // Listen for removed tabs
chrome.tabs.onUpdated          // Listen for tab updates
chrome.action.setBadgeText()   // Update extension badge
chrome.action.setBadgeBackgroundColor() // Badge styling
chrome.storage.local.get/set() // Persistent storage
chrome.alarms.create()         // Schedule periodic checks
chrome.notifications.create()  // Show notifications
chrome.runtime.onMessage       // Inter-script communication
```

## Browser Support

- Chrome 90+
- Chromium-based browsers (Edge, Brave, Vivaldi, etc.)
- Requires Manifest V3 support

## Performance Considerations

- Lightweight service worker (no constant polling)
- Efficient event-driven architecture
- Minimal memory footprint
- Smooth 60fps animations with CSS
- Lazy-loaded statistics

## Troubleshooting

### Extension Won't Load
- Verify all files are in the correct folder structure
- Check manifest.json for syntax errors
- Ensure no icon files are corrupted

### Badge Not Showing
- Enable the extension (toggle on the extensions page)
- Pin the extension to your toolbar
- Refresh Chrome

### Notifications Not Appearing
- Check your system notification settings
- Ensure Chrome has permission to send notifications
- May not work in all contexts (web_accessible_resources)

### Storage Not Persisting
- Clear Chrome extension data: chrome://extensions/ → Details → Storage
- Remove and reload the extension
- Check for storage quota limits

## Development & Customization

### Modify Carbon Calculation
Edit `popup.js` and `background.js`:
```javascript
const CARBON_PER_TAB = 0.02; // Change this value
```

### Customize Theme Colors
Edit `styles.css`:
```css
:root {
    --status-low: #4ade80;     /* Green */
    --status-medium: #fbbf24;  /* Yellow */
    --status-high: #ef4444;    /* Red */
}
```

### Add More Eco Tips
Edit `popup.js` ECO_TIPS array:
```javascript
const ECO_TIPS = [
    "Your custom tip here...",
    // Add more tips
];
```

## Data Privacy

- ✅ No data sent to external servers
- ✅ All data stored locally in your browser
- ✅ No tracking or analytics
- ✅ Open source and auditable

## Future Enhancements

Potential features to add:
- Historical data visualization (charts)
- Browser sync across devices
- Custom carbon calculation models
- Tab category analysis
- Export stats as CSV
- Leaderboard/challenges
- Integration with carbon offset services

## License

This extension is provided as-is for educational and personal use.

## Support & Issues

For issues or suggestions:
1. Check the troubleshooting section above
2. Verify the manifest.json syntax
3. Check browser console for errors (F12 → Console)
4. Review Chrome extension documentation at https://developer.chrome.com/docs/extensions/

---

**Made with 🌍 for a sustainable digital future**

Every closed tab helps reduce global digital carbon emissions!
