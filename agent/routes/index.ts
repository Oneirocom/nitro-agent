import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  // Add CORS headers
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // Handle preflight requests
  if (event.method === "OPTIONS") {
    return { ok: true };
  }

  // Ensure the request method is POST
  if (event.method !== "POST") {
    return createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }
  // Read the request body
  const body = await readBody(event);
  const { prompt, userid } = body;

  const nitro = useNitroApp();
  console.log("Starting event handler");

  // Function to emit an event and handle the response
  const testSpell = async (contentToSend) => {
    console.log(`Testing spell with contentToSend: "${contentToSend}"`);
    return new Promise((resolve, reject) => {
      // Create a channel with the userid
      const channelId = userid; // Keep track of the channel ID
      const channel = nitro.agent.channel(channelId);
      let isResolved = false;

      const cleanup = () => {
        channel.removeAllListeners("messageReceived");
        channel.removeAllListeners("error");
        isResolved = true;
      };

      const messageHandler = (response) => {
        console.log(`Received message on channel ${channelId}:`, response);
        if (isResolved) return;

        try {
          cleanup();
          resolve({
            status: "success",
            data: response.data,
            event: response.event,
          });
        } catch (error) {
          console.error(
            `Error in message handler for channel ${channelId}:`,
            error
          );
          cleanup();
          reject(error);
        }
      };

      // Attach listeners
      console.log(`Attaching listeners to channel ${channelId}`);
      channel.on("messageReceived", messageHandler);
      channel.on("error", (error) => {
        console.error(`Error on channel ${channelId}:`, error);
        cleanup();
        reject(error);
      });

      try {
        // Emit the event - make sure channel ID is consistent
        console.log(`Emitting message to agent on channel ${channelId}`);
        channel.emitToAgent(
          "message",
          nitro.agent.formatEvent({
            content: contentToSend,
            sender: userid,
            channel: channelId, // Use the same channelId here
            eventName: "message",
            skipPersist: true,
            rawData: contentToSend,
            metadata: {
              sessionId: channelId, // Use channelId for session
              timestamp: new Date().toISOString(),
            },
          })
        );
      } catch (error) {
        console.error(`Error emitting event on channel ${channelId}:`, error);
        cleanup();
        reject(error);
      }
    });
  };
  console.log("userid/prompt", userid, prompt);

  let result = "";
  try {
    console.log("Starting spell");
    result = (await testSpell(prompt)) as string;
    console.log("spell result:", result);
  } catch (error) {
    console.error("Test failed:", error);
    return {
      status: "test failed",
      error: error,
    };
  }

  return {
    message: "Data received successfully",
    prompt: prompt,
    generated: result,
  };
});
