/**
 * Web mock de SQLite para Gymetra.
 * Usa localStorage para persistencia. Misma interfaz que client.ts (native).
 * Metro Bundler resuelve automáticamente este archivo en builds web.
 */
import { MIGRATIONS } from './schema';

type Row = Record<string, any>;
type DbStore = Record<string, Row[]>;

const STORAGE_KEY = 'gymetra_db_v1';

function loadStore(): DbStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(s: DbStore): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

let store: DbStore = loadStore();

function getTable(name: string): Row[] {
  if (!store[name]) store[name] = [];
  return store[name];
}

function persist() { saveStore(store); }

// ── helpers SQL ──────────────────────────────────────────────────────────────

function colName(ref: string): string {
  return ref.split('.').pop()!.replace(/[`"[\]\s]/g, '');
}

function extractTable(sql: string, keyword: string): string {
  return sql.match(new RegExp(`${keyword}\\s+(\\w+)`, 'i'))?.[1] ?? '';
}

function extractInsertColumns(sql: string): string[] {
  const m = sql.match(/\(([^)]+)\)\s*VALUES/i);
  if (!m) return [];
  return m[1].split(',').map(s => s.trim().replace(/[`"[\]]/g, ''));
}

/** Construye una función de filtro a partir del WHERE clause */
function buildFilter(whereClause: string, params: any[]): (row: Row) => boolean {
  if (!whereClause.trim()) return () => true;
  const pi = { i: 0 };
  const parts = whereClause.split(/\s+AND\s+/i).map(p => p.trim());
  const checks: Array<(row: Row) => boolean> = [];

  for (const part of parts) {
    // col LIKE ?
    const likeM = part.match(/^([\w.]+)\s+LIKE\s+\?$/i);
    // col = ?
    const eqM   = part.match(/^([\w.]+)\s*=\s*\?$/i);
    // col != ?
    const neqM  = part.match(/^([\w.]+)\s*!=\s*\?$/i);
    // col >= ?
    const gteM  = part.match(/^([\w.]+)\s*>=\s*\?$/i);
    // col < ?
    const ltM   = part.match(/^([\w.]+)\s*<\s*\?$/i);
    // col = 'literal'
    const litM  = part.match(/^([\w.]+)\s*=\s*'([^']+)'$/i);
    // col IS NOT NULL
    const nnM   = part.match(/^([\w.]+)\s+IS\s+NOT\s+NULL$/i);

    if (likeM) {
      const col = colName(likeM[1]); const pat = params[pi.i++];
      const re = new RegExp('^' + String(pat).replace(/%/g,'.*').replace(/_/g,'.') + '$', 'i');
      checks.push(r => re.test(String(r[col] ?? '')));
    } else if (eqM) {
      const col = colName(eqM[1]); const val = params[pi.i++];
      checks.push(r => r[col] === val);
    } else if (neqM) {
      const col = colName(neqM[1]); const val = params[pi.i++];
      checks.push(r => r[col] !== val);
    } else if (gteM) {
      const col = colName(gteM[1]); const val = params[pi.i++];
      checks.push(r => (r[col] ?? 0) >= val);
    } else if (ltM) {
      const col = colName(ltM[1]); const val = params[pi.i++];
      checks.push(r => (r[col] ?? 0) < val);
    } else if (litM) {
      const col = colName(litM[1]); const val = litM[2];
      checks.push(r => r[col] === val);
    } else if (nnM) {
      const col = colName(nnM[1]);
      checks.push(r => r[col] != null);
    }
    // cláusulas no reconocidas → ignorar (permissive)
  }

  return (row) => checks.every(c => c(row));
}

function applyWhere(rows: Row[], sql: string, params: any[]): Row[] {
  const wm = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+GROUP\s+BY|\s*$)/is);
  if (!wm) return rows;
  const filter = buildFilter(wm[1].trim(), params);
  return rows.filter(filter);
}

function applyOrderBy(rows: Row[], sql: string): Row[] {
  const m = sql.match(/ORDER\s+BY\s+([\w.,\s]+?)(?:\s+LIMIT|\s+OFFSET|\s*$)/i);
  if (!m) return rows;
  const criteria = m[1].split(',').map(s => {
    const [c, dir] = s.trim().split(/\s+/);
    return { col: colName(c), desc: dir?.toUpperCase() === 'DESC' };
  });
  return [...rows].sort((a, b) => {
    for (const { col, desc } of criteria) {
      const av = a[col] ?? 0, bv = b[col] ?? 0;
      if (av === bv) continue;
      return (av < bv ? -1 : 1) * (desc ? -1 : 1);
    }
    return 0;
  });
}

function applyLimit(rows: Row[], sql: string): Row[] {
  const lm = sql.match(/LIMIT\s+(\d+)/i);
  const om = sql.match(/OFFSET\s+(\d+)/i);
  const limit  = lm ? parseInt(lm[1]) : undefined;
  const offset = om ? parseInt(om[1]) : 0;
  return rows.slice(offset, limit !== undefined ? offset + limit : undefined);
}

// ── Clase principal ──────────────────────────────────────────────────────────

class MockSQLiteDatabase {

  async execAsync(sql: string): Promise<void> {
    // Crear tablas vacías para cada CREATE TABLE IF NOT EXISTS
    for (const m of sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)) {
      getTable(m[1]);
    }
    // PRAGMA, CREATE INDEX, etc. → ignorar
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const sqlU = sql.toUpperCase();

