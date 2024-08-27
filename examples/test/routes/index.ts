import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const nitro = useNitroApp();

  // Function to emit an event and handle the response
  const testSpell = async (expectedContent) => {
    return new Promise((resolve, reject) => {
      // Set a listener for the 'messageReceived' event
      const messageHandler = (response) => {
        try {
          // Check if the response matches the expected content
          if (response.data.content === expectedContent) {
            // Unsubscribe from further messageReceived events for this test
            nitro.agent.off("messageReceived", messageHandler);
            resolve({
              status: "success",
              data: response.data,
              event: response.event,
            });
          }
        } catch (error) {
          nitro.agent.off("messageReceived", messageHandler);
          reject(error);
        }
      };

      // Attach the message handler
      nitro.agent.on("messageReceived", messageHandler);

      // Emit the event to trigger the spell
      nitro.agent.emit(
        "message",
        nitro.agent.formatEvent({
          content: "trigger event", // The content that triggers the spell
          sender: "user",
          channel: "agent",
          eventName: "message",
          skipPersist: true,
          rawData: "trigger event",
        })
      );
    });
  };

  try {
    // Test the first spell (assuming it responds with "Hello World")
    const result1 = await testSpell("Hello World");

    // Test the second spell (assuming it responds with "done")
    const result2 = await testSpell("done");

    return {
      status: "all tests passed",
      results: [result1, result2],
    };
  } catch (error) {
    return {
      status: "test failed",
      error: error,
    };
  }
});
