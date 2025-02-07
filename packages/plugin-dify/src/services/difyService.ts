import { Service, IAgentRuntime, ServiceType } from "@elizaos/core";
import axios, { AxiosInstance } from "axios";
import {
    DifyConfig,
    DifyCompletionRequest,
    DifyCompletionResponse,
    DifyError,
    DifyStreamChunk,
} from "../types";

export interface IDifyService {
    chat(request: DifyCompletionRequest): Promise<DifyCompletionResponse>;
    streamChat(request: DifyCompletionRequest): AsyncGenerator<DifyStreamChunk>;
    getConversation(conversationId: string): Promise<any>;
    deleteConversation(conversationId: string): Promise<void>;
    listConversations(): Promise<any>;
    renameConversation(conversationId: string, name: string): Promise<void>;
    messageRating(
        messageId: string,
        rating: boolean,
        feedbackText?: string
    ): Promise<void>;
}

export class DifyService extends Service implements IDifyService {
    private client: AxiosInstance;

    static get serviceType(): ServiceType {
        return ServiceType.TEXT_GENERATION;
    }

    get serviceType(): ServiceType {
        return ServiceType.TEXT_GENERATION;
    }

    async initialize(runtime: IAgentRuntime): Promise<void> {
        const apiKey = runtime.getSetting("DIFY_API_KEY");
        const baseURL =
            runtime.getSetting("DIFY_BASE_URL") || "https://api.dify.ai/v1";

        if (!apiKey) {
            throw new Error("DIFY_API_KEY is required");
        }

        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
    }

    private cleanMessage(message: string): string {
        return message
            .replace(/^!dify\s*/i, "")
            .trim()
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    }

    private sanitizeResponse(text: string): string {
        return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    }

    async chat(
        request: DifyCompletionRequest
    ): Promise<DifyCompletionResponse> {
        try {
            const cleanedQuery = this.cleanMessage(request.query);
            const payload = {
                inputs: {},
                query: cleanedQuery,
                user: request.user || "default",
                conversation_id: request.conversation_id,
                response_mode: request.response_mode || "blocking",
            };

            const response = await this.client.post("/chat-messages", payload);

            const sanitizedAnswer = this.sanitizeResponse(
                response.data.answer || ""
            );

            return {
                answer: sanitizedAnswer,
                conversation_id: response.data.conversation_id,
                message_id: response.data.message_id || response.data.id,
                created_at:
                    response.data.created_at || Math.floor(Date.now() / 1000),
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    `Dify API error: ${error.response.data.message || error.message}`
                );
            }
            throw error;
        }
    }

    async *streamChat(
        request: DifyCompletionRequest
    ): AsyncGenerator<DifyStreamChunk> {
        try {
            const cleanedQuery = this.cleanMessage(request.query);
            const payload = {
                inputs: {},
                query: cleanedQuery,
                user: request.user || "default",
                conversation_id: request.conversation_id,
                response_mode: "streaming",
            };

            const response = await this.client.post("/chat-messages", payload, {
                responseType: "stream",
            });

            const stream = response.data;
            for await (const chunk of stream) {
                const lines = chunk.toString().split("\n").filter(Boolean);
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const cleanLine = this.sanitizeResponse(
                                line.slice(6)
                            );
                            const parsedData = JSON.parse(cleanLine);

                            if (!parsedData.conversation_id) {
                                console.error(
                                    "Missing conversation_id in stream response"
                                );
                                continue;
                            }

                            const streamChunk: DifyStreamChunk = {
                                event: parsedData.event || "message",
                                data: {
                                    text: this.sanitizeResponse(
                                        parsedData.answer || ""
                                    ),
                                },
                            };

                            yield streamChunk;
                        } catch (parseError) {
                            console.error(
                                "Error parsing stream chunk:",
                                parseError
                            );
                            continue;
                        }
                    }
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    `Dify streaming error: ${error.response.data.message || error.message}`
                );
            }
            throw error;
        }
    }

    async getConversation(conversationId: string) {
        try {
            const response = await this.client.get(`/messages`, {
                params: {
                    conversation_id: conversationId,
                    limit: 100,
                    first_id: null,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message ||
                        "Failed to fetch conversation"
                );
            }
            throw error;
        }
    }

    async deleteConversation(conversationId: string) {
        try {
            await this.client.delete(`/conversations/${conversationId}`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message ||
                        "Failed to delete conversation"
                );
            }
            throw error;
        }
    }

    async listConversations() {
        try {
            const response = await this.client.get("/conversations", {
                params: {
                    limit: 100,
                    first_id: null,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message ||
                        "Failed to list conversations"
                );
            }
            throw error;
        }
    }

    async renameConversation(conversationId: string, name: string) {
        try {
            await this.client.patch(`/conversations/${conversationId}`, {
                name: name,
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message ||
                        "Failed to rename conversation"
                );
            }
            throw error;
        }
    }

    async messageRating(
        messageId: string,
        rating: boolean,
        feedbackText?: string
    ) {
        try {
            await this.client.post(`/messages/${messageId}/feedbacks`, {
                rating: rating,
                text: feedbackText,
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(
                    error.response.data.message ||
                        "Failed to submit message feedback"
                );
            }
            throw error;
        }
    }
}
