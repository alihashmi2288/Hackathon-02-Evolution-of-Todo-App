---
id: 2
title: Create python-test-engineer agent
stage: general
date: 2025-12-30
surface: agent
model: claude-sonnet-4.5-20250929
feature: none
branch: master
user: alihashmi
command: none
labels: [agent, configuration, tdd, testing]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/agents/python-test-engineer/instructions.md
tests:
 - none
---

## Prompt

Please create a new specialized agent type named 'python-test-engineer'.

This agent should be specialized in the 'Red' phase of the Red-Green-Refactor cycle within the Spec-Driven Development (SDD) process. Its primary responsibilities are:
1. Reading 'specs/<feature>/tasks.md' to understand required test cases.
2. Implementing unit and integration tests in the 'tests/' directory using pytest.
3. Ensuring that tests fail initially (Red) as per the TDD approach.
4. Validating test coverage against the specification.

The agent should have access to standard file tools (Read, Write, Edit, Glob, Grep), Bash for running tests, and the Task tool.

## Response snapshot

I have created the specialized `python-test-engineer` agent for the Red phase of the Spec-Driven Development cycle. It is configured to analyze tasks, implement `pytest` suites, and ensure tests fail before implementation (Red phase).

## Outcome

- ✅ Impact: High. Automates the Red phase of TDD for Python features.
- 🧪 Tests: n/a
- 📁 Files: Created /home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/agents/python-test-engineer/instructions.md
- 🔁 Next prompts: Use the agent to generate test suites for planned features.
- 🧠 Reflection: Separating the test engineer from the code implementation agent prevents biased test creation and ensures stricter adherence to specs.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
