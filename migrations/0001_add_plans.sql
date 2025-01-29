-- Migration number: 0001 	 2025-01-28T08:00:37.164Z
DROP TABLE IF EXISTS plans;
CREATE TABLE IF NOT EXISTS plans (
    date VARCHAR(10) NOT NULL,
    praise_scope VARCHAR(255) NOT NULL,
    praise_content TEXT NOT NULL,
    devotional_scope VARCHAR(255) NOT NULL,
    PRIMARY KEY (date)
);
