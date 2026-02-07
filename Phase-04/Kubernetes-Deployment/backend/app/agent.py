"""
Gemini model configuration for the AI Todo Chatbot.

Task Reference: T004 (007-ai-todo-chatbot)
Feature: 007-ai-todo-chatbot

Configures the OpenAI-compatible Gemini client and model.
Agent instances with scoped tools are created per-request in routers/chat.py.
"""

import os

from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel, set_tracing_disabled

load_dotenv()

# Disable tracing for non-OpenAI providers
set_tracing_disabled(True)

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

gemini_model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=gemini_client,
)

# Agent instructions shared across per-request agent instances
AGENT_INSTRUCTIONS = (
    "You are a helpful assistant that manages todos. "
    "Use the provided tools to add, list, complete, delete, and update tasks. "
    "When a user asks to delete, update, or complete a task by name, first use list_tasks "
    "to find the matching task ID, then perform the requested operation. "
    "Always confirm actions to the user with a clear summary of what was done. "
    "If a user's request is ambiguous or could match multiple tasks, ask for clarification. "
    "If a user sends a message unrelated to task management, respond conversationally "
    "but gently steer them back to what you can help with. "
    "When listing tasks, format them in a readable way. "
    "If no tasks exist, let the user know and suggest creating one."
)
