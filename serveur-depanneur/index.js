require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Le serveur fonctionne !");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send("Base de données connectée : " + result.rows[0].now);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur de connexion à la base de données.");
  }
});

app.post("/clients", async (req, res) => {
    const { firstName, lastName, email, address, unit, city,
          province, postalCode, phone, password, reference } = req.body;

 if(!firstName || !lastName || !address || !email || !city || !province || !postalCode || !phone || !password){
    return res.status(400).json({ message: "Champs manquants." });
 }

 if(password.length < 6){
    return res.status(400).json({ message: "Le mot de passe est trop court." });
 }

  // 2. Hacher le mot de passe
  const hash = await bcrypt.hash(password, 10);
  const formatUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const referenceApi = formatUuid.test(reference || '') ? reference : null;

  // 3. Enregistrer dans la base
  try {
        await pool.query(
      `INSERT INTO clients
        (prenom, nom, courriel, adresse, app_bur, ville, province, code_postal, telephone, mot_de_passe_hache, reference_api)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [firstName, lastName, email, address, unit || null, city, province, postalCode, phone, hash, referenceApi]
    );
    res.status(201).json({ message: "Profil créé" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Ce courriel est déjà utilisé." });
    }
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});