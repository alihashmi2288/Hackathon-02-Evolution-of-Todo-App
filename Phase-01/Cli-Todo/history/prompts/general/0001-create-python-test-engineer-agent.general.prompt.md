---
id: 0001
title: Create python test engineer agent
stage: general
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: alihashmi
command: create-agent
labels: [agent-creation, testing, python]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/agents/python-test-engineer/instructions.md
tests:
 - null
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

I have created the specialized `python-test-engineer` agent.

### 📁 New Agent Directory
Created: `/home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/agents/python-test-engineer/`

### 📄 Instructions Created
Created: `/home/alihashmi/Hackathon-02/Phase-01/Cli-Todo/.specify/agents/python-test-engineer/instructions.md` containing core responsibilities:
- **Spec Analysis**: Monitoring `specs/<feature>/tasks.md`.
- **Test Implementation**: Using `pytest` within `tests/`.
- **Red Phase Validation**: Ensuring initial failures.

## Outcome

- ✅ Impact: Established a new specialized agent role for the 'Red' phase of SDD.
- 🧪 Tests: n/a
- 📁 Files: Created instructions.md in .specify/agents/python-test-engineer/
- 🔁 Next prompts: None
- 🧠 Reflection: The agent is now defined with clear boundaries between specimen analysis and TDD execution.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
