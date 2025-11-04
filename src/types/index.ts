/**
 * Discord activity types
 */
export enum ActivityType {
  PLAYING = 0,
  STREAMING = 1,
  LISTENING = 2,
  WATCHING = 3,
  CUSTOM = 4,
  COMPETING = 5,
}

/**
 * Discord status types
 */
export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

/**
 * Discord activity timestamps
 */
export interface ActivityTimestamps {
  start?: number;
  end?: number;
}

/**
 * Discord activity assets (images)
 */
export interface ActivityAssets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

/**
 * Discord activity party information
 */
export interface ActivityParty {
  id?: string;
  size?: [number, number];
}

/**
 * Discord activity secrets (for joining/spectating)
 */
export interface ActivitySecrets {
  join?: string;
  spectate?: string;
  match?: string;
}

/**
 * Spotify track information
 */
export interface SpotifyTrack {
  timestamps: ActivityTimestamps;
  song: string;
  artist: string;
  album_art_url: string;
  album: string;
  track_id: string;
}

/**
 * Discord activity data
 */
export interface DiscordActivity {
  id: string;
  name: string;
  type: ActivityType;
  url?: string;
  created_at: number;
  timestamps?: ActivityTimestamps;
  application_id?: string;
  details?: string;
  state?: string;
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
  party?: ActivityParty;
  assets?: ActivityAssets;
  secrets?: ActivitySecrets;
  instance?: boolean;
  flags?: number;
  buttons?: string[];
  sync_id?: string;
  session_id?: string;
}

/**
 * Discord user information
 */
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  global_name?: string;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
  };
  display_name?: string;
  public_flags?: number;
}

/**
 * Lanyard presence data
 */
export interface LanyardData {
  spotify?: SpotifyTrack | null;
  listening_to_spotify: boolean;
  discord_user: DiscordUser;
  discord_status: DiscordStatus;
  activities: DiscordActivity[];
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_web: boolean;
  kv?: Record<string, string>;
}

/**
 * WebSocket message opcodes
 */
export enum LanyardOpcode {
  Event = 0,
  Hello = 1,
  Initialize = 2,
  Heartbeat = 3,
}

/**
 * WebSocket message structure
 */
export interface LanyardMessage {
  op: LanyardOpcode;
  t?: string;
  d?: any;
}

/**
 * Configuration options for the Discord activity client
 */
export interface DiscordActivityOptions {
  /**
   * Discord user ID to track
   */
  userId: string;

  /**
   * Maximum number of reconnection attempts
   * @default 5
   */
  maxReconnectAttempts?: number;

  /**
   * Enable automatic reconnection on connection loss
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Custom WebSocket URL (for testing or custom Lanyard instances)
   * @default "wss://api.lanyard.rest/socket"
   */
  websocketUrl?: string;

  /**
   * Callback function called when connection is established
   */
  onConnect?: () => void;

  /**
   * Callback function called when connection is lost
   */
  onDisconnect?: () => void;

  /**
   * Callback function called when presence data is updated
   */
  onPresenceUpdate?: (data: LanyardData) => void;

  /**
   * Callback function called on connection errors
   */
  onError?: (error: Error) => void;
}

/**
 * Client state
 */
export interface DiscordActivityState {
  /**
   * Current presence data
   */
  data: LanyardData | null;

  /**
   * Whether the client is currently connected
   */
  isConnected: boolean;

  /**
   * Whether the client is currently loading
   */
  isLoading: boolean;

  /**
   * Current error, if any
   */
  error: Error | null;

  /**
   * Number of reconnection attempts made
   */
  reconnectAttempts: number;
}

/**
 * Music service information
 */
export interface MusicService {
  name: string;
  icon: string;
  color: string;
}
