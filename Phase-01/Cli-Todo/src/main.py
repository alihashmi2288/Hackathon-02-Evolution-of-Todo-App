"""Entry point for the Todo CLI application."""

from src.cli import run_cli_loop
from src.services import TodoService


def main() -> None:
    """Main entry point for the application."""
    service = TodoService()
    run_cli_loop(service)


if __name__ == "__main__":
    main()
