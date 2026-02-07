export interface ChatRequest {
    conversation_id?: string;
    message: string;
}

export interface ChatResponse {
    conversation_id: string;
    response: string;
    tool_calls: any[];
}

/**
 * Task Reference: T008 (007-ai-todo-chatbot)
 */
export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export interface ChatHistoryResponse {
    conversation_id: string;
    messages: ChatMessage[];
}
