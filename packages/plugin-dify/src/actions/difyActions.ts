import {
    Action,
    IAgentRuntime,
    Memory,
    HandlerCallback,
    State,
    elizaLogger,
} from "@elizaos/core";
import { DifyService } from "../services/difyService";
import { DifyCompletionRequest } from "../types";

export const chatAction: Action = {
    name: "DIFY_CHAT",
    description: "Enviar un mensaje al chat API de Dify",
    similes: ["chat con dify", "preguntar a dify", "hablar con dify"],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return !!process.env.DIFY_API_KEY;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            elizaLogger.info("Chat con Dify:", message.content.text);
            const difyService = state.difyService as DifyService;
            if (!difyService) {
                callback({ text: "Servicio Dify no inicializado" }, []);
                return;
            }
            elizaLogger.info("V1  - Step 1 state.userId = ", state.userId);

            const request: DifyCompletionRequest = {
                user: "peli",
                query: message.content.text || "",
                conversation_id: options?.conversation_id,
                response_mode: "streaming",
            };

            elizaLogger.info("V1  - Step 2");
            if (options?.streaming) {
                const stream = difyService.streamChat(request);
                callback(
                    { text: "Iniciando respuesta en streaming..." },
                    stream
                );
                return;
            }

            elizaLogger.info("V1  - Step 3");
            const response = await difyService.chat(request);
            elizaLogger.info("V1 RESPONSE:", response);

            callback(
                {
                    text: response.answer,
                    metadata: {
                        conversation_id: response.conversation_id,
                        message_id: response.message_id,
                    },
                },
                []
            );
        } catch (error) {
            elizaLogger.error("V1 Error en chat de Dify:", error.message);
            callback(
                {
                    text: "V0 Error al obtener respuesta de Dify. Por favor, intenta de nuevo.",
                },
                []
            );
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "¿Cómo está el clima?" },
            },
            {
                user: "{{agentName}}",
                content: { text: "Verificaré el clima..." },
            },
        ],
    ],
};

export const getConversationAction: Action = {
    name: "DIFY_GET_CONVERSATION",
    description: "Obtener mensajes de una conversación de Dify",
    similes: ["obtener conversación dify", "buscar mensajes dify"],
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Obtener historial de conversación" },
            },
            {
                user: "{{agentName}}",
                content: { text: "Aquí está tu historial de conversación..." },
            },
        ],
    ],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return !!process.env.DIFY_API_KEY;
    },
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            const difyService = state.difyService as DifyService;
            if (!difyService) {
                callback({ text: "Servicio Dify no inicializado" }, []);
                return;
            }

            if (!options?.conversation_id) {
                callback(
                    {
                        text: "Se requiere ID de conversación para obtener mensajes",
                    },
                    []
                );
                return;
            }

            const conversation = await difyService.getConversation(
                options.conversation_id
            );
            callback(
                { text: "Conversación recuperada", metadata: conversation },
                []
            );
        } catch (error) {
            elizaLogger.error("Error al obtener conversación de Dify:", error);
            callback(
                {
                    text: "Error al obtener la conversación. Por favor verifica el ID y vuelve a intentar.",
                },
                []
            );
        }
    },
};

export const deleteConversationAction: Action = {
    name: "DIFY_DELETE_CONVERSATION",
    description: "Eliminar una conversación de Dify",
    similes: ["eliminar conversación dify", "borrar chat dify"],
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Eliminar esta conversación" },
            },
            {
                user: "{{agentName}}",
                content: { text: "Conversación eliminada exitosamente" },
            },
        ],
    ],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return !!process.env.DIFY_API_KEY;
    },
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            const difyService = state.difyService as DifyService;
            if (!difyService) {
                callback({ text: "Servicio Dify no inicializado" }, []);
                return;
            }

            if (!options?.conversation_id) {
                callback(
                    {
                        text: "Se requiere ID de conversación para eliminar la conversación",
                    },
                    []
                );
                return;
            }

            await difyService.deleteConversation(options.conversation_id);
            callback({ text: "Conversación eliminada exitosamente" }, []);
        } catch (error) {
            elizaLogger.error("Error al eliminar conversación de Dify:", error);
            callback(
                {
                    text: "Error al eliminar la conversación. Por favor verifica el ID y vuelve a intentar.",
                },
                []
            );
        }
    },
};

