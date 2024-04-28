CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for notes
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(100)[] DEFAULT ARRAY[]::VARCHAR[],
    is_pinned BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);