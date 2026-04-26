const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔵 DATABASE (PRODUCTION READY)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 🔵 routes (inchangées)
app.post("/eleves", async (req, res) => {
    const { nom, prenom, age } = req.body;

    if (!nom || !prenom || !age) {
        return res.status(400).json({ message: "Champs manquants" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO eleves (nom, prenom, age) VALUES ($1, $2, $3) RETURNING *",
            [nom, prenom, Number(age)]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// autres routes OK...

// 🔵 SERVER FIX
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Serveur lancé sur port " + PORT);
});