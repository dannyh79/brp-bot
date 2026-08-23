CREATE TABLE subsection_blocks (
    date VARCHAR(10) NOT NULL,
    section VARCHAR(20) NOT NULL,
    position VARCHAR(20) NOT NULL,
    title TEXT NULL,
    scripture_content TEXT NULL,
    scripture_scope TEXT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (date, section, position, sort_order),
    FOREIGN KEY (date) REFERENCES plans(date)
);
