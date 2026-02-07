import Link from "next/link";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Back + Logo */}
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href="/todos"
                                className="p-2 rounded-xl text-primary-200 hover:text-white hover:bg-white/10 transition-all"
                                title="Back to Tasks"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>

                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center shadow-lg group-hover:shadow-primary-900/40 transition-all duration-300">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="font-display text-lg font-bold text-white tracking-tight hidden sm:block">
                                    ClearDay
                                </span>
                            </Link>

                            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-primary-200/60">
                                <h1 className="text-sm font-medium text-primary-200 bg-white/10 px-2 py-0.5 rounded-md">
                                    AI Assistant
                                </h1>
                            </div>
                        </div>

                        {/* Right: Tasks link */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/todos"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-primary-200 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="hidden sm:inline">My Tasks</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat */}
            <div className="flex-1 container mx-auto py-8 px-4 flex justify-center items-center">
                <ChatInterface />
            </div>
        </div>
    );
}
