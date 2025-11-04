import type {
  ActivityType,
  DiscordActivity,
  MusicService,
} from "./types/index.js";

/**
 * Get activity type label as a human-readable string
 */
export function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    0: "Playing",
    1: "Streaming",
    2: "Listening to",
    3: "Watching",
    4: "Custom",
    5: "Competing in",
  };

  return labels[type] || "Active on";
}

/**
 * Parse Discord image URL with support for Spotify, external images, and CDN
 */
export function parseImageUrl(
  imageUrl: string,
  activity?: DiscordActivity
): string {
  if (!imageUrl) return "";

  // Handle Spotify images
  if (imageUrl.startsWith("spotify:")) {
    const spotifyId = imageUrl.split(":").pop();
    return `https://i.scdn.co/image/${spotifyId}`;
  }

  // Handle mp:external format (for Google images, etc.)
  if (imageUrl.startsWith("mp:external")) {
    const httpsIndex = imageUrl.indexOf("/https/");
    if (httpsIndex !== -1) {
      const path = imageUrl.substring(httpsIndex + 6); // +6 to skip "/https/"
      return `https://media.discordapp.net/external/${imageUrl.substring(11, httpsIndex)}/https/${path}`;
    }
    return imageUrl;
  }

  // Handle standard Discord CDN URLs
  if (activity?.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageUrl}.png`;
  }

  return imageUrl;
}

/**
 * Detect music service from activity data
 */
export function detectMusicService(activity: DiscordActivity): MusicService | null {
  if (activity.type !== 2) { // Not a listening activity
    return null;
  }

  // Application ID mappings
  const serviceMap: Record<string, MusicService> = {
    "463151177836658699": {
      name: "YouTube Music",
      icon: "https://music.youtube.com/favicon.ico",
      color: "#FF0000",
    },
    "367827983903490050": {
      name: "Apple Music",
      icon: "https://music.apple.com/favicon.ico",
      color: "#FA243C",
    },
    "174403736877957120": {
      name: "SoundCloud",
      icon: "https://soundcloud.com/favicon.ico",
      color: "#FF5500",
    },
    "432980957394370572": {
      name: "Deezer",
      icon: "https://www.deezer.com/favicon.ico",
      color: "#FEAA2D",
    },
    "408785106942164992": {
      name: "Tidal",
      icon: "https://tidal.com/favicon.ico",
      color: "#000000",
    },
    "1020414178047041596": {
      name: "Amazon Music",
      icon: "https://music.amazon.com/favicon.ico",
      color: "#FF9900",
    },
    "1043708582735806464": {
      name: "Pandora",
      icon: "https://www.pandora.com/favicon.ico",
      color: "#005483",
    },
  };

  // Check by application_id
  if (activity.application_id && serviceMap[activity.application_id]) {
    return serviceMap[activity.application_id];
  }

  // Fallback: Check by activity name
  const activityName = activity.name?.toLowerCase() || "";

  if (activityName.includes("youtube")) {
    return serviceMap["463151177836658699"];
  }
  if (activityName.includes("apple music")) {
    return serviceMap["367827983903490050"];
  }
  if (activityName.includes("soundcloud")) {
    return serviceMap["174403736877957120"];
  }
  if (activityName.includes("deezer")) {
    return serviceMap["432980957394370572"];
  }
  if (activityName.includes("tidal")) {
    return serviceMap["408785106942164992"];
  }
  if (activityName.includes("amazon")) {
    return serviceMap["1020414178047041596"];
  }
  if (activityName.includes("pandora")) {
    return serviceMap["1043708582735806464"];
  }

  // Default to Spotify (most common)
  return {
    name: "Spotify",
    icon: "https://open.spotify.com/favicon.ico",
    color: "#1DB954",
  };
}

/**
 * Calculate progress percentage for activities with timestamps
 */
export function calculateProgress(start?: number, end?: number): number {
  if (!start || !end) return 0;

  const now = Date.now();
  const total = end - start;
  const elapsed = now - start;

  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}

/**
 * Format timestamp to human-readable duration (MM:SS)
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Get Discord user avatar URL
 */
export function getAvatarUrl(
  userId: string,
  avatar: string | null,
  discriminator?: string
): string {
  if (avatar) {
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`;
  }

  // Default Discord avatar based on discriminator
  const defaultIndex = discriminator ? parseInt(discriminator) % 5 : 0;
  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

/**
 * Get display name from Discord user data
 */
export function getDisplayName(
  globalName?: string | null,
  username?: string
): string {
  return globalName || username || "Discord User";
}

/**
 * Sort activities by priority (listening > playing > others)
 */
export function sortActivitiesByPriority(
  activities: DiscordActivity[]
): DiscordActivity[] {
  return [...activities].sort((a, b) => {
    // Prioritize listening activities (music)
    if (a.type === 2 && b.type !== 2) return -1;
    if (b.type === 2 && a.type !== 2) return 1;

    // Then prioritize playing games
    if (a.type === 0 && b.type !== 0) return -1;
    if (b.type === 0 && a.type !== 0) return 1;

    return 0;
  });
}

/**
 * Filter out duplicate music activities
 * When listening to music (Spotify, YouTube Music, etc.), Discord sometimes shows it as both 
 * a listening activity (type 2) and as a separate app activity. This function removes duplicates.
 */
export function filterDuplicateSpotifyActivities(
  activities: DiscordActivity[],
  isListeningToSpotify: boolean
): DiscordActivity[] {
  if (!activities || activities.length === 0) return activities;
  
  // If user is listening to music (Spotify flag is set), filter out ALL listening activities (type 2)
  // because they're already shown in the dedicated music section
  if (isListeningToSpotify) {
    return activities.filter(activity => {
      // Remove any listening activity (type 2) - this covers all music services
      return activity.type !== 2;
    });
  }
  
  return activities;
}

/**
 * Get the most relevant activity from a list
 */
export function getMostRelevantActivity(
  activities: DiscordActivity[]
): DiscordActivity | null {
  if (!activities || activities.length === 0) return null;

  const sorted = sortActivitiesByPriority(activities);
  return sorted[0];
}

/**
 * Get non-listening activities (useful for showing other activities while music is playing)
 */
export function getNonListeningActivities(
  activities: DiscordActivity[]
): DiscordActivity[] {
  return activities.filter(activity => activity.type !== 2);
}
