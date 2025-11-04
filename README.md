# discord-lanyard-activity

A headless, framework-agnostic Discord activity tracker using the [Lanyard API](https://github.com/Phineas/lanyard). Works seamlessly with React, Vue, Svelte, and vanilla JavaScript.

## Features

- 🎯 **Headless & Framework-Agnostic** - Core client works with any JavaScript environment
- ⚛️ **React Hook** - Simple `useDiscordActivity` hook for React applications
- 🖖 **Vue Composable** - Built-in composable for Vue 3
- 🔥 **Svelte Store** - Native Svelte store integration
- 🔄 **Real-time Updates** - WebSocket connection for live activity updates
- 🔌 **Auto-reconnection** - Built-in reconnection logic with exponential backoff
- 📦 **TypeScript First** - Fully typed with comprehensive type definitions
- 🎨 **No UI Components** - You control the presentation layer
- 🪶 **Lightweight** - Minimal dependencies

## Installation

```bash
npm install discord-lanyard-activity
```

```bash
yarn add discord-lanyard-activity
```

```bash
pnpm add discord-lanyard-activity
```

## Prerequisites

1. **Join Lanyard Discord Server**: Your Discord account must be in the [Lanyard Discord server](https://discord.gg/lanyard) for activity tracking to work
2. **Get Your Discord User ID**: Enable Developer Mode in Discord Settings → Advanced, then right-click your profile and select "Copy User ID"

## Supported Activities

### Music Services (Native Discord Integration)
The following music services are automatically detected when you use Discord's native integrations:

- 🎵 **Spotify** - Full native support with rich presence
- 🎵 **YouTube Music** - Via Discord integration
- 🎵 **Apple Music** - Via Discord integration  
- 🎵 **SoundCloud** - Via Discord integration
- 🎵 **Deezer** - Via Discord integration
- 🎵 **Tidal** - Via Discord integration
- 🎵 **Amazon Music** - Via Discord integration
- 🎵 **Pandora** - Via Discord integration

### Enhanced Activity Tracking with PreMID

For better activity tracking across websites, streaming platforms, and apps, we highly recommend using **[PreMID](https://premid.app/)**!

#### What is PreMID?

PreMID is a browser extension and desktop application that displays rich presence information for thousands of websites and services on Discord. It significantly enhances your Discord activity tracking beyond native integrations.

#### Why Use PreMID?

- 🌐 **2000+ Supported Services** - Netflix, YouTube, Twitch, Crunchyroll, and many more
- 🎮 **Gaming Platforms** - Steam, Epic Games, Xbox, PlayStation Network
- 🎬 **Streaming Services** - Track what you're watching on popular platforms
- 💻 **Development Tools** - VS Code, GitHub, GitLab, Stack Overflow
- 🎨 **Creative Apps** - Figma, Canva, Adobe Creative Cloud
- 📱 **Social Media** - Twitter, Reddit, Instagram (web)
- 🎧 **Music Services** - Better tracking for web players

#### How to Set Up PreMID

1. **Install the Browser Extension**
   - [Chrome/Edge](https://chrome.google.com/webstore/detail/premid/agjnjboanicjcpenljmaaigopkgdnihi)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/premid/)

2. **Install PreMID Desktop App**
   - Download from [premid.app/downloads](https://premid.app/downloads)
   - Available for Windows, macOS, and Linux

3. **Install Presences (Service Integrations)**
   - Visit [PreMID Presence Store](https://premid.app/store)
   - Search and install presences for your favorite services
   - Presences are automatically synced and updated

4. **Start Using**
   - Open Discord and the PreMID app
   - Visit supported websites
   - Your activity will automatically appear on Discord!

#### PreMID + This Package = Perfect Combo 🎯

When you use PreMID with this package:
- ✅ Track activities from 2000+ websites and apps
- ✅ Display rich presence with thumbnails and details
- ✅ All data automatically flows through Lanyard API
- ✅ Works seamlessly with this package's real-time tracking
- ✅ No extra configuration needed

**Example**: Watch Netflix → PreMID shows it on Discord → Lanyard tracks it → This package displays it on your website in real-time!

> 💡 **Pro Tip**: After installing PreMID, your Discord activity will become much richer with detailed information about what you're doing across the web!

## Usage

### Vanilla JavaScript / TypeScript

```typescript
import { DiscordActivityClient } from 'discord-lanyard-activity';

const client = new DiscordActivityClient({
  userId: '743173584935190620',
  onPresenceUpdate: (data) => {
    console.log('User status:', data.discord_status);
    console.log('Activities:', data.activities);
  },
  onConnect: () => console.log('Connected!'),
  onError: (error) => console.error('Error:', error),
});

// Connect to WebSocket
client.connect();

// Subscribe to state changes
const unsubscribe = client.subscribe((state) => {
  if (state.data) {
    console.log('Current state:', state);
  }
});

// Get current state
const currentState = client.getState();

// Manually reconnect
client.reconnect();

// Cleanup when done
client.disconnect();
// or
client.destroy(); // Also removes all listeners
```

### React

```tsx
import { useDiscordActivity } from 'discord-lanyard-activity/react';

function DiscordPresence() {
  const { data, isLoading, error, reconnect } = useDiscordActivity({
    userId: '743173584935190620',
  });

  if (isLoading) return <div>Loading Discord activity...</div>;
  
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={reconnect}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <h2>{data.discord_user.username}</h2>
      <p>Status: {data.discord_status}</p>
      
      {data.listening_to_spotify && data.spotify && (
        <div>
          <h3>Listening to Spotify</h3>
          <p>Song: {data.spotify.song}</p>
          <p>Artist: {data.spotify.artist}</p>
          <img src={data.spotify.album_art_url} alt="Album Art" />
        </div>
      )}

      {data.activities.length > 0 && (
        <div>
          <h3>Current Activity</h3>
          <p>{data.activities[0].name}</p>
          {data.activities[0].details && <p>{data.activities[0].details}</p>}
        </div>
      )}
    </div>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { useDiscordActivity } from 'discord-lanyard-activity/vue';

const { data, isLoading, error, reconnect } = useDiscordActivity({
  userId: '743173584935190620',
});
</script>

<template>
  <div v-if="isLoading">Loading Discord activity...</div>
  
  <div v-else-if="error">
    <p>Error: {{ error.message }}</p>
    <button @click="reconnect">Retry</button>
  </div>
  
  <div v-else-if="data">
    <h2>{{ data.discord_user.username }}</h2>
    <p>Status: {{ data.discord_status }}</p>
    
    <div v-if="data.listening_to_spotify && data.spotify">
      <h3>Listening to Spotify</h3>
      <p>Song: {{ data.spotify.song }}</p>
      <p>Artist: {{ data.spotify.artist }}</p>
      <img :src="data.spotify.album_art_url" alt="Album Art" />
    </div>

    <div v-if="data.activities.length > 0">
      <h3>Current Activity</h3>
      <p>{{ data.activities[0].name }}</p>
      <p v-if="data.activities[0].details">{{ data.activities[0].details }}</p>
    </div>
  </div>
</template>
```

### Svelte

```svelte
<script lang="ts">
  import { useDiscordActivity } from 'discord-lanyard-activity/svelte';
  
  const activity = useDiscordActivity({
    userId: '743173584935190620',
  });
</script>

{#if $activity.isLoading}
  <div>Loading Discord activity...</div>
{:else if $activity.error}
  <div>
    <p>Error: {$activity.error.message}</p>
    <button on:click={activity.reconnect}>Retry</button>
  </div>
{:else if $activity.data}
  <div>
    <h2>{$activity.data.discord_user.username}</h2>
    <p>Status: {$activity.data.discord_status}</p>
    
    {#if $activity.data.listening_to_spotify && $activity.data.spotify}
      <div>
        <h3>Listening to Spotify</h3>
        <p>Song: {$activity.data.spotify.song}</p>
        <p>Artist: {$activity.data.spotify.artist}</p>
        <img src={$activity.data.spotify.album_art_url} alt="Album Art" />
      </div>
    {/if}

    {#if $activity.data.activities.length > 0}
      <div>
        <h3>Current Activity</h3>
        <p>{$activity.data.activities[0].name}</p>
        {#if $activity.data.activities[0].details}
          <p>{$activity.data.activities[0].details}</p>
        {/if}
      </div>
    {/if}
  </div>
{/if}
```

## API Reference

### `DiscordActivityClient`

The core client class that manages the WebSocket connection to Lanyard.

#### Constructor Options

```typescript
interface DiscordActivityOptions {
  userId: string;                      // Discord user ID (required)
  maxReconnectAttempts?: number;       // Default: 5
  autoReconnect?: boolean;             // Default: true
  websocketUrl?: string;               // Default: "wss://api.lanyard.rest/socket"
  onConnect?: () => void;
  onDisconnect?: () => void;
  onPresenceUpdate?: (data: LanyardData) => void;
  onError?: (error: Error) => void;
}
```

#### Methods

- `connect()` - Connect to Lanyard WebSocket
- `disconnect()` - Disconnect from WebSocket
- `reconnect()` - Manually trigger a reconnection
- `getState()` - Get current state snapshot
- `subscribe(listener)` - Subscribe to state changes, returns unsubscribe function
- `destroy()` - Disconnect and remove all listeners

#### State Object

```typescript
interface DiscordActivityState {
  data: LanyardData | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  reconnectAttempts: number;
}
```

### Utility Functions

The package exports several utility functions for working with activity data:

```typescript
import {
  getActivityTypeLabel,
  parseImageUrl,
  detectMusicService,
  calculateProgress,
  formatDuration,
  getAvatarUrl,
  getDisplayName,
  getMostRelevantActivity,
  sortActivitiesByPriority,
} from 'discord-lanyard-activity';

// Get human-readable activity type
const label = getActivityTypeLabel(activity.type); // "Playing", "Listening to", etc.

// Parse Discord/Spotify image URLs
const imageUrl = parseImageUrl(activity.assets.large_image, activity);

// Detect music service from activity
const service = detectMusicService(activity); // { name, icon, color }

// Calculate progress for activities with timestamps
const progress = calculateProgress(activity.timestamps.start, activity.timestamps.end);

// Format milliseconds to MM:SS
const duration = formatDuration(180000); // "3:00"

// Get Discord avatar URL
const avatarUrl = getAvatarUrl(userId, avatar, discriminator);

// Get display name
const displayName = getDisplayName(globalName, username);

// Get the most relevant activity (prioritizes music > games > others)
const mainActivity = getMostRelevantActivity(activities);
```

## Activity Types

```typescript
enum ActivityType {
  PLAYING = 0,      // Playing a game
  STREAMING = 1,    // Streaming
  LISTENING = 2,    // Listening to music
  WATCHING = 3,     // Watching something
  CUSTOM = 4,       // Custom status
  COMPETING = 5,    // Competing in something
}
```

## Data Structure

### LanyardData

```typescript
interface LanyardData {
  spotify: SpotifyTrack | null;
  listening_to_spotify: boolean;
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: DiscordActivity[];
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_web: boolean;
  kv?: Record<string, string>;
}
```

### DiscordActivity

```typescript
interface DiscordActivity {
  id: string;
  name: string;
  type: ActivityType;
  url?: string;
  created_at: number;
  timestamps?: {
    start?: number;
    end?: number;
  };
  application_id?: string;
  details?: string;
  state?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  // ... more fields
}
```

## Music Services

The package automatically detects various music services:

- Spotify
- YouTube Music
- Apple Music
- SoundCloud
- Deezer
- Tidal
- Amazon Music
- Pandora

Use `detectMusicService(activity)` to get service information including name, icon URL, and brand color.

## Examples

Check out the `/examples` directory for complete working examples:

- Vanilla JavaScript/TypeScript
- React
- Vue 3
- Svelte

## Requirements

To use this package, you need to:

1. Have your Discord user ID
2. Join the [Lanyard Discord server](https://discord.gg/lanyard)
3. Lanyard will automatically start tracking your presence

## Credits

This package uses the [Lanyard API](https://github.com/Phineas/lanyard) by [@Phineas](https://github.com/Phineas).

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/DevRohit06/discord-lanyard-activity/issues) on GitHub.
