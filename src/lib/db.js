import Database from 'better-sqlite3';
const db = new Database('./data/homesrvr.db');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    hostname TEXT,
    os TEXT,
    online INTEGER NOT NULL DEFAULT 0,
    cpu_usage REAL NOT NULL DEFAULT 0,
    memory_usage REAL NOT NULL DEFAULT 0,
    network_download REAL,
    network_upload REAL,
    network_latency REAL,
    last_seen INTEGER
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
  )
`);
const serverColumns = db
    .prepare(`PRAGMA table_info(servers)`)
    .all();
if (!serverColumns.some(column => column.name === 'hostname')) {
    db.exec(`ALTER TABLE servers ADD COLUMN hostname TEXT`);
}
if (!serverColumns.some(column => column.name === 'os')) {
    db.exec(`ALTER TABLE servers ADD COLUMN os TEXT`);
}
if (!serverColumns.some(column => column.name === 'network_download')) {
    db.exec(`ALTER TABLE servers ADD COLUMN network_download REAL`);
}
if (!serverColumns.some(column => column.name === 'network_upload')) {
    db.exec(`ALTER TABLE servers ADD COLUMN network_upload REAL`);
}
if (!serverColumns.some(column => column.name === 'network_latency')) {
    db.exec(`ALTER TABLE servers ADD COLUMN network_latency REAL`);
}
export default db;
