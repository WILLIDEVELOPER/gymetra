// Esquema completo de la base de datos SQLite de Gymetra
// Cada migración es acumulativa y se ejecuta solo una vez

export const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      -- Tabla de perfil de usuario (singleton)
      CREATE TABLE IF NOT EXISTS user_profile (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL DEFAULT 'Atleta',
        body_weight REAL,
        height      REAL,
        age         INTEGER,
        goal        TEXT NOT NULL DEFAULT 'hypertrophy',
        exp_level   TEXT NOT NULL DEFAULT 'beginner',
        level       INTEGER NOT NULL DEFAULT 1,
        xp          INTEGER NOT NULL DEFAULT 0,
        total_xp    INTEGER NOT NULL DEFAULT 0,
        stat_strength    INTEGER NOT NULL DEFAULT 0,
        stat_discipline  INTEGER NOT NULL DEFAULT 0,
        stat_consistency INTEGER NOT NULL DEFAULT 0,
        stat_volume      REAL NOT NULL DEFAULT 0,
        current_streak   INTEGER NOT NULL DEFAULT 0,
        longest_streak   INTEGER NOT NULL DEFAULT 0,
        last_workout_date INTEGER,
        total_workouts   INTEGER NOT NULL DEFAULT 0,
        total_volume     REAL NOT NULL DEFAULT 0,
        total_duration   INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL,
        updated_at  INTEGER NOT NULL
      );

      -- Catálogo de ejercicios
      CREATE TABLE IF NOT EXISTS exercises (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        muscle_group    TEXT NOT NULL,
        secondary_muscles TEXT NOT NULL DEFAULT '[]',
        equipment       TEXT NOT NULL DEFAULT 'other',
        category        TEXT NOT NULL DEFAULT 'compound',
        is_custom       INTEGER NOT NULL DEFAULT 0,
        instructions    TEXT,
        video_url       TEXT,
        created_at      INTEGER NOT NULL,
        updated_at      INTEGER NOT NULL
      );

      -- Rutinas
      CREATE TABLE IF NOT EXISTS routines (
        id                  TEXT PRIMARY KEY,
        name                TEXT NOT NULL,
        description         TEXT,
        category            TEXT NOT NULL DEFAULT 'custom',
        scheduled_days      TEXT NOT NULL DEFAULT '[]',
        estimated_duration  INTEGER NOT NULL DEFAULT 60,
        color               TEXT NOT NULL DEFAULT '#3B82F6',
        is_active           INTEGER NOT NULL DEFAULT 1,
        times_completed     INTEGER NOT NULL DEFAULT 0,
        last_used_at        INTEGER,
        created_at          INTEGER NOT NULL,
        updated_at          INTEGER NOT NULL
      );

      -- Ejercicios dentro de una rutina (plantilla)
      CREATE TABLE IF NOT EXISTS routine_exercises (
        id              TEXT PRIMARY KEY,
        routine_id      TEXT NOT NULL,
        exercise_id     TEXT NOT NULL,
        order_index     INTEGER NOT NULL DEFAULT 0,
        target_sets     INTEGER NOT NULL DEFAULT 3,
        target_reps     INTEGER NOT NULL DEFAULT 10,
        target_weight   REAL,
        target_rir      INTEGER,
        rest_seconds    INTEGER NOT NULL DEFAULT 90,
        notes           TEXT,
        FOREIGN KEY (routine_id)  REFERENCES routines(id)  ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );

      -- Sesiones de entrenamiento
      CREATE TABLE IF NOT EXISTS workouts (
        id              TEXT PRIMARY KEY,
        routine_id      TEXT,
        routine_name    TEXT,
        name            TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'in_progress',
        started_at      INTEGER NOT NULL,
        completed_at    INTEGER,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        total_volume    REAL NOT NULL DEFAULT 0,
        total_sets      INTEGER NOT NULL DEFAULT 0,
        total_reps      INTEGER NOT NULL DEFAULT 0,
        notes           TEXT,
        rating          INTEGER,
        body_weight     REAL,
        xp_earned       INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL
      );

      -- Ejercicios dentro de un workout (log real)
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id          TEXT PRIMARY KEY,
        workout_id  TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        notes       TEXT,
        FOREIGN KEY (workout_id)  REFERENCES workouts(id)  ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );

      -- Series realizadas
      CREATE TABLE IF NOT EXISTS exercise_sets (
        id                    TEXT PRIMARY KEY,
        workout_exercise_id   TEXT NOT NULL,
        set_number            INTEGER NOT NULL,
        weight                REAL NOT NULL DEFAULT 0,
        reps                  INTEGER NOT NULL DEFAULT 0,
        rir                   INTEGER NOT NULL DEFAULT 2,
        rpe                   REAL,
        tempo                 TEXT,
        tut                   INTEGER,
        rest_seconds          INTEGER NOT NULL DEFAULT 90,
        is_warmup             INTEGER NOT NULL DEFAULT 0,
        is_dropset            INTEGER NOT NULL DEFAULT 0,
        completed             INTEGER NOT NULL DEFAULT 0,
        notes                 TEXT,
        FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
      );

      -- Records personales
      CREATE TABLE IF NOT EXISTS personal_records (
        id            TEXT PRIMARY KEY,
        exercise_id   TEXT NOT NULL,
        exercise_name TEXT NOT NULL,
        type          TEXT NOT NULL,
        value         REAL NOT NULL,
        weight        REAL,
        reps          INTEGER,
        workout_id    TEXT NOT NULL,
        achieved_at   INTEGER NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (workout_id)  REFERENCES workouts(id)  ON DELETE CASCADE
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_workouts_started   ON workouts(started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_workouts_status    ON workouts(status);
      CREATE INDEX IF NOT EXISTS idx_sets_we_id         ON exercise_sets(workout_exercise_id);
      CREATE INDEX IF NOT EXISTS idx_we_workout         ON workout_exercises(workout_id);
      CREATE INDEX IF NOT EXISTS idx_re_routine         ON routine_exercises(routine_id);
      CREATE INDEX IF NOT EXISTS idx_prs_exercise       ON personal_records(exercise_id);
    `,
  },
];
