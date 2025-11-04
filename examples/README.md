# Examples

This directory contains example implementations for different frameworks.

## Vanilla JavaScript/TypeScript

```typescript
import { DiscordActivityClient } from 'discord-lanyard-activity';

const client = new DiscordActivityClient({
  userId: '743173584935190620',
});

client.subscribe((state) => {
  if (state.data) {
    document.getElementById('status').textContent = state.data.discord_status;
    document.getElementById('username').textContent = state.data.discord_user.username;
  }
});

client.connect();
```

## React Example

See `react-example.tsx` for a complete React implementation.

## Vue 3 Example

See `vue-example.vue` for a complete Vue 3 implementation.

## Svelte Example

See `svelte-example.svelte` for a complete Svelte implementation.

## Running Examples

1. Install dependencies in your project
2. Copy the example code
3. Replace `userId` with your Discord user ID
4. Make sure you've joined the Lanyard Discord server
