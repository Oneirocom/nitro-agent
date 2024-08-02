import { grimoire } from "@magickml/nitro-module";

export default defineNitroConfig({
  srcDir: "agent",
  modules: [grimoire],
  //   compatibilityDate: '2024-06-17', // for v3 we will need this
  // modules: [AgentModule],
  runtimeConfig: {
    agentId: "56fc9cf8-0dd0-491a-9493-9cd145760a58",
    LLMProvider: () => {
      console.log("TEST");
    },
  },
});
