import {
    Action,
    Memory,
    State,
    IAgentRuntime,
    ActionExample,
} from "@elizaos/core";
import axios from "axios";

// Constantes
const DIFY_API_ENDPOINT =
    process.env.DIFY_BASE_URL || "http://app.dify.superagentai.online/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// Interfaces para tipado
interface DifyResponse {
    answer: string;
    conversation_id?: string;
    message_id?: string;
}

interface DifyConversationState extends State {
    difyConversationId?: string;
    lastMessageTimestamp?: number;
}

export const sendMessageAction: Action = {
    name: "sendMessage",
    description:
        "Envía un mensaje a Dify.ai para obtener una respuesta del asistente virtual",
    similes: [
        "enviar mensaje a dify",
        "preguntar a dify",
        "consultar con dify",
        "obtener respuesta de dify",
        "chatear con dify",
        "hablar con dify",
    ],
    examples: [
        [
            {
                user: "usuario1",
                content: {
                    text: "!dify ¿cuál es el clima hoy?",
                    action: "sendMessage",
                },
            },
        ],
        [
            {
                user: "usuario1",
                content: {
                    text: "!dify ¿lloverá mañana?",
                    action: "sendMessage",
                },
            },
        ],
    ],
    validate: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: DifyConversationState
    ): Promise<boolean> => {
        // Validar que el mensaje comience con !dify
        if (!message.content.text.toLowerCase().startsWith("!dify")) {
            return false;
        }

        // Validar que haya un mensaje después del prefijo
        const userMessage = message.content.text.slice(6).trim();
        if (!userMessage) {
            return false;
        }

        // Validar que no se exceda la frecuencia de mensajes (opcional)
        if (state?.lastMessageTimestamp) {
            const timeSinceLastMessage =
                Date.now() - state.lastMessageTimestamp;
            if (timeSinceLastMessage < 1000) {
                // 1 segundo entre mensajes
                return false;
            }
        }

        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: DifyConversationState
    ): Promise<any> => {
        try {
            // Verificar que tenemos la API key
            if (!DIFY_API_KEY) {
                throw new Error(
                    "DIFY_API_KEY no está configurada en las variables de entorno"
                );
            }

            // Extraer el mensaje real (remover el prefijo !dify)
            const userMessage = message.content.text.slice(6).trim();

            // Actualizar timestamp del último mensaje
            if (state) {
                state.lastMessageTimestamp = Date.now();
            }

            // Configurar la petición a Dify.ai
            const response = await axios.post<DifyResponse>(
                `${DIFY_API_ENDPOINT}/chat-messages`,
                {
                    query: userMessage,
                    response_mode: "blocking", // Modo síncrono
                    conversation_id: state?.difyConversationId, // Mantener contexto si existe
                    user: message.userId, // Identificar al usuario
                },
                {
                    headers: {
                        Authorization: `Bearer ${DIFY_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30000, // 30 segundos de timeout
                }
            );

            // Actualizar el estado con el ID de conversación
            if (response.data.conversation_id && state) {
                state.difyConversationId = response.data.conversation_id;
            }

            // Formatear y retornar la respuesta
            return {
                text: `[Dify] ${response.data.answer}`,
                action: "sendMessage",
                metadata: {
                    conversationId: response.data.conversation_id,
                    messageId: response.data.message_id,
                    timestamp: Date.now(),
                },
            };
        } catch (error) {
            console.error("Error en sendMessage action:", error);

            // Manejar diferentes tipos de errores
            let errorMessage =
                "Lo siento, hubo un error al procesar tu mensaje con Dify.";
            let errorCode = "UNKNOWN_ERROR";

            if (axios.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                    errorMessage =
                        "La conexión con Dify ha excedido el tiempo de espera.";
                    errorCode = "TIMEOUT_ERROR";
                } else if (error.response?.status === 401) {
                    errorMessage =
                        "Error de autenticación con Dify. Verifica tu API key.";
                    errorCode = "AUTH_ERROR";
                } else if (error.response?.status === 429) {
                    errorMessage =
                        "Has excedido el límite de peticiones a Dify.";
                    errorCode = "RATE_LIMIT_ERROR";
                } else if (error.response?.status === 400) {
                    errorMessage =
                        "La solicitud a Dify no es válida. Verifica el formato del mensaje.";
                    errorCode = "INVALID_REQUEST";
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
                errorCode = "RUNTIME_ERROR";
            }

            return {
                text: errorMessage,
                action: "sendMessage",
                error: true,
                metadata: {
                    errorCode,
                    timestamp: Date.now(),
                },
            };
        }
    },
};
