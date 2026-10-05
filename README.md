# ConnectCRM

## Problem

Businesses receive customer enquiries from websites but often manage customer information separately.

## Solution

ConnectCRM connects a web contact form to a CRM through a REST API and stores customer information in MySQL.

## Features

- Customer management and searchable customer profiles
- Lead pipeline with New, Contacted, Qualified, Won, and Lost stages
- Customer activity timelines and follow-up scheduling
- Website-to-CRM integration through a real REST API and MySQL database
- Customer-aware AI follow-up suggestions and email drafts in labelled demo mode
- Clearly labelled communication demo; external messages are never sent

## Technology

React, Vite, Node.js, Express, MySQL, REST API, and a rule-based AI demo mode.

## Architecture

```text
Website Contact Form
        ↓
      React
        ↓
     REST API
        ↓
  Node + Express
        ↓
      MySQL
        ↓
   CRM Dashboard
```

## Setup

Prerequisites: Node.js 20.19+ or 22.12+, npm, and MySQL. Keep the existing `connectcrm` database and tables; the optional schema script only creates missing tables.

1. Install frontend dependencies:

   ```powershell
   cd frontend
   npm install
   ```

2. Install backend dependencies:

   ```powershell
   cd ..\backend
   npm install
   ```

3. Prepare MySQL. If the existing `connectcrm` database and its `customers`, `interactions`, and `followups` tables are present, leave them as they are. For a fresh database, run `backend/schema.sql` in MySQL Workbench or from PowerShell at the project root:

    ```powershell
    Get-Content backend/schema.sql | mysql -u root -p
    ```

    The script uses `CREATE ... IF NOT EXISTS` and does not replace existing tables.

4. Configure the backend environment:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```

   Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`. Keep this file private; it is ignored by Git. The existing workspace already has its local database configuration.

   To add the fictional demonstration customers and activity, run `npm --prefix backend run seed` from the project root. This is safe to repeat and does not run automatically when the server starts.

5. (Optional) Copy `frontend/.env.example` to `frontend/.env.local` if the backend runs on a non-default port. Set `VITE_API_PROXY_TARGET` to the backend origin. The frontend sends requests through `/api`; API configuration stays centralized.

6. Start the backend:

   ```powershell
   cd backend
   npm run dev
   ```

   The default API address is `http://localhost:5000`.

7. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm run dev
   ```

   Open the Vite URL printed in the terminal, typically `http://localhost:5173`. The public form is at `/contact`.

If port 5000 is already in use, set `PORT=5001` in `backend/.env` and set `VITE_API_PROXY_TARGET=http://localhost:5001` in `frontend/.env.local`, then restart both servers. In this workspace, port 5000 was already occupied, so the verified backend is running on 5001 and the local Vite proxy is configured accordingly.

## API Documentation

See [docs/api.md](docs/api.md) for request, response, validation, and route details.

## Demo Flow

1. Open `/contact` and enter a fictional customer.
2. Submit the form; React posts to `POST /api/customers`.
3. Express stores the lead and its initial form-submission activity in MySQL in one transaction.
4. Open Customers or the dashboard to see the saved record and live totals.
5. Open the customer profile to view the enquiry and activity timeline.
6. Change lead status, add a note, or schedule a follow-up.
7. Choose that customer in AI Assistant for a data-grounded suggestion and unsent email draft.

## Screenshots

<img width="1917" height="905" alt="ConnectCRM dashboard" src="https://github.com/user-attachments/assets/c9d76b3e-9dde-4a35-b20b-655babcc1eff" />

<img width="1915" height="912" alt="ConnectCRM customer list" src="https://github.com/user-attachments/assets/673ed61d-fecc-4728-9ca1-992146830388" />

<img width="1911" height="913" alt="ConnectCRM lead pipeline" src="https://github.com/user-attachments/assets/5e7500db-6b8f-448b-967d-9d9e92503174" />

<img width="1915" height="910" alt="ConnectCRM customer activity" src="https://github.com/user-attachments/assets/bc9e718c-dd23-4991-a820-e9ac28d94bd0" />

<img width="1917" height="910" alt="ConnectCRM follow-ups" src="https://github.com/user-attachments/assets/013d6d0d-8c95-44c7-ad84-c6dda4d02d6c" />

<img width="1907" height="915" alt="ConnectCRM assistant" src="https://github.com/user-attachments/assets/2605db93-9abf-43b7-bc78-b0441b73e81a" />

<img width="1917" height="912" alt="ConnectCRM customer profile" src="https://github.com/user-attachments/assets/855eb0d2-4d49-41b7-a5af-388c52876a0b" />

<img width="1917" height="917" alt="ConnectCRM activity timeline" src="https://github.com/user-attachments/assets/d41ceb9c-58fe-4069-b5af-24589a6ebb47" />

<img width="1917" height="912" alt="ConnectCRM public contact form" src="https://github.com/user-attachments/assets/d0944608-bcae-4ba2-93db-98a9388f5157" />

The AI and communication controls run in explicit demo mode. No external messages are sent and no external AI provider is claimed.
