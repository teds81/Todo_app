const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const handleSQLError = (res, err, context = "Erreur serveur") => {
    console.error(`[${context}]`, err);
    return res.status(500).json({ error: err.sqlMessage });
    // return res.status(500).json({ error: "Une erreur interne est survenue" });
};

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send("Le serveur Node est bien lancé et répond !");
});

app.get('/api/todos', (req, res) => {
    db.query('SELECT * FROM todos', (err, results) => {
        if (err) return handleSQLError(res, err, "GET /api/todos");
        res.json(results);
    });
});

app.post('/api/todos', (req, res) => {
    const { texte, priority } = req.body;

    if (!texte || typeof texte !== 'string' || texte.trim() === '') {
        return res.status(400).json({ error: "Le champ 'texte' est requis et doit être une chaîne non vide" });
    }
    if (!['Urgent', 'Moyenne', 'Basse'].includes(priority)) {
    return res.status(400).json({ error: "Le champ 'priority' doit être 'Urgent', 'Moyenne' ou 'Basse'" });
}

    const cleanTexte = texte.trim();

    db.query(
        'INSERT INTO todos (texte, priority) VALUES (?, ?)',
        [cleanTexte, priority],
        (err, result) => {
            if (err) return handleSQLError(res, err, "POST /api/todos");
            res.status(201).json({
                id: result.insertId,
                texte: cleanTexte,
                priority,
                completed: false
            });
        }
    );
});

app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const todoId = parseInt(id, 10);

    if (isNaN(todoId) || todoId <= 0) {
        return res.status(400).json({ error: "ID invalide" });
    }

    db.query('DELETE FROM todos WHERE id = ?', [todoId], (err, result) => {
        if (err) return handleSQLError(res, err, "DELETE /api/todos/:id");
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }
        res.json({ message: "Tâche supprimée avec succès" });
    });
});

app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { texte, completed } = req.body;
    const todoId = parseInt(id, 10);

    if (isNaN(todoId) || todoId <= 0) {
        return res.status(400).json({ error: "ID invalide" });
    }

    if (texte === undefined && completed === undefined) {
        return res.status(400).json({ error: "Au moins un champ ('texte' ou 'completed') doit être fourni" });
    }

    let cleanTexte = texte;
    if (texte !== undefined) {
        if (typeof texte !== 'string' || texte.trim() === '') {
            return res.status(400).json({ error: "Le champ 'texte' doit être une chaîne non vide" });
        }
        cleanTexte = texte.trim();
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ error: "Le champ 'completed' doit être un booléen" });
    }

    const fields = [];
    const values = [];

    if (cleanTexte !== undefined) {
        fields.push('texte = ?');
        values.push(cleanTexte);
    }
    if (completed !== undefined) {
        fields.push('completed = ?');
        values.push(completed);
    }
    values.push(todoId);

    const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, result) => {
        if (err) return handleSQLError(res, err, "PUT /api/todos/:id");
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }
        res.json({ message: "Tâche mise à jour avec succès" });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📂 Base de données : ${process.env.DB_NAME || 'todo_db'}`);
});
