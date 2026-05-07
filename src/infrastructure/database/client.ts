import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync('gymetra.db', {
    useNewConnection: false,
  });

  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await _db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(_db);
  return _db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Tabla de control de versiones
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version   INTEGER PRIMARY KEY,
      ran_at    INTEGER NOT NULL
    );
  `);

  const rows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version ASC'
  );
  const appliedVersions = new Set(rows.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO _migrations (version, ran_at) VALUES (?, ?)',
        [migration.version, Date.now()]
      );
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
