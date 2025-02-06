-- Migration number: 0002 	 2025-02-06T11:47:48.575Z
DROP TABLE IF EXISTS recipients;
CREATE TABLE IF NOT EXISTS recipients (
    id VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT (datetime('NOW', 'UTC')),
    deleted_at DATETIME NULL,
    PRIMARY KEY (id)
);
