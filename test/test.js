import { DiscordActivityClient } from '../dist/index.mjs';
import { 
    getActivityTypeLabel, 
    parseImageUrl, 
    detectMusicService,
    calculateProgress,
    getAvatarUrl,
    getDisplayName,
    getMostRelevantActivity 
} from '../dist/index.mjs';

// Configuration - CHANGE THIS TO YOUR DISCORD USER ID
const DISCORD_USER_ID = '743173584935190620';

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorContainerEl = document.getElementById('error-container');
const errorMessageEl = document.getElementById('error-message');
const retryButtonEl = document.getElementById('retry-button');
const contentEl = document.getElementById('content');
const avatarEl = document.getElementById('avatar');
const usernameEl = document.getElementById('username');
const discriminatorEl = document.getElementById('discriminator');
const statusBadgeEl = document.getElementById('status-badge');
const statusTextEl = document.getElementById('status-text');
const activitiesEl = document.getElementById('activities');
const connectionStatusEl = document.getElementById('connection-status');

// Progress tracking for activities
let progressIntervals = {};

// Create the Discord Activity Client
const client = new DiscordActivityClient({
    userId: DISCORD_USER_ID,
    maxReconnectAttempts: 5,
    autoReconnect: true,
    onConnect: () => {
        console.log('✅ Connected to Lanyard');
    },
    onDisconnect: () => {
        console.log('❌ Disconnected from Lanyard');
    },
    onError: (error) => {
        console.error('❌ Error:', error);
    },
    onPresenceUpdate: (data) => {
        console.log('🔄 Presence updated:', data);
    }
});

// Subscribe to state changes
client.subscribe((state) => {
    console.log('State update:', state);

    // Update connection status
    updateConnectionStatus(state.isConnected);

    // Handle loading state
    if (state.isLoading) {
        showLoading();
        return;
    }

    // Handle error state
    if (state.error) {
        showError(state.error.message);
        return;
    }

    // Handle data
    if (state.data) {
        hideLoading();
        hideError();
        renderProfile(state.data);
        renderActivities(state.data);
        showContent();
    }
});

// Show/Hide functions
function showLoading() {
    loadingEl?.classList.remove('hidden');
    errorContainerEl?.classList.add('hidden');
    contentEl?.classList.add('hidden');
}

function hideLoading() {
    loadingEl?.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    contentEl?.classList.add('hidden');
    errorContainerEl?.classList.remove('hidden');
    if (errorMessageEl) {
        errorMessageEl.textContent = message;
    }
}

function hideError() {
    errorContainerEl?.classList.add('hidden');
}

function showContent() {
    contentEl?.classList.remove('hidden');
}

function updateConnectionStatus(isConnected) {
    if (connectionStatusEl) {
        if (isConnected) {
            connectionStatusEl.classList.add('connected');
            connectionStatusEl.classList.remove('disconnected');
            connectionStatusEl.innerHTML = '<span>●</span><span>Connected</span>';
        } else {
            connectionStatusEl.classList.add('disconnected');
            connectionStatusEl.classList.remove('connected');
            connectionStatusEl.innerHTML = '<span>○</span><span>Disconnected</span>';
        }
    }
}

// Render profile information
function renderProfile(data) {
    const { discord_user, discord_status } = data;

    // Avatar
    if (avatarEl) {
        avatarEl.src = getAvatarUrl(
            discord_user.id, 
            discord_user.avatar, 
            discord_user.discriminator
        );
        avatarEl.alt = discord_user.username;
    }

    // Username
    if (usernameEl) {
        usernameEl.textContent = getDisplayName(
            discord_user.global_name,
            discord_user.username
        );
    }

    // Discriminator
    if (discriminatorEl) {
        if (discord_user.discriminator && discord_user.discriminator !== '0') {
            discriminatorEl.textContent = `${discord_user.username}#${discord_user.discriminator}`;
        } else {
            discriminatorEl.textContent = `@${discord_user.username}`;
        }
    }

    // Status
    if (statusBadgeEl && statusTextEl) {
        statusBadgeEl.className = `status-badge ${discord_status}`;
        statusTextEl.textContent = discord_status;
    }
}

