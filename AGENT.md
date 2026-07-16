# AGENT.md

# GymRaTs Development Guide for Codex

This file defines how Codex should work in this repository.

---

## General Principles

- Make the smallest possible change that satisfies the request.
- Follow the existing project architecture and coding style.
- Do not refactor unrelated code.
- Preserve backward compatibility unless explicitly instructed otherwise.
- Prefer modifying existing code over introducing new dependencies.
- Explain assumptions when requirements are ambiguous.

---

## Scope

Only modify files that are directly related to the requested task.

Never make unrelated changes, even if you discover issues.

Do not:

- Reformat unrelated files.
- Rename modules without instruction.
- Update dependencies unless requested.
- Change project structure unless requested.

---

## Protected Files

The following locations are considered sensitive.

Never read, inspect, modify, move, or delete anything inside:

- backend/wallet/**

Never access or expose:

- .env
- .env.*
- *.pem
- *.key
- credentials.json
- service-account*.json
- private keys
- API keys
- secrets

If a requested task requires these files, stop and ask for confirmation.

---

## Coding Style

- Follow existing project conventions.
- Keep functions focused.
- Prefer async/await.
- Avoid nested callbacks.
- Avoid unnecessary comments.
- Use descriptive variable names.
- Remove dead code only if directly related.

---

## Error Handling

- Never swallow exceptions.
- Return meaningful error messages.
- Preserve existing logging style.
- Do not expose sensitive information.

---

## Dependencies

Do not install new packages. If it explicitly requested, ask to user.

Prefer built-in Node.js APIs whenever practical.

---

## Testing

Before considering a task complete:

1. Run only the relevant tests if available.
2. Run lint if configured.
3. Ensure no existing functionality is broken.

If tests cannot be executed, explain why.

Never modify tests merely to make them pass.

---

## Git

Unless explicitly requested:

- Do not commit.
- Do not push.
- Do not create branches.
- Do not create pull requests.

Only produce file modifications.

---

## Security

Never print:

- secrets
- tokens
- passwords
- private keys
- environment variables

If sensitive information appears, redact it.

---

## Database

Do not:

- modify schema
- create migrations
- alter production configuration

If it explicitly instructed, ask to user.

---

## Performance

Prefer solutions with:

- minimal allocations
- readable implementation
- maintainable architecture

Do not prematurely optimize.

---

## Communication

Before making large changes:

- briefly explain the plan.

After finishing:

- summarize modified files.
- explain important design decisions.
- mention anything that still requires manual verification.

Keep responses concise and technical.

---

## Priority Order

When rules conflict, follow this order:

1. User instructions
2. Protected Files
3. Repository architecture
4. Existing coding style
5. This document