export const listConversationsAction: Action = {
    name: "DIFY_LIST_CONVERSATIONS",
    description: "Listar todas las conversaciones de Dify",
    similes: [
        "listar conversaciones dify",
        "mostrar chats dify",
        "ver conversaciones dify",
    ],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return !!process.env.DIFY_API_KEY;
    },
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            const difyService = state.difyService as DifyService;
            if (!difyService) {
                callback({ text: "Servicio Dify no inicializado" }, []);
                return;
            }

            const conversations = await difyService.listConversations();
            callback(
                {
                    text: "Lista de conversaciones recuperada",
                    metadata: { conversations },
                },
                []
            );
        } catch (error) {
            elizaLogger.error("Error al listar conversaciones de Dify:", error);
            callback(
                {
                    text: "Error al obtener la lista de conversaciones. Por favor, intenta de nuevo.",
                },
                []
            );
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Muéstrame todas mis conversaciones" },
            },
            {
                user: "{{agentName}}",
                content: { text: "Aquí están todas tus conversaciones..." },
            },
        ],
    ],
};

export const renameConversationAction: Action = {
    name: "DIFY_RENAME_CONVERSATION",
    description: "Renombrar una conversación de Dify",
    similes: ["renombrar conversación dify", "cambiar nombre chat dify"],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return !!process.env.DIFY_API_KEY;
    },
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            const difyService = state.difyService as DifyService;
            if (!difyService) {
                callback({ text: "Servicio Dify no inicializado" }, []);
                return;
            }

            if (!options?.conversation_id || !options?.name) {
                callback(
                    {
                        text: "Se requiere ID de conversación y nuevo nombre para renombrar",
                    },
                    []
                );
                return;
            }

            await difyService.renameConversation(
                options.conversation_id,
                options.name
            );
            callback(
                {
                    text: "Conversación renombrada exitosamente",
                    metadata: {
                        conversation_id: options.conversation_id,
                        new_name: options.name,
                    },
                },
                []
            );
        } catch (error) {
            elizaLogger.error(
                "Error al renombrar conversación de Dify:",
                error
            );
            callback(
                {
                    text: "Error al renombrar la conversación. Por favor verifica el ID y vuelve a intentar.",
                },
                []
            );
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Renombrar esta conversación a 'Proyecto X'" },
            },
            {
                user: "{{agentName}}",
                content: { text: "Conversación renombrada a 'Proyecto X'" },
            },
        ],
    ],
};

export const messageFeedbackAction: Action = {
    name: "DIFY_MESSAGE_FEEDBACK",
    description: "Enviar feedback sobre un mensaje de Dify",
    similes: [
        "dar feedback dify",
        "calificar respuesta dify",
        "valorar mensaje dify",
    ],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        return !!process.env.DIFY_API_KEY;
    },
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            const difyService = state.difyService as DifyService;
            if (!difyService) {
                callback({ text: "Servicio Dify no inicializado" }, []);
                return;
            }

            if (!options?.message_id || options?.rating === undefined) {
                callback(
                    {
                        text: "Se requiere ID del mensaje y calificación (like/dislike)",
                    },
                    []
                );
                return;
            }

            await difyService.messageRating(
                options.message_id,
                options.rating,
                options?.feedback_text
            );
            callback(
                {
                    text: "Feedback enviado exitosamente",
                    metadata: {
                        message_id: options.message_id,
                        rating: options.rating,
                    },
                },
                []
            );
        } catch (error) {
            elizaLogger.error("Error al enviar feedback de Dify:", error);
            callback(
                {
                    text: "Error al enviar el feedback. Por favor verifica el ID del mensaje y vuelve a intentar.",
                },
                []
            );
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Me gustó esta respuesta" },
            },
            {
                user: "{{agentName}}",
                content: { text: "Feedback positivo registrado" },
            },
        ],
    ],
};
