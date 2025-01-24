import { Plugin } from "@elizaos/core";
import { sendMessageAction } from "./actions/sendMessage";

export const difyPlugin: Plugin = {
    name: "dify",
    description: "Plugin para integración con Dify.ai",
    actions: [sendMessageAction],
    evaluators: [], // Se implementarán los evaluadores necesarios
    providers: [], // Se implementarán los proveedores de contexto
    services: [], // Se implementarán los servicios adicionales si son necesarios
};

export default difyPlugin;
