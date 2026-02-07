# Todo AI Backend

The backend service for the Todo AI Chatbot, built with **FastAPI**, **SQLModel**, and **MCP**.

## Architecture

*   **FastAPI**: Handles HTTP requests (REST API).
*   **SQLModel**: ORM for PostgreSQL interactions.
*   **MCP Server**: `fastmcp` (Model Context Protocol) defines tools (`add_task`, `list_tasks`, etc.) that the AI can use.
*   **Gemini Agent**: Uses `openai-agents` (with Google Gemini via adapter) to process natural language queries and call MCP tools.

## Setup

1.  **Create Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file:
    ```ini
    DATABASE_URL=postgresql://user:pass@host/dbname
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run Server**:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```

## Key Files

*   `app/agent.py`: Defines the `Todo Agent` and configures the Gemini model.
*   `app/mcp_server.py`: Defines the MCP tools (the "skills" of the agent).
*   `app/routers/chat.py`: The API endpoint that receives messages, creates a user-scoped agent, and returns the response.
