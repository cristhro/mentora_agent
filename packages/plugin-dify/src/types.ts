export interface DifyConfig {
    apiKey: string;
    baseURL?: string;
}

export interface DifyCompletionRequest {
    query: string;
    user?: string;
    conversation_id?: string;
    response_mode?: "streaming" | "blocking";
}

export interface DifyCompletionResponse {
    answer: string;
    conversation_id: string;
    message_id: string;
    created_at: number;
}

export interface DifyError {
    message: string;
    code?: string;
    details?: any;
}

export interface DifyConversation {
    id: string;
    name: string;
    inputs: Record<string, any>;
    status: string;
    created_at: number;
    updated_at?: number;
}

export interface DifyMessage {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: number;
}

export interface DifyFeedback {
    message_id: string;
    rating: boolean;
    text?: string;
    created_at?: number;
}

export interface DifyApiResponse<T> {
    data: T;
    has_more: boolean;
    limit: number;
    total: number;
    cursor?: string;
}

export interface DifyMessageResponse {
    event: string;
    message_id: string;
    conversation_id: string;
    answer: string;
    created_at: number;
}

export interface DifyStreamChunk {
    event: string;
    data: {
        text: string;
    };
}
