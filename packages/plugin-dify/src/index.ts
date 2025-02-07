import { Plugin } from "@elizaos/core";
import {
    chatAction,
    getConversationAction,
    deleteConversationAction,
} from "./actions/difyActions";
import { difyProvider } from "./providers/difyProvider";

export * from "./types";
export * from "./services/difyService";
export * from "./actions/difyActions";
export * from "./providers/difyProvider";

export const difyPlugin: Plugin = {
    name: "dify",
    description: "Plugin para integración con Dify API",
    actions: [chatAction, getConversationAction, deleteConversationAction],
    providers: [difyProvider],
    evaluators: [],
    services: [],
    clients: [],
};

export default difyPlugin;
