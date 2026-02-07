---
id: 3
title: Create Phase I Constitution
stage: constitution
date: 2025-12-30
surface: agent
model: claude-sonnet-4.5-20250929
feature: none
branch: master
user: alihashmi
command: /sp.constitution
labels: [constitution, sdd, hackathon, phase-1]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/memory/constitution.md
tests:
 - none
---

## Prompt

create a constitution.md for a python cli todo app strictly using sdd development using speckit plus this is the project info
Phase I: Todo In-Memory Python Console App
Basic Level Functionality
Objective: Build a command-line todo application that stores tasks in memory using Claude Code and Spec-Kit Plus.
💡Development Approach: Use the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding allowed. We will review the process, prompts, and iterations to judge each phase and project.
Requirements
Implement all 5 Basic Level features (Add, Delete, Update, View, Mark Complete)
Use spec-driven development with Claude Code and Spec-Kit Plus
Follow clean code principles and proper Python project structure
Technology Stack
UV
Python 3.13+
Claude Code
Spec-Kit Plus
Deliverables
GitHub repository with:
Constitution file
specs history folder containing all specification files
/src folder with Python source code
README.md with setup instructions
CLAUDE.md with Claude Code instructions
Phase I
In-Memory Python Console App
Python, Claude Code, Spec-Kit Plus
Bonus Feature
Reusable Intelligence – Create and use reusable intelligence via Claude Code Subagents and Agent Skills
THIS IS MY HACAKTHON PHASE 1

## Response snapshot

I have created the project constitution at `.specify/memory/constitution.md` for Phase I of the Hackathon. The document establishes the binding "No manual coding" rule, enforces the SDD workflow (Spec-Plan-Tasks-Implement), and defines the tech stack (UV, Python 3.13+, pytest). It also integrates the specialized sub-agents (Spec Architect, Test Engineer, Clean Code Agent) as core principles for reusable intelligence.

## Outcome

- ✅ Impact: Strategic. Establishes the governing rules for the entire Hackathon Phase I.
- 🧪 Tests: n/a
- 📁 Files: Updated /home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/memory/constitution.md
- 🔁 Next prompts: Use /sp.specify to start the first feature specification.
- 🧠 Reflection: Explicitly forbidding manual coding in the constitution ensures that the agentic workflow is the only path to production, which is a key requirement of the hackathon.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
