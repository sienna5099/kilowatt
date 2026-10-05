# Judging Criteria

## AI Tool Usage

The assistant reads actual customer and interaction records and returns a contextual summary, next-step suggestion, and email draft. The UI and API label the current implementation as rule-based demo mode; no provider usage is claimed.

## Codebase Quality

The React interface is split into reusable navigation, status, service, and page modules. Express routes use parameterized SQL, field validation, generic client errors, and a transaction for contact intake plus its initial activity.

## Documentation

The root README explains the problem, solution, stack, setup, architecture, and demo. The `docs/` directory includes architecture, API, assistant guardrails, a demo script, and this judging map.

## Video Presentation

Follow [demo-script.md](demo-script.md) to show the contact form through to persisted customer activity and an AI-assisted next step. Use fictional data and do not show `.env` credentials.

## Agentic AI

The controlled assistant fetches customer context and recommends a next step. It does not autonomously contact customers. Any future external action must require explicit human confirmation.

## Execution Quality

The primary path is verifiable end to end: React submits JSON to Express, Express stores a customer and form activity in MySQL, and the dashboard/profile read those records back. Error, empty, validation, loading, and demo-mode states are present. Confirm the database connection and API before presenting.