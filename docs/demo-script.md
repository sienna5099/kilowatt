# Demo Script

Use fictional details such as Avery Demo and an `example.test` email address.

To restore the sample dashboard before presenting, run `npm --prefix backend run seed` from the project root. The command is idempotent.

1. Open the public form at `/contact`.
2. Enter a name, email, company, interested service, and a short enquiry. Submit once and point out the success state.
3. Open Customers or return to the dashboard. Show that the new customer and updated totals came from the database, not hardcoded sample metrics.
4. Open the profile. Show the original enquiry and the automatically recorded `Form Submission` activity.
5. Change the lead to `Qualified`. Show the status-change event in the activity timeline.
6. Add a note and schedule a follow-up. Open Follow-ups and mark it completed.
7. Open AI Assistant, choose the customer, and generate the summary and follow-up suggestion. Reveal the email draft and point out `DEMO MODE` / `NOT SENT`.
8. On the profile, click Email, WhatsApp, or Call. Explain that the action only records a planned touchpoint; no external communication occurs.

Recommended recording: keep the browser and the API/database terminal visible briefly when showing the initial form submission. Never display a `.env` file or actual customer secrets.