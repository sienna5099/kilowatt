const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const database = db.promise();
const leadStatuses = ["New", "Contacted", "Qualified", "Won", "Lost"];

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "ConnectCRM backend is running!"
    });
});

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/customers", async (req, res) => {
    const conditions = [];
    const values = [];
    if (req.query.status) {
        conditions.push("status = ?");
        values.push(req.query.status);
    }
    if (req.query.search) {
        conditions.push("(name LIKE ? OR email LIKE ? OR company LIKE ?)");
        const term = `%${req.query.search}%`;
        values.push(term, term, term);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
        const [customers] = await database.query(
            `SELECT * FROM customers ${where} ORDER BY created_at DESC`,
            values
        );
        res.json(customers);
    } catch (err) {
        console.error("Customer list query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to load customers right now." });
    }
});

app.get("/api/customers/:id", async (req, res) => {
    try {
        const [rows] = await database.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: "Customer not found." });
        res.json(rows[0]);
    } catch (err) {
        console.error("Customer detail query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to load this customer right now." });
    }
});

app.post("/api/customers", async (req, res) => {
    const { name, email, phone, company, interested_service, message } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ error: "Name and email are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "Enter a valid email address." });
    }

    try {
        await database.beginTransaction();
        const [result] = await database.query(
            `INSERT INTO customers (name, email, phone, company, status, interested_service, message)
             VALUES (?, ?, ?, ?, 'New', ?, ?)`,
            [name.trim(), email.trim(), phone || null, company || null, interested_service || null, message || null]
        );
        await database.query(
            "INSERT INTO interactions (customer_id, type, description) VALUES (?, ?, ?)",
            [result.insertId, "Form Submission", "Submitted an enquiry through the website contact form."]
        );
        await database.commit();
        const [customers] = await database.query("SELECT * FROM customers WHERE id = ?", [result.insertId]);
        res.status(201).json(customers[0]);
    } catch (err) {
        await database.rollback();
        console.error("Customer creation failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to save your enquiry right now. Please try again." });
    }
});

app.put("/api/customers/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!leadStatuses.includes(status)) {
        return res.status(400).json({ error: "Choose a valid lead status." });
    }
    try {
        const [customers] = await database.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
        if (!customers.length) return res.status(404).json({ error: "Customer not found." });
        const previousStatus = customers[0].status;
        if (previousStatus !== status) {
            await database.beginTransaction();
            await database.query("UPDATE customers SET status = ? WHERE id = ?", [status, req.params.id]);
            await database.query(
                "INSERT INTO interactions (customer_id, type, description) VALUES (?, ?, ?)",
                [req.params.id, "Status Change", `Lead status changed from ${previousStatus} to ${status}.`]
            );
            await database.commit();
        }
        const [updated] = await database.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        await database.rollback();
        console.error("Status update failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to update this lead right now." });
    }
});

app.get("/api/customers/:id/interactions", async (req, res) => {
    try {
        const [items] = await database.query(
            "SELECT * FROM interactions WHERE customer_id = ? ORDER BY created_at DESC",
            [req.params.id]
        );
        res.json(items);
    } catch (err) {
        console.error("Interaction query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to load customer activity right now." });
    }
});

app.post("/api/customers/:id/interactions", async (req, res) => {
    const { type, description } = req.body;
    const allowedTypes = ["Email", "WhatsApp", "Call", "Meeting", "Note"];
    if (!allowedTypes.includes(type) || typeof description !== "string" || !description.trim()) {
        return res.status(400).json({ error: "Choose an activity type and add a description." });
    }
    try {
        const [result] = await database.query(
            "INSERT INTO interactions (customer_id, type, description) SELECT id, ?, ? FROM customers WHERE id = ?",
            [type, description.trim(), req.params.id]
        );
        if (!result.affectedRows) return res.status(404).json({ error: "Customer not found." });
        const [items] = await database.query("SELECT * FROM interactions WHERE id = ?", [result.insertId]);
        res.status(201).json(items[0]);
    } catch (err) {
        console.error("Interaction creation failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to add activity right now." });
    }
});

app.get("/api/activity", async (_req, res) => {
    try {
        const [items] = await database.query(
            `SELECT i.*, c.name AS customer_name FROM interactions i
             JOIN customers c ON c.id = i.customer_id ORDER BY i.created_at DESC LIMIT 100`
        );
        res.json(items);
    } catch (err) {
        console.error("Activity query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to load activity right now." });
    }
});

