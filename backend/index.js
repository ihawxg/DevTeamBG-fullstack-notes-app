require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");
const pool = require('./db')

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// Create Account
app.post("/create-account", async (req, res) => {
    const { full_name, email, password } = req.body;

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            return res.json({
                error: true,
                message: "User already exists",
            });
        }

        const newUser = await pool.query("INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *", [full_name, email, password]);

        const user = newUser.rows[0];
        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            user,
            accessToken,
            message: "Registration Successful",
        });
    } catch (error) {
        console.error("Error creating account", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

//Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const accessToken = jwt.sign({ user: user.rows[0] }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        });
    } catch (error) {
        console.error("Error logging in", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const fetchedUser = await pool.query("SELECT * FROM users WHERE id = $1", [user.id]);

        if (fetchedUser.rows.length === 0) {
            return res.sendStatus(401);
        }

        return res.json({
            user: fetchedUser.rows[0],
            message: "",
        });
    } catch (error) {
        console.error("Error fetching user", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    try {
        const newNote = await pool.query("INSERT INTO notes (title, content, tags, user_id) VALUES ($1, $2, $3, $4) RETURNING *", [title, content, tags, user.id]);

        return res.json({
            error: false,
            note: newNote.rows[0],
            message: "Note added successfully",
        });
    } catch (error) {
        console.error("Error adding note", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, is_pinned } = req.body;
    const { user } = req.user;

    try {
        const updatedNote = await pool.query("UPDATE notes SET title = $1, content = $2, tags = $3, is_pinned = $4 WHERE id = $5 AND user_id = $6 RETURNING *", [title, content, tags, is_pinned, noteId, user.id]);

        if (updatedNote.rows.length === 0) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        return res.json({
            error: false,
            note: updatedNote.rows[0],
            message: "Note updated successfully",
        });
    } catch (error) {
        console.error("Error editing note", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Update is_pinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { is_pinned } = req.body;
    const { user } = req.user;

    try {
        const updatedNote = await pool.query("UPDATE notes SET is_pinned = $1 WHERE id = $2 AND user_id = $3 RETURNING *", [is_pinned, noteId, user.id]);

        if (updatedNote.rows.length === 0) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        return res.json({
            error: false,
            note: updatedNote.rows[0],
            message: "Note pinned status updated successfully",
        });
    } catch (error) {
        console.error("Error updating pinned status", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Get all Notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const notes = await pool.query("SELECT * FROM notes WHERE user_id = $1 ORDER BY is_pinned DESC", [user.id]);

        return res.json({
            error: false,
            notes: notes.rows,
            message: "All notes retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching all notes", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
        const deletedNote = await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *", [noteId, user.id]);

        if (deletedNote.rows.length === 0) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        return res.json({
            error: false,
            message: "Note deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting note", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: true, message: "Search query is required" });
    }

    try {
        const matchingNotes = await pool.query("SELECT * FROM notes WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2)", [user.id, `%${query}%`]);

        return res.json({
            error: false,
            notes: matchingNotes.rows,
            message: "Notes matching the search query retrieved successfully",
        });
    } catch (error) {
        console.error("Error searching notes", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
