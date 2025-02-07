import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { DifyService } from "../services/difyService";

export const difyProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
        const difyService = new DifyService();
        await difyService.initialize(runtime);

        // Actualizamos el estado con el servicio
        state.difyService = difyService;

        return {
            difyService,
        };
    },
};
