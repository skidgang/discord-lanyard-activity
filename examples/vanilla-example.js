import { DiscordActivityClient } from 'discord-lanyard-activity';

// Get DOM elements
const statusEl = document.getElementById('status');
const usernameEl = document.getElementById('username');
const activityEl = document.getElementById('activity');
const errorEl = document.getElementById('error');
const loadingEl = document.getElementById('loading');
const retryBtn = document.getElementById('retry');

// Create client
const client = new DiscordActivityClient({
  userId: '743173584935190620', // Replace with your Discord user ID
});

// Subscribe to state changes
client.subscribe((state) => {
  // Hide loading
  if (loadingEl) loadingEl.style.display = 'none';

  // Handle error
  if (state.error) {
    if (errorEl) {
      errorEl.textContent = `Error: ${state.error.message}`;
      errorEl.style.display = 'block';
    }
    return;
  }

  // Hide error
  if (errorEl) errorEl.style.display = 'none';

  // Display data
  if (state.data) {
    const { discord_user, discord_status, activities, listening_to_spotify, spotify } = state.data;

    if (usernameEl) {
      usernameEl.textContent = discord_user.global_name || discord_user.username;
    }

    if (statusEl) {
      statusEl.textContent = discord_status;
      statusEl.className = `status ${discord_status}`;
    }

    if (activityEl) {
      activityEl.innerHTML = '';

      // Show Spotify if listening
      if (listening_to_spotify && spotify) {
        const spotifyDiv = document.createElement('div');
        spotifyDiv.className = 'activity-card spotify';
        spotifyDiv.innerHTML = `
          <h3>Listening to Spotify</h3>
          <img src="${spotify.album_art_url}" alt="Album Art" class="album-art" />
          <div>
            <p><strong>${spotify.song}</strong></p>
            <p>${spotify.artist}</p>
            <p><em>${spotify.album}</em></p>
          </div>
        `;
        activityEl.appendChild(spotifyDiv);
      }

      // Show main activity
      if (activities.length > 0) {
        const activity = activities[0];
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-card';
        activityDiv.innerHTML = `
          <h3>${activity.name}</h3>
          ${activity.details ? `<p>${activity.details}</p>` : ''}
          ${activity.state ? `<p>${activity.state}</p>` : ''}
        `;
        activityEl.appendChild(activityDiv);
      }

      // Show no activity message
      if (activities.length === 0 && !listening_to_spotify) {
        activityEl.innerHTML = '<p>No current activity</p>';
      }
    }
  }
});

// Connect
client.connect();

// Retry button
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    client.reconnect();
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  client.destroy();
});
