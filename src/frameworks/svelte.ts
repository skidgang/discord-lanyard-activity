import { writable } from "svelte/store";
import { onDestroy } from "svelte";
import { DiscordActivityClient } from "../client.js";
import type {
  DiscordActivityOptions,
  DiscordActivityState,
} from "../types/index.js";

/**
 * Create a Svelte store for Discord activity tracking using Lanyard
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createDiscordActivityStore } from 'discord-lanyard-activity/svelte';
 *   
 *   const activity = createDiscordActivityStore({
 *     userId: '743173584935190620',
 *   });
 *   
 *   onDestroy(() => {
 *     activity.destroy();
 *   });
 * </script>
 * 
 * {#if $activity.isLoading}
 *   <div>Loading...</div>
 * {:else if $activity.error}
 *   <div>Error: {$activity.error.message}</div>
 * {:else if $activity.data}
 *   <div>
 *     <h2>{$activity.data.discord_user.username}</h2>
 *     <p>Status: {$activity.data.discord_status}</p>
 *     {#if $activity.data.activities.length > 0}
 *       <div>
 *         <h3>Current Activity:</h3>
 *         <p>{$activity.data.activities[0].name}</p>
 *       </div>
 *     {/if}
 *   </div>
 * {/if}
 * ```
 */
export function createDiscordActivityStore(
  options: DiscordActivityOptions
) {
  const initialState: DiscordActivityState = {
    data: null,
    isConnected: false,
    isLoading: true,
    error: null,
    reconnectAttempts: 0,
  };

  const { subscribe, set } = writable<DiscordActivityState>(initialState);

  const client = new DiscordActivityClient(options);

  // Subscribe to client state changes
  const unsubscribe = client.subscribe((state) => {
    set(state);
  });

  // Connect to WebSocket
  client.connect();

  // Reconnect function
  const reconnect = () => {
    client.reconnect();
  };

  // Cleanup function
  const destroy = () => {
    unsubscribe();
    client.destroy();
  };

  return {
    subscribe,
    reconnect,
    destroy,
  };
}

/**
 * Svelte action for automatic lifecycle management
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useDiscordActivity } from 'discord-lanyard-activity/svelte';
 *   
 *   const activity = useDiscordActivity({
 *     userId: '743173584935190620',
 *   });
 * </script>
 * 
 * {#if $activity.isLoading}
 *   <div>Loading...</div>
 * {:else if $activity.error}
 *   <div>Error: {$activity.error.message}</div>
 *   <button on:click={activity.reconnect}>Retry</button>
 * {:else if $activity.data}
 *   <div>
 *     <h2>{$activity.data.discord_user.username}</h2>
 *     <p>Status: {$activity.data.discord_status}</p>
 *   </div>
 * {/if}
 * ```
 */
export function useDiscordActivity(
  options: DiscordActivityOptions
) {
  const store = createDiscordActivityStore(options);

  // Auto-cleanup on component destroy
  onDestroy(() => {
    store.destroy();
  });

  return {
    subscribe: store.subscribe,
    reconnect: store.reconnect,
  };
}
