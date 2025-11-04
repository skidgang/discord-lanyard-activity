<script setup lang="ts">
import { useDiscordActivity } from 'discord-lanyard-activity/vue';
import { getMostRelevantActivity, getActivityTypeLabel } from 'discord-lanyard-activity';

const { data, isLoading, error, isConnected, reconnect } = useDiscordActivity({
  userId: '743173584935190620', // Replace with your Discord user ID
});

const mainActivity = computed(() => 
  data.value?.activities ? getMostRelevantActivity(data.value.activities) : null
);
</script>

<template>
  <div class="discord-activity">
    <div v-if="isLoading" class="loading">
      <div class="spinner" />
      <p>Loading Discord activity...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>Failed to load Discord activity</p>
      <p>{{ error.message }}</p>
      <button @click="reconnect">Retry Connection</button>
    </div>

    <div v-else-if="data" class="content">
      <div class="header">
        <img
          :src="`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`"
          :alt="data.discord_user.username"
          class="avatar"
        />
        <div class="user-info">
          <h2>{{ data.discord_user.global_name || data.discord_user.username }}</h2>
          <p class="username">@{{ data.discord_user.username }}</p>
          <div :class="['status', data.discord_status]">
            <span class="status-dot" />
            {{ data.discord_status }}
          </div>
        </div>
      </div>

      <div v-if="data.listening_to_spotify && data.spotify" class="activity-card spotify">
        <h3>Listening to Spotify</h3>
        <div class="spotify-info">
          <img :src="data.spotify.album_art_url" alt="Album Art" class="album-art" />
          <div class="track-info">
            <p class="song">{{ data.spotify.song }}</p>
            <p class="artist">{{ data.spotify.artist }}</p>
            <p class="album">{{ data.spotify.album }}</p>
          </div>
        </div>
      </div>

      <div v-if="mainActivity" class="activity-card">
        <h3>{{ getActivityTypeLabel(mainActivity.type) }}</h3>
        <div class="activity-info">
          <img
            v-if="mainActivity.assets?.large_image"
            :src="`https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.large_image}.png`"
            :alt="mainActivity.name"
            class="activity-image"
          />
          <div class="activity-details">
            <p class="activity-name">{{ mainActivity.name }}</p>
            <p v-if="mainActivity.details" class="details">{{ mainActivity.details }}</p>
            <p v-if="mainActivity.state" class="state">{{ mainActivity.state }}</p>
          </div>
        </div>
      </div>

      <div v-if="data.activities.length === 0 && !data.listening_to_spotify" class="no-activity">
        <p>No current activity</p>
      </div>

      <div class="footer">
        <span :class="isConnected ? 'connected' : 'disconnected'">
          {{ isConnected ? '● Connected' : '○ Disconnected' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discord-activity {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.loading, .error {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5865F2;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #747f8d;
}

.status.online .status-dot {
  background-color: #43b581;
}

.status.idle .status-dot {
  background-color: #faa61a;
}

.status.dnd .status-dot {
  background-color: #f04747;
}

.activity-card {
  background: #f7f7f7;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.spotify-info, .activity-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.album-art, .activity-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.footer {
  text-align: center;
  margin-top: 15px;
  font-size: 12px;
  color: #666;
}

.connected {
  color: #43b581;
}

.disconnected {
  color: #f04747;
}
</style>
