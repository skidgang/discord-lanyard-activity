import { useEffect, useState, useRef, useCallback } from "react";
import { DiscordActivityClient } from "../client.js";
import type {
  DiscordActivityOptions,
  DiscordActivityState,
} from "../types/index.js";

/**
 * React hook for Discord activity tracking using Lanyard
 * 
 * @example
 * ```tsx
 * import { useDiscordActivity } from 'discord-lanyard-activity/react';
 * 
 * function MyComponent() {
 *   const { data, isLoading, error, reconnect } = useDiscordActivity({
 *     userId: '743173584935190620',
 *   });
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!data) return <div>No data</div>;
 * 
 *   return (
 *     <div>
 *       <h2>{data.discord_user.username}</h2>
 *       <p>Status: {data.discord_status}</p>
 *       {data.activities.length > 0 && (
 *         <div>
 *           <h3>Current Activity:</h3>
 *           <p>{data.activities[0].name}</p>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDiscordActivity(
  options: DiscordActivityOptions
): DiscordActivityState & { reconnect: () => void } {
  const [state, setState] = useState<DiscordActivityState>({
    data: null,
    isConnected: false,
    isLoading: true,
    error: null,
    reconnectAttempts: 0,
  });

  const clientRef = useRef<DiscordActivityClient | null>(null);

  // Initialize client and connect
  useEffect(() => {
    const client = new DiscordActivityClient(options);
    clientRef.current = client;

    // Subscribe to state changes
    const unsubscribe = client.subscribe((newState) => {
      setState(newState);
    });

    // Connect to WebSocket
    client.connect();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      client.destroy();
      clientRef.current = null;
    };
  }, [options.userId]); // Only recreate client if userId changes

  // Reconnect function
  const reconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.reconnect();
    }
  }, []);

  return {
    ...state,
    reconnect,
  };
}