// Render activities
function renderActivities(data) {
    if (!activitiesEl) return;

    // Clear existing progress intervals
    Object.values(progressIntervals).forEach(interval => clearInterval(interval));
    progressIntervals = {};

    activitiesEl.innerHTML = '';

    // Show Spotify if listening
    if (data.listening_to_spotify && data.spotify) {
        const spotifyCard = createSpotifyCard(data.spotify);
        activitiesEl.appendChild(spotifyCard);
    }

    // Show other activities
    if (data.activities && data.activities.length > 0) {
        const mainActivity = getMostRelevantActivity(data.activities);
        
        if (mainActivity) {
            const activityCard = createActivityCard(mainActivity);
            activitiesEl.appendChild(activityCard);
        }

        // Show all activities if there are more
        data.activities.forEach((activity, index) => {
            if (activity !== mainActivity) {
                const card = createActivityCard(activity);
                activitiesEl.appendChild(card);
            }
        });
    }

    // Show "no activity" message if nothing is happening
    if (!data.listening_to_spotify && (!data.activities || data.activities.length === 0)) {
        activitiesEl.innerHTML = '<div class="no-activity">No current activity</div>';
    }
}

// Create Spotify card
function createSpotifyCard(spotify) {
    const card = document.createElement('div');
    card.className = 'activity-card spotify-card';

    const progressPercent = calculateProgress(spotify.timestamps?.start, spotify.timestamps?.end);

    card.innerHTML = `
        <div class="activity-header">🎵 Listening to Spotify</div>
        <div class="activity-content">
            <img src="${spotify.album_art_url}" alt="Album Art" class="activity-image">
            <div class="activity-details">
                <div class="activity-name">${escapeHtml(spotify.song)}</div>
                <div class="activity-info">${escapeHtml(spotify.artist)}</div>
                <div class="activity-info">${escapeHtml(spotify.album)}</div>
                ${spotify.timestamps?.start && spotify.timestamps?.end ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Setup progress interval if timestamps exist
    if (spotify.timestamps?.start && spotify.timestamps?.end) {
        const progressFill = card.querySelector('.progress-fill');
        const interval = setInterval(() => {
            const progress = calculateProgress(spotify.timestamps.start, spotify.timestamps.end);
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 1000);
        progressIntervals['spotify'] = interval;
    }

    return card;
}

// Create activity card
function createActivityCard(activity) {
    const card = document.createElement('div');
    card.className = 'activity-card';

    const typeLabel = getActivityTypeLabel(activity.type);
    const musicService = detectMusicService(activity);

    let imageUrl = '';
    if (activity.assets?.large_image) {
        imageUrl = parseImageUrl(activity.assets.large_image, activity);
    }

    const progressPercent = calculateProgress(
        activity.timestamps?.start, 
        activity.timestamps?.end
    );

    card.innerHTML = `
        <div class="activity-header">
            ${typeLabel}
            ${musicService ? `<span style="opacity: 0.8;"> · ${musicService.name}</span>` : ''}
        </div>
        <div class="activity-content">
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(activity.name)}" class="activity-image" onerror="this.style.display='none'">` : ''}
            <div class="activity-details">
                <div class="activity-name">${escapeHtml(activity.name)}</div>
                ${activity.details ? `<div class="activity-info">${escapeHtml(activity.details)}</div>` : ''}
                ${activity.state ? `<div class="activity-info">${escapeHtml(activity.state)}</div>` : ''}
                ${activity.timestamps?.start && activity.timestamps?.end ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Setup progress interval if timestamps exist
    if (activity.timestamps?.start && activity.timestamps?.end) {
        const progressFill = card.querySelector('.progress-fill');
        const activityId = `activity-${activity.id}`;
        const interval = setInterval(() => {
            const progress = calculateProgress(
                activity.timestamps.start, 
                activity.timestamps.end
            );
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (progress >= 100) {
                clearInterval(interval);
                delete progressIntervals[activityId];
            }
        }, 1000);
        progressIntervals[activityId] = interval;
    }

    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Retry button handler
if (retryButtonEl) {
    retryButtonEl.addEventListener('click', () => {
        client.reconnect();
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    Object.values(progressIntervals).forEach(interval => clearInterval(interval));
    client.destroy();
});

// Connect to Lanyard
console.log('🚀 Starting Discord Activity Client...');
console.log('📡 User ID:', DISCORD_USER_ID);
client.connect();
