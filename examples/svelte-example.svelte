<script lang="ts">
  import { useDiscordActivity } from 'discord-lanyard-activity/svelte';
  import { getMostRelevantActivity, getActivityTypeLabel } from 'discord-lanyard-activity';

  const activity = useDiscordActivity({
    userId: '743173584935190620', // Replace with your Discord user ID
  });

  $: mainActivity = $activity.data?.activities 
    ? getMostRelevantActivity($activity.data.activities) 
    : null;
</script>

<div class="discord-activity">
  {#if $activity.isLoading}
    <div class="loading">
      <div class="spinner" />
      <p>Loading Discord activity...</p>
    </div>
  {:else if $activity.error}
    <div class="error">
      <p>Failed to load Discord activity</p>
      <p>{$activity.error.message}</p>
      <button on:click={activity.reconnect}>Retry Connection</button>
    </div>
  {:else if $activity.data}
    <div class="content">
      <div class="header">
        <img
          src={`https://cdn.discordapp.com/avatars/${$activity.data.discord_user.id}/${$activity.data.discord_user.avatar}.png?size=128`}
          alt={$activity.data.discord_user.username}
          class="avatar"
        />
        <div class="user-info">
          <h2>{$activity.data.discord_user.global_name || $activity.data.discord_user.username}</h2>
          <p class="username">@{$activity.data.discord_user.username}</p>
          <div class="status {$activity.data.discord_status}">
            <span class="status-dot" />
            {$activity.data.discord_status}
          </div>
        </div>
      </div>

      {#if $activity.data.listening_to_spotify && $activity.data.spotify}
        <div class="activity-card spotify">
          <h3>Listening to Spotify</h3>
          <div class="spotify-info">
            <img src={$activity.data.spotify.album_art_url} alt="Album Art" class="album-art" />
            <div class="track-info">
              <p class="song">{$activity.data.spotify.song}</p>
              <p class="artist">{$activity.data.spotify.artist}</p>
              <p class="album">{$activity.data.spotify.album}</p>
            </div>
          </div>
        </div>
      {/if}

      {#if mainActivity}
        <div class="activity-card">
          <h3>{getActivityTypeLabel(mainActivity.type)}</h3>
          <div class="activity-info">
            {#if mainActivity.assets?.large_image}
              <img
                src={`https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.large_image}.png`}
                alt={mainActivity.name}
                class="activity-image"
              />
            {/if}
            <div class="activity-details">
              <p class="activity-name">{mainActivity.name}</p>
              {#if mainActivity.details}
                <p class="details">{mainActivity.details}</p>
              {/if}
              {#if mainActivity.state}
                <p class="state">{mainActivity.state}</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      {#if $activity.data.activities.length === 0 && !$activity.data.listening_to_spotify}
        <div class="no-activity">
          <p>No current activity</p>
        </div>
      {/if}

      <div class="footer">
        <span class={$activity.isConnected ? 'connected' : 'disconnected'}>
          {$activity.isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
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
