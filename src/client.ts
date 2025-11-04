import type {
  DiscordActivityOptions,
  DiscordActivityState,
  LanyardData,
  LanyardMessage,
} from "./types/index.js";

/**
 * Core headless Discord activity client using Lanyard WebSocket API
 * Framework-agnostic implementation that can be used with any UI library
 */
export class DiscordActivityClient {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private options: Required<DiscordActivityOptions>;
  private state: DiscordActivityState = {
    data: null,
    isConnected: false,
    isLoading: true,
    error: null,
    reconnectAttempts: 0,
  };
  private listeners: Set<(state: DiscordActivityState) => void> = new Set();

  constructor(options: DiscordActivityOptions) {
    this.options = {
      userId: options.userId,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      autoReconnect: options.autoReconnect ?? true,
      websocketUrl: options.websocketUrl ?? "wss://api.lanyard.rest/socket",
      onConnect: options.onConnect ?? (() => {}),
      onDisconnect: options.onDisconnect ?? (() => {}),
      onPresenceUpdate: options.onPresenceUpdate ?? (() => {}),
      onError: options.onError ?? (() => {}),
    };
  }

  /**
   * Get the current state
   */
  public getState(): DiscordActivityState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   * Returns an unsubscribe function
   */
  public subscribe(listener: (state: DiscordActivityState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  /**
   * Update internal state and notify listeners
   */
  private updateState(updates: Partial<DiscordActivityState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Connect to Lanyard WebSocket
   */
  public connect(): void {
    this.updateState({ isLoading: true, error: null });

    // Close existing connection if any
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.options.websocketUrl);

      this.ws.onopen = () => {
        this.updateState({ isConnected: true, reconnectAttempts: 0 });
        this.options.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: LanyardMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        this.updateState({ isConnected: false });
        this.options.onDisconnect();
        this.cleanup();
        this.handleDisconnect();
      };

      this.ws.onerror = () => {
        const error = new Error("WebSocket connection error");
        this.updateState({ error });
        this.options.onError(error);
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to connect");
      this.updateState({ error: err, isLoading: false });
      this.options.onError(err);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: LanyardMessage): void {
    switch (message.op) {
      case 1: // Hello
        this.handleHello(message);
        break;

      case 0: // Event
        this.handleEvent(message);
        break;

      default:
        break;
    }
  }

  /**
   * Handle Hello message from Lanyard
   */
  private handleHello(message: LanyardMessage): void {
    // Send identify/initialize payload
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          op: 2, // Initialize opcode
          d: {
            subscribe_to_id: this.options.userId,
          },
        })
      );
    }

    // Setup heartbeat
    if (message.d?.heartbeat_interval) {
      this.setupHeartbeat(message.d.heartbeat_interval);
    }
  }

  /**
   * Handle Event messages (presence updates)
   */
  private handleEvent(message: LanyardMessage): void {
    if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
      const data: LanyardData = message.d;
      this.updateState({ data, isLoading: false });
      this.options.onPresenceUpdate(data);
    }
  }

  /**
   * Setup heartbeat interval
   */
  private setupHeartbeat(interval: number): void {
    // Clear existing interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 3 })); // Heartbeat opcode
      } else {
        this.cleanup();
      }
    }, interval);
  }

  /**
   * Handle disconnection and attempt reconnect if enabled
   */
  private handleDisconnect(): void {
    if (
      this.options.autoReconnect &&
      this.state.reconnectAttempts < this.options.maxReconnectAttempts
    ) {
      const attempts = this.state.reconnectAttempts + 1;
      this.updateState({ reconnectAttempts: attempts });

      // Exponential backoff with max 30 seconds
      const delay = Math.min(1000 * Math.pow(2, attempts), 30000);

      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else if (this.state.reconnectAttempts >= this.options.maxReconnectAttempts) {
      const error = new Error(
        "Maximum reconnection attempts reached. Please try again later."
      );
      this.updateState({ error, isLoading: false });
      this.options.onError(error);
    }
  }

  /**
   * Manually trigger a reconnection
   */
  public reconnect(): void {
    this.updateState({ reconnectAttempts: 0 });
    this.connect();
  }

  /**
   * Cleanup intervals and timeouts
   */
  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Disconnect and cleanup
   */
  public disconnect(): void {
    this.cleanup();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateState({
      isConnected: false,
      isLoading: false,
      reconnectAttempts: 0,
    });
  }

  /**
   * Destroy the client (disconnect and remove all listeners)
   */
  public destroy(): void {
    this.disconnect();
    this.listeners.clear();
  }
}
