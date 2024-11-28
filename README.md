# Magick Agent Nitro Template

This repository serves as a template for deploying Agents created with Magick via the Nitro framework.

Nitro is is a framework for rapidly building serverless applications. It has a robust set of features, all of which are documented in the [Nitro documentation](https://nitro.unjs.io/).

## Introduction

The Magick Agent Nitro Template is a template for deploying Agents created with Magick via the Nitro framework. Its purpose is to produce a standalone runtime bundle which includes your agent and which can be deployed to a variety of platforms.

We utilize the new nitro module system to extend the functionality of the nitro runtime to include the Magick agent class, and a set of structured folders to modify the behavior of the agent at runtime. This allows us to take advantage of the nitro runtime's robust set of features, such as websockets, routes, and more.

## Requirements

A Magick Agent has a number of requirements.

- Postgres
- Redis
- Keywords
- Embedder service

The purpose of these is:

- **PostgreSQL database**: The agent stores its requests, state, eventsd, and more in a PostgreSQL database.
- **Redis database**: Redis is used for caching the agents graph state for faster access and read/write operations. For advanced use cases, there are a number of events which the agent will emit, and you can listen for these events in your own code.
- **Keywords service**: Keywords is our current LLM proxy provider. They provide a simple API for interacting with a variety of LLMs. They have observability, cost management, and more.
- **Embedder URL and API key**: Currently our embedder service is the only hard dependency that the Agent has on our infrastructure. This is because, currently, knowledge is uploaded via the IDE UI, which means it winds up on our embedder service. This will change in the future. Our intention is to provide a folder for knowledge files in your repository, and have the agent pull that knowledge in during runtime.

## Getting Started

1. Fill in all required environment variables in `.env` file (see [Environment Variables](#environment-variables))
2. Run `npm install` (this will also run `npm init` as a postinstall script)

The postinstall script runs migrations against the configured database and generates your Prisma client for your system. This will set up your database and create the necessary tables.

## Running Locally

`npm run dev`

## Building for Production

`npm run build`

## Configuring Your Agent

Place your spell files from the Magick IDE into the `agent/spells` folder. These spells are loaded into the runtime to become active.

We will also be working to add some support for public variables, and multiple agents.

## Interacting with Your Agent

The Agent is available in the Nitro runtime, allowing interaction through various Nitro library abstractions like routes and websockets. The agent uses a channel-based system for handling conversations, where each channel represents a unique conversation context.

Here's an example of how to interact with your agent using channels:

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, userid } = body;
  const nitro = useNitroApp();

  // Function to communicate with agent through a channel
  const sendMessageToAgent = async (content, channelId) => {
    return new Promise((resolve, reject) => {
      // Create a channel for this conversation
      const channel = nitro.agent.channel(channelId);

      // Set up message handler
      channel.on("messageReceived", (response) => {
        channel.removeAllListeners();
        resolve({
          status: "success",
          data: response.data,
          event: response.event,
        });
      });

      // Handle errors
      channel.on("error", (error) => {
        channel.removeAllListeners();
        reject(error);
      });

      // Send message through channel
      channel.emitToAgent(
        "message",
        nitro.agent.formatEvent({
          content: content,
          sender: channelId,
          channel: channelId,
          eventName: "message",
          skipPersist: true,
          rawData: content,
          metadata: {
            sessionId: channelId,
            timestamp: new Date().toISOString(),
          },
        })
      );
    });
  };

  try {
    const result = await sendMessageToAgent(prompt, userid);
    return {
      message: "Data received successfully",
      prompt: prompt,
      generated: result,
    };
  } catch (error) {
    return {
      status: "error",
      error: error,
    };
  }
});
```

### Channel-Based Communication

The agent now uses a channel system for managing conversations:

- Each conversation gets its own channel, typically identified by a user ID
- Channels provide isolated communication contexts
- Messages and responses are scoped to their specific channels
- Channels automatically clean up listeners after message handling

Key concepts:

- `nitro.agent.channel(channelId)`: Creates/gets a channel for a specific conversation
- `channel.emitToAgent()`: Sends a message through the channel
- `channel.on("messageReceived")`: Listens for responses on the channel
- Each channel should handle its own cleanup by removing listeners after use

### Message Format

When sending messages to the agent, use the following format:

```typescript
nitro.agent.formatEvent({
  content: "Your message here",
  sender: "user_id",
  channel: "channel_id",
  eventName: "message",
  skipPersist: true, // Set to false if you want to persist messages
  rawData: "Your message here",
  metadata: {
    sessionId: "channel_id",
    timestamp: new Date().toISOString(),
  },
});
```

## Agent Class

The Agent class acts as an event engine. You can send events (e.g., `message`) to the agent and listen for responses on the `messageReceived` event.

Example usage:

```typescript
nitro.agent.emit(
  "message",
  nitro.agent.formatEvent({
    content: "Hello, Agent!",
    sender: "user123",
    channel: "session456",
    eventName: "message",
    skipPersist: false,
    rawData: "Hello, Agent!",
  })
);

nitro.agent.on("messageReceived", (response) => {
  console.log(response.data.content);
});
```

Key properties in `formatEvent`:

- `sender`: Unique user ID
- `channel`: Unique namespace for the interaction (e.g., user ID or game session)

## Authentication

We do not handle authetication directly. Nitro has many authentication solutions which can be used, and users are expected to implement their own authentication solution.

Once you have a user, you can use the user's ID as the `sender` and the user's ID as the `channel` in the `formatEvent` function.

## Environment Variables

You will need to fill in the following environment variables. Duplicate the `.env.example` file and rename it to `.env`. Fill in your values.

```bash
KEYWORDS_API_KEY=your_keywords_api_key
KEYWORDS_API_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
AGENT_EMBEDDER_API_KEY=your_agent_embedder_api_key
NEXT_PUBLIC_EMBEDDER_SERVER_URL=https://embedder-prod-production.up.railway.app/api
```

- `KEYWORDS_API_KEY`: API key for the keywords service
- `KEYWORDS_API_URL`: URL for the keywords service
- `REDIS_URL`: Redis connection string
- `DATABASE_URL`: PostgreSQL connection string
- `AGENT_EMBEDDER_API_KEY`: API key for accessing your agent's knowledge
- `NEXT_PUBLIC_EMBEDDER_SERVER_URL`: URL for the embedder service

To obtain your `AGENT_EMBEDDER_API_KEY`:

1. Go to the Knowledge tab in the Magick IDE
2. Click the 'Generate Token' button
3. Use the generated token as your `AGENT_EMBEDDER_API_KEY`

This key allows your agent to access its knowledge base.

## Deployment

As with any Nitro application, you can deploy your application to a variety of platforms. You can find more information in the [Nitro deployment documentation](https://nitro.unjs.io/deploy).

## Nitro.js Documentation

For more information on Nitro.js, visit the [official documentation](https://nitro.unjs.io/).
