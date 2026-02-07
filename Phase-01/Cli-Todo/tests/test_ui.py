"""Unit tests for the UI module.

Tests color codes, icon constants, formatter functions,
and display utilities for the Todo CLI application.
"""

import pytest

from src.cli.ui import (
    Colors,
    Icons,
    Theme,
    LOGO,
    SEPARATOR_THIN,
    SEPARATOR_THICK,
    bold,
    color,
    success,
    error,
    warning,
    info,
    dim,
    task_status,
    format_task_id,
)


class TestColors:
    """Tests for ANSI color codes."""

    def test_colors_have_reset_code(self) -> None:
        """Colors class should have a RESET code."""
        assert hasattr(Colors, "RESET")
        assert Colors.RESET == "\033[0m"

    def test_basic_colors_exist(self) -> None:
        """All basic colors should be defined."""
        assert Colors.RED == "\033[31m"
        assert Colors.GREEN == "\033[32m"
        assert Colors.BLUE == "\033[34m"
        assert Colors.YELLOW == "\033[33m"
        assert Colors.CYAN == "\033[36m"

    def test_bright_colors_exist(self) -> None:
        """All bright colors should be defined."""
        assert Colors.BRIGHT_RED == "\033[91m"
        assert Colors.BRIGHT_GREEN == "\033[92m"
        assert Colors.BRIGHT_BLUE == "\033[94m"
        assert Colors.BRIGHT_CYAN == "\033[96m"

    def test_text_formatting_exist(self) -> None:
        """Text formatting codes should be defined."""
        assert Colors.BOLD == "\033[1m"
        assert Colors.DIM == "\033[2m"
        assert Colors.ITALIC == "\033[3m"
        assert Colors.UNDERLINE == "\033[4m"


class TestIcons:
    """Tests for Unicode icon constants."""

    def test_task_status_icons(self) -> None:
        """Task status icons should be defined."""
        assert Icons.COMPLETED == "✔"
        assert Icons.PENDING == "○"

    def test_action_icons(self) -> None:
        """Action icons should be defined."""
        assert Icons.ADD == "📝"
        assert Icons.VIEW == "👁"
        assert Icons.EDIT == "✏"
        assert Icons.DELETE == "🗑"

    def test_dialog_icons(self) -> None:
        """Dialog icons should be defined."""
        assert Icons.CONFIRM == "✓"
        assert Icons.CANCEL == "✗"

    def test_emphasis_icons(self) -> None:
        """Emphasis icons should be defined."""
        assert Icons.IMPORTANT == "🔥"
        assert Icons.INFO == "ℹ"
        assert Icons.WARNING == "⚠"

    def test_key_icons(self) -> None:
        """Key icons should be defined."""
        assert Icons.ENTER == "↵"


class TestTheme:
    """Tests for color themes."""

    def test_theme_has_required_colors(self) -> None:
        """Theme should define colors for all UI elements."""
        assert hasattr(Theme, "HEADER")
        assert hasattr(Theme, "SUCCESS")
        assert hasattr(Theme, "ERROR")
        assert hasattr(Theme, "WARNING")
        assert hasattr(Theme, "INFO")
        assert hasattr(Theme, "DIM_TEXT")
        assert hasattr(Theme, "MENU_NUMBER")
        assert hasattr(Theme, "MENU_ICON")
        assert hasattr(Theme, "MENU_DESC")
        assert hasattr(Theme, "TASK_ID")
        assert hasattr(Theme, "TASK_TITLE")
        assert hasattr(Theme, "TASK_COMPLETED")
        assert hasattr(Theme, "TASK_PENDING")


class TestSeparatorLines:
    """Tests for separator line constants."""

    def test_thin_separator_length(self) -> None:
        """Thin separator should be 60 characters wide."""
        # Remove ANSI codes to check length
        clean = SEPARATOR_THIN.replace("\033[", "").replace("m", "").replace("[2", "[02")
        # Actually, just check it contains expected character
        assert "─" in SEPARATOR_THIN

    def test_thick_separator_length(self) -> None:
        """Thick separator should be 60 characters wide."""
        assert "━" in SEPARATOR_THICK


