import { grimoire } from "@magickml/nitro-module";

export default defineNitroConfig({
  srcDir: "agent",
  modules: [grimoire],

  //   compatibilityDate: '2024-06-17', // for v3 we will need this
  // modules: [AgentModule],
  runtimeConfig: {
    // projectId: "default",
    // LLMProvider: () => {
    //   console.log("TEST");
    // },
    // server: {
    //   port: process.env.PORT || 3000,
    //   host: "0.0.0.0",
    // },
  },

  compatibilityDate: "2024-11-27",
});