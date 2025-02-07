export interface DifyConfig {
    apiKey: string;
    baseURL: string;
}

export interface DifyMessage {
    role: "user" | "assistant";
    content: string;
}

export interface DifyConversation {
    conversation_id?: string;
    messages: DifyMessage[];
}

export interface DifyCompletionRequest {
    inputs?: Record<string, any>;
    query: string;
    response_mode?: "blocking" | "streaming";
    conversation_id?: string;
    user?: string;
}

export interface DifyCompletionResponse {
    answer: string;
    conversation_id: string;
    created_at: number;
    message_id: string;
}

export interface DifyStreamChunk {
    event: "message" | "error" | "done";
    data?: {
        text?: string;
        error?: string;
    };
}

export interface DifyError {
    code: string;
    message: string;
}
