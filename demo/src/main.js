// Import from the built package
import { DiscordActivityClient, filterDuplicateSpotifyActivities, getActivityTypeLabel, parseImageUrl, detectMusicService, calculateProgress, getAvatarUrl, getDisplayName } from '../../dist/index.mjs';

// Default user ID - you can change this to test with different users
const DEFAULT_USER_ID = '743173584935190620';

// Get elements
const connectionStatus = document.getElementById('connection-status');
const activityContent = document.getElementById('activity-content');

// Create client
const client = new DiscordActivityClient({
  userId: DEFAULT_USER_ID,
  onConnect: () => {
    updateConnectionStatus(true);
  },
  onDisconnect: () => {
    updateConnectionStatus(false);
  },
  onError: (error) => {
    console.error('Connection error:', error);
    showError(error.message);
  }
});

// Store current state for progress bar updates
let currentState = null;

// Subscribe to state changes
client.subscribe((state) => {
  console.log('State updated:', state);
  currentState = state;
  
  if (state.isLoading) {
    showLoading();
    return;
  }

  if (state.error) {
    showError(state.error.message);
    return;
  }

  if (state.data) {
    renderActivity(state.data);
  }
});

// Update connection status badge
function updateConnectionStatus(connected) {
  if (connected) {
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'status-badge connected';
  } else {
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.className = 'status-badge disconnected';
  }
}