    // ── Aggregate: COUNT(*), SUM() ───────────────────────────────────────
    if (sqlU.includes('COUNT(*)') && !sqlU.includes('JOIN')) {
      const table = extractTable(sql, 'FROM');
      const rows  = applyWhere(getTable(table), sql, params);
      const result = {
        workout_count:  rows.length,
        total_volume:   rows.reduce((s, r) => s + (r.total_volume   ?? 0), 0),
        total_duration: rows.reduce((s, r) => s + (r.duration_seconds ?? 0), 0),
        xp_earned:      rows.reduce((s, r) => s + (r.xp_earned       ?? 0), 0),
      };
      return [result as any];
    }

    // ── JOINs complejos (workouts con exercises, sets con join) ──────────
    if (sqlU.includes('JOIN')) {
      // getRecent workouts: devuelve workouts básicos con exercise_count=0
      if (sqlU.includes('COUNT(DISTINCT')) {
        const table = extractTable(sql, 'FROM');
        const rows  = applyWhere(getTable(table), sql, params);
        const sorted  = applyOrderBy(rows, sql);
        const limited = applyLimit(sorted, sql);
        return limited.map(r => ({ ...r, exercise_count: 0 })) as T[];
      }
      // Otros JOINs → vacío (sets history, muscle frequency, etc.)
      return [];
    }

    // ── SELECT simple ────────────────────────────────────────────────────
    const table = extractTable(sql, 'FROM');
    if (!table) return [];

    const rows    = applyWhere(getTable(table), sql, params);
    const sorted  = applyOrderBy(rows, sql);
    return applyLimit(sorted, sql) as T[];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, params);
    return rows[0] ?? null;
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    const sqlU = sql.trim().toUpperCase();
    if (sqlU.startsWith('INSERT'))      this._insert(sql, params);
    else if (sqlU.startsWith('UPDATE')) this._update(sql, params);
    else if (sqlU.startsWith('DELETE')) this._delete(sql, params);
    persist();
    return { changes: 1, lastInsertRowId: 0 };
  }

  async withTransactionAsync(fn: () => Promise<void>): Promise<void> {
    await fn();
    persist();
  }

  async closeAsync(): Promise<void> {}

  // ── DML handlers ─────────────────────────────────────────────────────────

  private _insert(sql: string, params: any[]) {
    const orIgnore = /INSERT\s+OR\s+IGNORE/i.test(sql);
    const table = extractTable(sql, 'INTO');
    if (!table) return;

    const cols = extractInsertColumns(sql);
    if (!cols.length) return;

    const row: Row = {};
    cols.forEach((col, i) => { row[col] = params[i] ?? null; });

    const rows = getTable(table);
    if (orIgnore && row.id && rows.some(r => r.id === row.id)) return;
    rows.push(row);
  }

  private _update(sql: string, params: any[]) {
    const table = extractTable(sql, 'UPDATE');
    if (!table) return;

    const setMatch   = sql.match(/SET\s+(.+?)\s+WHERE\s+/is);
    const whereMatch = sql.match(/WHERE\s+(.+?)$/is);
    if (!setMatch) return;

    const setClause   = setMatch[1];
    const whereClause = whereMatch?.[1] ?? '';
    const assignments = setClause.split(',').map(s => s.trim());

    // Contar '?' en SET para saber cuáles son del WHERE
    const setQCount  = (setClause.match(/\?/g) ?? []).length;
    const setValues  = params.slice(0, setQCount);
    const whereVals  = params.slice(setQCount);

    const filter = buildFilter(whereClause, whereVals);

    let si = 0;
    for (const row of getTable(table)) {
      if (!filter(row)) continue;
      let localSi = 0; // reset per row for reading setValues
      // Re-parse assignments so each row gets correct values
      for (const assignment of assignments) {
        const eqIdx = assignment.indexOf('=');
        if (eqIdx === -1) continue;
        const lhs = colName(assignment.slice(0, eqIdx));
        const rhs = assignment.slice(eqIdx + 1).trim();

        if (/COALESCE\s*\(\s*\?,/i.test(rhs)) {
          // COALESCE(?, col) — usar param si no es null
          const val = setValues[si++];
          if (val !== null && val !== undefined) row[lhs] = val;
        } else if (rhs === '?') {
          row[lhs] = setValues[si++];
        } else if (/\w+\s*\+\s*1$/.test(rhs)) {
          // col + 1
          row[lhs] = (row[lhs] ?? 0) + 1;
        } else if (/\w+\s*\+\s*\?$/.test(rhs)) {
          row[lhs] = (row[lhs] ?? 0) + setValues[si++];
        } else if (/^'[^']*'$/.test(rhs)) {
          row[lhs] = rhs.slice(1, -1);
        }
      }
    }
  }

  private _delete(sql: string, params: any[]) {
    const table = extractTable(sql, 'FROM');
    if (!table) return;
    const wm = sql.match(/WHERE\s+(.+?)$/is);
    if (!wm) { store[table] = []; return; }
    const filter = buildFilter(wm[1].trim(), params);
    store[table] = getTable(table).filter(r => !filter(r));
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────

let _db: MockSQLiteDatabase | null = null;

export async function getDatabase(): Promise<MockSQLiteDatabase> {
  if (_db) return _db;
  _db = new MockSQLiteDatabase();
  await _runMigrations(_db);
  return _db;
}

async function _runMigrations(db: MockSQLiteDatabase): Promise<void> {
  const applied = new Set(getTable('_migrations').map((r: any) => r.version));
  for (const migration of MIGRATIONS) {
    if (!applied.has(migration.version)) {
      await db.execAsync(migration.sql);
      getTable('_migrations').push({ version: migration.version, ran_at: Date.now() });
    }
  }
  persist();
}

export async function closeDatabase(): Promise<void> {
  _db = null;
}
