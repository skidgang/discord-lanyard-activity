import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { DiscordActivityClient } from "../client.js";
import type {
  DiscordActivityOptions,
  DiscordActivityState,
} from "../types/index.js";

/**
 * Vue 3 composable for Discord activity tracking using Lanyard
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useDiscordActivity } from 'discord-lanyard-activity/vue';
 * 
 * const { data, isLoading, error, reconnect } = useDiscordActivity({
 *   userId: '743173584935190620',
 * });
 * </script>
 * 
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="data">
 *     <h2>{{ data.discord_user.username }}</h2>
 *     <p>Status: {{ data.discord_status }}</p>
 *     <div v-if="data.activities.length > 0">
 *       <h3>Current Activity:</h3>
 *       <p>{{ data.activities[0].name }}</p>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useDiscordActivity(
  options: DiscordActivityOptions
) {
  const data: Ref<DiscordActivityState["data"]> = ref(null);
  const isConnected = ref(false);
  const isLoading = ref(true);
  const error: Ref<Error | null> = ref(null);
  const reconnectAttempts = ref(0);

  let client: DiscordActivityClient | null = null;
  let unsubscribe: (() => void) | null = null;

  const reconnect = () => {
    if (client) {
      client.reconnect();
    }
  };

  onMounted(() => {
    client = new DiscordActivityClient(options);

    // Subscribe to state changes
    unsubscribe = client.subscribe((state) => {
      data.value = state.data;
      isConnected.value = state.isConnected;
      isLoading.value = state.isLoading;
      error.value = state.error;
      reconnectAttempts.value = state.reconnectAttempts;
    });

    // Connect to WebSocket
    client.connect();
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (client) {
      client.destroy();
    }
  });

  return {
    data,
    isConnected,
    isLoading,
    error,
    reconnectAttempts,
    reconnect,
  };
}
