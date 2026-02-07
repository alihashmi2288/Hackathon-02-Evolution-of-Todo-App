import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-80px)]">
            <ChatInterface />
        </div>
    );
}
