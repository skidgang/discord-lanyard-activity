import React from 'react';
import { useDiscordActivity, getMostRelevantActivity, getActivityTypeLabel } from 'discord-lanyard-activity/react';

export default function DiscordActivityExample() {
  const { data, isLoading, error, isConnected, reconnect } = useDiscordActivity({
    userId: '743173584935190620', // Replace with your Discord user ID
  });

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading Discord activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Failed to load Discord activity</p>
        <p>{error.message}</p>
        <button onClick={reconnect}>Retry Connection</button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const mainActivity = getMostRelevantActivity(data.activities);

  return (
    <div className="discord-activity">
      <div className="header">
        <img
          src={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`}
          alt={data.discord_user.username}
          className="avatar"
        />
        <div className="user-info">
          <h2>{data.discord_user.global_name || data.discord_user.username}</h2>
          <p className="username">@{data.discord_user.username}</p>
          <div className={`status ${data.discord_status}`}>
            <span className="status-dot" />
            {data.discord_status}
          </div>
        </div>
      </div>

      {data.listening_to_spotify && data.spotify && (
        <div className="activity-card spotify">
          <h3>Listening to Spotify</h3>
          <div className="spotify-info">
            <img src={data.spotify.album_art_url} alt="Album Art" className="album-art" />
            <div className="track-info">
              <p className="song">{data.spotify.song}</p>
              <p className="artist">{data.spotify.artist}</p>
              <p className="album">{data.spotify.album}</p>
            </div>
          </div>
        </div>
      )}

      {mainActivity && (
        <div className="activity-card">
          <h3>{getActivityTypeLabel(mainActivity.type)}</h3>
          <div className="activity-info">
            {mainActivity.assets?.large_image && (
              <img
                src={`https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.large_image}.png`}
                alt={mainActivity.name}
                className="activity-image"
              />
            )}
            <div className="activity-details">
              <p className="activity-name">{mainActivity.name}</p>
              {mainActivity.details && <p className="details">{mainActivity.details}</p>}
              {mainActivity.state && <p className="state">{mainActivity.state}</p>}
            </div>
          </div>
        </div>
      )}

      {data.activities.length === 0 && !data.listening_to_spotify && (
        <div className="no-activity">
          <p>No current activity</p>
        </div>
      )}

      <div className="footer">
        <span className={isConnected ? 'connected' : 'disconnected'}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>
    </div>
  );
}