app.get("/api/followups", async (_req, res) => {
    try {
        const [items] = await database.query(
            `SELECT f.*, c.name AS customer_name, c.email AS customer_email
             FROM followups f JOIN customers c ON c.id = f.customer_id
             ORDER BY f.followup_date ASC, f.id DESC`
        );
        res.json(items);
    } catch (err) {
        console.error("Follow-up query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to load follow-ups right now." });
    }
});

app.post("/api/customers/:id/followups", async (req, res) => {
    const { followup_date, note } = req.body;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(followup_date || "") || typeof note !== "string" || !note.trim()) {
        return res.status(400).json({ error: "Choose a date and add a follow-up note." });
    }
    try {
        const [result] = await database.query(
            "INSERT INTO followups (customer_id, followup_date, note, status) SELECT id, ?, ?, 'Pending' FROM customers WHERE id = ?",
            [followup_date, note.trim(), req.params.id]
        );
        if (!result.affectedRows) return res.status(404).json({ error: "Customer not found." });
        const [items] = await database.query("SELECT * FROM followups WHERE id = ?", [result.insertId]);
        res.status(201).json(items[0]);
    } catch (err) {
        console.error("Follow-up creation failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to create this follow-up right now." });
    }
});

app.put("/api/followups/:id/status", async (req, res) => {
    if (!(["Pending", "Completed"].includes(req.body.status))) {
        return res.status(400).json({ error: "Choose a valid follow-up status." });
    }
    try {
        const [result] = await database.query("UPDATE followups SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
        if (!result.affectedRows) return res.status(404).json({ error: "Follow-up not found." });
        res.json({ id: Number(req.params.id), status: req.body.status });
    } catch (err) {
        console.error("Follow-up update failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to update this follow-up right now." });
    }
});

app.get("/api/dashboard", async (_req, res) => {
    try {
        const [[counts]] = await database.query(
            `SELECT COUNT(*) AS totalCustomers,
                COALESCE(SUM(status = 'New'), 0) AS newLeads,
                COALESCE(SUM(status = 'Qualified'), 0) AS qualifiedLeads,
                COALESCE(SUM(status = 'Won'), 0) AS wonLeads FROM customers`
        );
        const [[followupCounts]] = await database.query(
            "SELECT COUNT(*) AS followups FROM followups WHERE status = 'Pending'"
        );
        const [activity] = await database.query(
            `SELECT i.*, c.name AS customer_name FROM interactions i
             JOIN customers c ON c.id = i.customer_id ORDER BY i.created_at DESC LIMIT 6`
        );
        res.json({ ...counts, followups: followupCounts.followups, activity });
    } catch (err) {
        console.error("Dashboard query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to load dashboard data right now." });
    }
});

app.get("/api/assistant/customers/:id", async (req, res) => {
    try {
        const [[customer]] = await database.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
        if (!customer) return res.status(404).json({ error: "Customer not found." });
        const [interactions] = await database.query(
            "SELECT * FROM interactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 5",
            [req.params.id]
        );
        const lastContact = interactions[0];
        const service = customer.interested_service || "their enquiry";
        const suggestion = lastContact
            ? `${customer.name} is interested in ${service}. Their last recorded activity was ${lastContact.type.toLowerCase()}; consider a personal follow-up.`
            : `${customer.name} is interested in ${service} and has no recorded follow-up yet. Consider reaching out to learn more.`;
        res.json({
            mode: "demo",
            customer,
            interactions,
            summary: `${customer.name}${customer.company ? ` at ${customer.company}` : ""} is a ${customer.status.toLowerCase()} lead interested in ${service}.`,
            suggestion,
            emailDraft: `Subject: Following up on your interest in ${service}\n\nHi ${customer.name.split(" ")[0]},\n\nThank you for reaching out about ${service}. I would love to learn more about what you are looking for and answer any questions. Would you be available for a brief conversation this week?\n\nBest,\nConnectCRM Sales`
        });
    } catch (err) {
        console.error("Assistant context query failed:", err.code || "database error");
        res.status(500).json({ error: "Unable to prepare a suggestion right now." });
    }
});

app.use((err, _req, res, _next) => {
    console.error("Request failed:", err.code || "invalid request");
    res.status(400).json({ error: "The request could not be processed." });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`ConnectCRM backend running on http://localhost:${PORT}`);
});