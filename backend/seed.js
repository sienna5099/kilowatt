const db = require("./db");
const database = db.promise();

const demoCustomers = [
    {
        name: "Morgan Demo",
        email: "morgan.demo.555cbd70@example.test",
        phone: "555-0102",
        company: "Northstar Studio",
        status: "New",
        interested_service: "Website Development",
        message: "Looking for a refreshed company website.",
        interactions: [
            ["Form Submission", "Submitted an enquiry through the website contact form."]
        ]
    },
    {
        name: "Morgan Demo",
        email: "morgan.demo.75b9167a@example.test",
        phone: null,
        company: null,
        status: "New",
        interested_service: "Website Development",
        message: "Looking for a refreshed company website.",
        interactions: [
            ["Form Submission", "Submitted an enquiry through the website contact form."]
        ]
    },
    {
        name: "Morgan Demo",
        email: "morgan.demo.4e5426de@example.test",
        phone: "555-0102",
        company: "Northstar Studio",
        status: "Qualified",
        interested_service: "Website Development",
        message: "Looking for a refreshed company website.",
        interactions: [
            ["Form Submission", "Submitted an enquiry through the website contact form."],
            ["Status Change", "Lead status changed from New to Qualified."],
            ["Note", "API integration smoke test."],
            ["WhatsApp", "Demo outreach prepared; no message sent."]
        ],
        followup: { date: "2026-10-05", note: "Demo follow-up.", status: "Completed" }
    },
    {
        name: "Avery Demo",
        email: "avery.demo.1791192866309@example.test",
        phone: "555-0134",
        company: "Fieldwork Studio",
        status: "Qualified",
        interested_service: "Website Development",
        message: "We need a new portfolio website.",
        interactions: [
            ["Form Submission", "Submitted an enquiry through the website contact form."],
            ["Status Change", "Lead status changed from New to Qualified."],
            ["Note", "Discussed scope and delivery timeline."],
            ["WhatsApp", "WhatsApp outreach prepared in demo mode. No message or call was sent."]
        ],
        followup: { date: "2026-10-06", note: "Send a project outline.", status: "Pending" }
    }
];

async function seed() {
    let added = 0;
    await database.beginTransaction();

    for (const customer of demoCustomers) {
        const [existing] = await database.query(
            "SELECT id FROM customers WHERE email = ? LIMIT 1",
            [customer.email]
        );
        if (existing.length) continue;

        const [result] = await database.query(
            `INSERT INTO customers
             (name, email, phone, company, status, interested_service, message)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                customer.name,
                customer.email,
                customer.phone,
                customer.company,
                customer.status,
                customer.interested_service,
                customer.message
            ]
        );

        for (const [type, description] of customer.interactions) {
            await database.query(
                "INSERT INTO interactions (customer_id, type, description) VALUES (?, ?, ?)",
                [result.insertId, type, description]
            );
        }

        if (customer.followup) {
            await database.query(
                "INSERT INTO followups (customer_id, followup_date, note, status) VALUES (?, ?, ?, ?)",
                [result.insertId, customer.followup.date, customer.followup.note, customer.followup.status]
            );
        }
        added += 1;
    }

    await database.commit();
    console.log(added ? `Added ${added} fictional demo customers.` : "Demo customers are already present.");
}

seed()
    .catch(async (error) => {
        await database.rollback();
        console.error("Demo seed failed:", error.code || "database error");
        process.exitCode = 1;
    })
    .finally(() => database.end());