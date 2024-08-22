import { grimoire } from "@magickml/nitro-module";

export default defineNitroConfig({
  srcDir: "agent",
  modules: [grimoire],
  //   compatibilityDate: '2024-06-17', // for v3 we will need this
  // modules: [AgentModule],
  runtimeConfig: {
    id: "e9005717-d02c-4399-9740-ced783c727b3",
    projectId: "clzd9ymf30001dvsxf9r08exv",
    LLMProvider: () => {
      console.log("TEST");
    },
  },
});
