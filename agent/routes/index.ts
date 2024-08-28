import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const nitro = useNitroApp();
  console.log("Starting event handler");

  // Function to emit an event and handle the response
  const testSpell = async (expectedContent) => {
    console.log(`Testing spell with expected content: "${expectedContent}"`);
    return new Promise((resolve, reject) => {
      // Set a listener for the 'messageReceived' event
      const messageHandler = (response) => {
        console.log("Received message:", response);
        try {
          // Check if the response matches the expected content
          if (response.data.content === expectedContent) {
            console.log("Response matches expected content");
            // Unsubscribe from further messageReceived events for this test
            nitro.agent.off("messageReceived", messageHandler);
            resolve({
              status: "success",
              data: response.data,
              event: response.event,
            });
          } else {
            console.log("Response does not match expected content");
          }
        } catch (error) {
          console.error("Error in message handler:", error);
          nitro.agent.off("messageReceived", messageHandler);
          reject(error);
        }
      };

      // Attach the message handler
      nitro.agent.on("messageReceived", messageHandler);
      console.log("Message handler attached");

      // Emit the event to trigger the spell
      console.log("Emitting trigger event");
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
    console.log("Starting tests");
    // Test the first spell (assuming it responds with "Hello World")
    const result1 = await testSpell("Hello World");
    console.log("First test result:", result1);

    // Test the second spell (assuming it responds with "done")
    const result2 = await testSpell("done");
    console.log("Second test result:", result2);

    console.log("All tests completed successfully");
    return {
      status: "all tests passed",
      results: [result1, result2],
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      status: "test failed",
      error: error,
    };
  }
});
