CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passage TEXT NOT NULL,
    note TEXT,
    mood_tags TEXT,
    created_at TEXT NOT NULL
);
