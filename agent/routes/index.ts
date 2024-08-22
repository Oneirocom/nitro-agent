import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const nitro = useNitroApp();

  nitro.agent.emit(
    "message",
    nitro.agent.formatEvent({
      content: "Hello from the agent!",
      channel: "default",
      client: "web",
      channelType: "text",
      sender: "agent",
      eventName: "message",
    })
  );

  return new Promise((resolve, reject) => {
    nitro.agent.on("messageReceived", (event) => {
      resolve(event);
    });
  });
});
