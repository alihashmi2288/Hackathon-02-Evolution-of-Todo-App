# Todo AI Frontend

The frontend application for the Todo AI Chatbot, built with **Next.js 16 (App Router)** and **Tailwind CSS**.

## Features

*   **Chat Interface**: A dedicated page (`/chat`) for communicating with the AI agent.
*   **Todo Management**: Standard UI for managing todos (list, add, edit, delete).
*   **Authentication**: Integrated with Better Auth.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file:
    ```ini
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Key Components

*   `src/app/chat/page.tsx`: The main chat page.
*   `src/components/chat/ChatInterface.tsx`: The interactive chat UI component.
*   `src/services/api.ts`: API client for communicating with the FastAPI backend.
