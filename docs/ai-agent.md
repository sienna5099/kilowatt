# AI Assistant

## Current Mode

ConnectCRM currently uses a controlled, rule-based demo assistant. It reads a selected customer and up to five recent interactions from the CRM API, then produces a short customer summary, a suggested follow-up, and an email draft. The output is based on saved customer data; no external AI API is configured or claimed.

## Agent Workflow

1. The salesperson selects a customer.
2. The assistant fetches that customer and their recent interactions through `GET /api/assistant/customers/:id`.
3. The assistant presents the customer context and a next-step suggestion.
4. The salesperson may reveal and review a generated email draft.
5. The salesperson decides what to do next.

## Guardrails

- Suggestions and drafts are advisory, not authoritative.
- The assistant never sends email, WhatsApp messages, or calls.
- Customer communication buttons only add a clearly labelled planned activity in demo mode.
- There is no autonomous external action. Any future integration must require an explicit human confirmation immediately before sending.
- Use fictional customer records in demonstrations.

## Adding a Real AI Provider

If a provider is added, keep API credentials in backend environment variables (for example, `AI_API_KEY`) and never expose them through `VITE_*` variables or React code. Add the key to `.env.example` as an empty placeholder, keep `.env` ignored, validate model output, and preserve the confirmation requirement for external actions. The current implementation does not need an AI API key.