// Show loading state
function showLoading() {
  connectionStatus.textContent = 'Connecting...';
  connectionStatus.className = 'status-badge connecting';
  
  activityContent.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading Discord activity...</p>
    </div>
  `;
}

// Show error state
function showError(message) {
  activityContent.innerHTML = `
    <div class="error-state">
      <h3>Connection Error</h3>
      <p>${message}</p>
      <button class="retry-btn" onclick="window.location.reload()">Retry Connection</button>
    </div>
  `;
}

// Render activity data
function renderActivity(data) {
  const {
    discord_user,
    discord_status,
    activities,
    listening_to_spotify,
    spotify
  } = data;

  // Filter duplicate Spotify activities
  const filteredActivities = filterDuplicateSpotifyActivities(activities, listening_to_spotify);

  let html = '';

  // Profile section
  html += `
    <div class="profile-section">
      <div class="avatar-wrapper">
        <img 
          src="${getAvatarUrl(discord_user.id, discord_user.avatar, discord_user.discriminator)}" 
          alt="${discord_user.username}" 
          class="avatar"
        />
        <div class="status-dot ${discord_status}"></div>
      </div>
      <div class="user-info">
        <h2>${getDisplayName(discord_user.global_name, discord_user.username)}</h2>
        <p class="username">@${discord_user.username}</p>
        <span class="status-text ${discord_status}">${discord_status}</span>
      </div>
    </div>
  `;

  // Activities section
  if (listening_to_spotify && spotify) {
    html += renderSpotifyActivity(spotify);
  }

  if (filteredActivities.length > 0) {
    html += '<div class="activities-section">';
    html += '<h3>Current Activities</h3>';
    
    filteredActivities.forEach(activity => {
      html += renderActivityCard(activity);
    });
    
    html += '</div>';
  }

  // No activity state
  if (!listening_to_spotify && filteredActivities.length === 0) {
    html += `
      <div class="no-activity">
        <p>No current activity</p>
      </div>
    `;
  }

  activityContent.innerHTML = html;
  
  // Update progress bars if needed
  updateProgressBars(spotify, filteredActivities);
}

// Render Spotify activity
function renderSpotifyActivity(spotify) {
  const progress = calculateProgress(spotify.timestamps?.start, spotify.timestamps?.end);
  
  return `
    <div class="activities-section">
      <h3>Listening to Spotify</h3>
      <div class="activity-card spotify">
        <div class="activity-header">
          <span class="activity-type">Listening to</span>
          <div class="service-badge">
            <img src="https://open.spotify.com/favicon.ico" alt="Spotify" class="service-icon" />
            <span>Spotify</span>
          </div>
        </div>
        <div class="activity-content">
          <img src="${spotify.album_art_url}" alt="${spotify.album}" class="activity-image" />
          <div class="activity-details">
            <div class="activity-name">${spotify.song}</div>
            <div class="activity-description">${spotify.artist}</div>
            <div class="activity-state">${spotify.album}</div>
            <div class="progress-bar">
              <div class="progress-fill" data-progress-spotify style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render regular activity
function renderActivityCard(activity) {
  const musicService = detectMusicService(activity);
  const activityTypeLabel = getActivityTypeLabel(activity.type);
  
  let imageUrl = '';
  if (activity.assets?.large_image) {
    imageUrl = parseImageUrl(activity.assets.large_image, activity);
  }

  const progress = calculateProgress(activity.timestamps?.start, activity.timestamps?.end);
  const hasProgress = activity.timestamps?.start && activity.timestamps?.end;

  return `
    <div class="activity-card">
      <div class="activity-header">
        <span class="activity-type">${activityTypeLabel}</span>
        ${musicService ? `
          <div class="service-badge">
            <img src="${musicService.icon}" alt="${musicService.name}" class="service-icon" />
            <span>${musicService.name}</span>
          </div>
        ` : ''}
      </div>
      <div class="activity-content">
        ${imageUrl ? `<img src="${imageUrl}" alt="${activity.name}" class="activity-image" />` : ''}
        <div class="activity-details">
          <div class="activity-name">${activity.name}</div>
          ${activity.details ? `<div class="activity-description">${activity.details}</div>` : ''}
          ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
          ${hasProgress ? `
            <div class="progress-bar">
              <div class="progress-fill" data-progress-activity="${activity.id}" style="width: ${progress}%"></div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Update progress bars periodically
function updateProgressBars(spotify, activities) {
  // Update Spotify progress
  if (spotify && spotify.timestamps?.start && spotify.timestamps?.end) {
    const spotifyProgress = document.querySelector('[data-progress-spotify]');
    if (spotifyProgress) {
      const progress = calculateProgress(spotify.timestamps.start, spotify.timestamps.end);
      // Only update if difference is significant to avoid jitter
      const currentWidth = parseFloat(spotifyProgress.style.width) || 0;
      if (Math.abs(progress - currentWidth) > 0.1) {
        spotifyProgress.style.width = `${progress}%`;
      }
    }
  }

  // Update activity progress bars
  activities.forEach(activity => {
    if (activity.timestamps?.start && activity.timestamps?.end) {
      const activityProgress = document.querySelector(`[data-progress-activity="${activity.id}"]`);
      if (activityProgress) {
        const progress = calculateProgress(activity.timestamps.start, activity.timestamps.end);
        // Only update if difference is significant to avoid jitter
        const currentWidth = parseFloat(activityProgress.style.width) || 0;
        if (Math.abs(progress - currentWidth) > 0.1) {
          activityProgress.style.width = `${progress}%`;
        }
      }
    }
  });
}

// Set up real-time progress bar updates
setInterval(() => {
  if (currentState && !currentState.isLoading && currentState.data) {
    const { listening_to_spotify, spotify, activities } = currentState.data;
    const filteredActivities = filterDuplicateSpotifyActivities(activities, listening_to_spotify);
    updateProgressBars(spotify, filteredActivities);
  }
}, 1000); // Update every second

// Initialize Highlight.js
document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
});

// Copy button functionality
const copyButtons = document.querySelectorAll('.copy-btn');
copyButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetPanel = btn.dataset.copy;
    let textToCopy;

    // Handle install button differently
    if (targetPanel === 'install-npm') {
      const codeBlock = btn.parentElement.querySelector('code');
      textToCopy = codeBlock.textContent;
    } else {
      const codePanel = document.querySelector(`[data-panel="${targetPanel}"]`);
      const codeBlock = codePanel.querySelector('code');
      textToCopy = codeBlock.textContent;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Update button state
      const originalHTML = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
      `;
      
      // Reset after 2 seconds
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalHTML;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
});

// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
const codePanels = document.querySelectorAll('.code-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    
    // Update buttons
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update panels
    codePanels.forEach(panel => {
      if (panel.dataset.panel === targetTab) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  });
});

// Connect to Discord
console.log('Connecting to Discord...');
client.connect();
