# API Reference

Base URL: `http://localhost:5000` (or the configured backend port). JSON responses are used throughout. Database failures return a friendly message; SQL details are logged on the server only.

## Customers

- `GET /api/customers` returns customers, newest first. Optional query parameters: `search` (name, email, company) and `status`.
- `GET /api/customers/:id` returns one customer or `404`.
- `POST /api/customers` creates a `New` lead and its `Form Submission` interaction transactionally. Required fields: `name`, `email`. Optional: `phone`, `company`, `interested_service`, `message`.
- `PUT /api/customers/:id/status` updates a lead status and records a `Status Change` interaction. Allowed statuses: `New`, `Contacted`, `Qualified`, `Won`, `Lost`.

Example create request:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.test",
  "phone": "555-0100",
  "company": "Northstar Studio",
  "interested_service": "Website Development",
  "message": "We are planning a new company website."
}
```

## Activity

- `GET /api/customers/:id/interactions` returns a customer timeline, newest first.
- `POST /api/customers/:id/interactions` adds an activity with `type` and `description`. Supported types: `Email`, `WhatsApp`, `Call`, `Meeting`, `Note`.
- `GET /api/activity` returns the latest 100 activities with customer names.

## Follow-ups

- `GET /api/followups` returns follow-ups with customer name and email.
- `POST /api/customers/:id/followups` creates a follow-up. Required fields: `followup_date` (`YYYY-MM-DD`) and `note`; new items are `Pending`.
- `PUT /api/followups/:id/status` sets status to `Pending` or `Completed`.

## Dashboard and Assistant

- `GET /api/dashboard` returns live customer/lead counts, open follow-up count, and six recent activities.
- `GET /api/assistant/customers/:id` returns the customer record, up to five interactions, a concise summary, a suggested next step, and an email draft. Response includes `mode: "demo"`; the draft is never sent.
- `GET /` returns a small backend health response.