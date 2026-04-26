const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔵 Connexion PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "127.0.0.1",
    database: "formeleve",
    password: "123456789",
    port: 5432,
});


// 🔵 POST - Ajouter élève
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
        console.error("Erreur POST:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// 🔵 GET - Afficher + Rechercher
app.get("/eleves", async (req, res) => {
    const search = req.query.search;

    try {
        let result;

        if (search) {
            result = await pool.query(
                "SELECT * FROM eleves WHERE nom ILIKE $1 OR prenom ILIKE $1 ORDER BY id ASC",
                [`%${search}%`]
            );
        } else {
            result = await pool.query("SELECT * FROM eleves ORDER BY id ASC");
        }

        res.json(result.rows);

    } catch (err) {
        console.error("Erreur GET:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// 🔵 DELETE
app.delete("/eleves/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            "DELETE FROM eleves WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Élève introuvable" });
        }

        res.json({ message: "Élève supprimé" });

    } catch (err) {
        console.error("Erreur DELETE:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// 🔵 PUT - Modifier
app.put("/eleves/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { nom, prenom, age } = req.body;

    if (!nom || !prenom || !age) {
        return res.status(400).json({ message: "Champs manquants" });
    }

    try {
        const result = await pool.query(
            "UPDATE eleves SET nom = $1, prenom = $2, age = $3 WHERE id = $4 RETURNING *",
            [nom, prenom, Number(age), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Élève introuvable" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Erreur PUT:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// 🔵 LOGIN (simple mais propre)
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminEmail = "heritier@rotana.com";
        const adminPassword = "1234";

        if (email === adminEmail && password === adminPassword) {
            return res.json({ message: "Connexion réussie" });
        }

        return res.status(401).json({ message: "Identifiants incorrects" });

    } catch (err) {
        console.error("Erreur LOGIN:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// 🔵 Lancement serveur
app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});