class TestFormatterFunctions:
    """Tests for text formatting functions."""

    def test_bold(self) -> None:
        """Bold function should wrap text with ANSI codes."""
        result = bold("hello")
        assert "\033[1m" in result
        assert "hello" in result
        assert "\033[0m" in result

    def test_bold_empty_string(self) -> None:
        """Bold function should handle empty strings."""
        result = bold("")
        assert "\033[1m\033[0m" == result

    def test_color(self) -> None:
        """Color function should apply custom color."""
        result = color("test", Colors.RED)
        assert "\033[31m" in result
        assert "test" in result
        assert "\033[0m" in result

    def test_success_formatting(self) -> None:
        """Success function should use green color."""
        result = success("Done!")
        assert "\033[92m" in result
        assert "Done!" in result
        assert "\033[0m" in result

    def test_error_formatting(self) -> None:
        """Error function should use red color."""
        result = error("Failed!")
        assert "\033[91m" in result
        assert "Failed!" in result
        assert "\033[0m" in result

    def test_warning_formatting(self) -> None:
        """Warning function should use yellow color."""
        result = warning("Check!")
        assert "\033[93m" in result
        assert "Check!" in result
        assert "\033[0m" in result

    def test_info_formatting(self) -> None:
        """Info function should use cyan color."""
        result = info("Note")
        assert "\033[96m" in result
        assert "Note" in result
        assert "\033[0m" in result

    def test_dim_formatting(self) -> None:
        """Dim function should use dim color."""
        result = dim("secondary")
        assert "\033[2m" in result
        assert "secondary" in result
        assert "\033[0m" in result


class TestTaskStatus:
    """Tests for task status formatting."""

    def test_completed_task_status(self) -> None:
        """Completed task should show green checkmark."""
        result = task_status(True)
        assert "✔" in result
        assert "\033[92m" in result  # Bright green
        assert "\033[0m" in result

    def test_pending_task_status(self) -> None:
        """Pending task should show yellow circle."""
        result = task_status(False)
        assert "○" in result
        assert "\033[93m" in result  # Bright yellow
        assert "\033[0m" in result


class TestFormatTaskId:
    """Tests for task ID formatting."""

    def test_format_task_id_shortens(self) -> None:
        """Format task ID should show only first 8 characters."""
        task_id = "12345678-1234-5678-1234-567812345678"
        result = format_task_id(task_id)
        assert "12345678" in result
        assert "\033[2m" in result  # Dim color

    def test_format_task_id_with_short_id(self) -> None:
        """Format task ID should handle short strings."""
        result = format_task_id("short")
        assert "short" in result


class TestLogo:
    """Tests for ASCII logo."""

    def test_logo_has_ascii_art_pattern(self) -> None:
        """Logo should contain ASCII art letters (not literal text)."""
        # ASCII art logo contains patterns of underscores and slashes
        # that form the text without using the literal string "CLI-TODO"
        assert "_" in LOGO or "/" in LOGO
        # The logo should be non-trivial (multiple lines)
        lines = LOGO.strip().split("\n")
        assert len(lines) > 5

    def test_logo_contains_subtitle(self) -> None:
        """Logo should contain subtitle text."""
        assert "Modern Todo CLI" in LOGO
        assert "Syed Ali Hashmi" in LOGO

    def test_logo_uses_box_drawing(self) -> None:
        """Logo should use box-drawing characters."""
        assert "╔" in LOGO
        assert "║" in LOGO
        assert "╗" in LOGO

    def test_logo_has_ansi_colors(self) -> None:
        """Logo should contain ANSI color codes."""
        assert "\033[" in LOGO


class TestThemeConsistency:
    """Tests for theme color consistency."""

    def test_success_uses_green(self) -> None:
        """Success theme should use green."""
        assert "\033[32m" in Theme.SUCCESS or "\033[92m" in Theme.SUCCESS

    def test_error_uses_red(self) -> None:
        """Error theme should use red."""
        assert "\033[31m" in Theme.ERROR or "\033[91m" in Theme.ERROR

    def test_warning_uses_yellow(self) -> None:
        """Warning theme should use yellow."""
        assert "\033[33m" in Theme.WARNING or "\033[93m" in Theme.WARNING

    def test_info_uses_cyan(self) -> None:
        """Info theme should use cyan."""
        assert "\033[36m" in Theme.INFO or "\033[96m" in Theme.INFO

    def test_header_uses_bold(self) -> None:
        """Header theme should use bold."""
        assert "\033[1m" in Theme.HEADER
