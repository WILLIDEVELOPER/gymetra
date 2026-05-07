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

  // v2: variaciones de ejercicios, tipos de ejercicio, logros, campos extra en sets
  {
    version: 2,
    sql: `
      -- Tipo de ejercicio en catálogo (weight | duration | bodyweight)
      ALTER TABLE exercises ADD COLUMN exercise_type TEXT NOT NULL DEFAULT 'weight';

      -- Variaciones de ejercicios (Jalón agarre abierto, cerrado, neutro, etc.)
      CREATE TABLE IF NOT EXISTS exercise_variations (
        id          TEXT PRIMARY KEY,
        exercise_id TEXT NOT NULL,
        name        TEXT NOT NULL,
        icon_name   TEXT NOT NULL DEFAULT 'barbell-outline',
        description TEXT,
        is_default  INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_var_exercise ON exercise_variations(exercise_id);

      -- Variación elegida en cada ejercicio del workout
      ALTER TABLE workout_exercises ADD COLUMN variation_id TEXT;

      -- Campos extra para ejercicios de duración/cardio
      ALTER TABLE exercise_sets ADD COLUMN duration_seconds INTEGER;
      ALTER TABLE exercise_sets ADD COLUMN distance_meters  REAL;
      ALTER TABLE exercise_sets ADD COLUMN calories         INTEGER;

      -- Variación en records personales (PR por variación independiente)
      ALTER TABLE personal_records ADD COLUMN variation_id TEXT;

      -- Sistema de logros gamificados
      CREATE TABLE IF NOT EXISTS achievements (
        id            TEXT PRIMARY KEY,
        code          TEXT UNIQUE NOT NULL,
        title         TEXT NOT NULL,
        description   TEXT NOT NULL,
        icon_name     TEXT NOT NULL DEFAULT 'trophy-outline',
        xp_reward     INTEGER NOT NULL DEFAULT 0,
        unlocked      INTEGER NOT NULL DEFAULT 0,
        unlocked_at   INTEGER,
        progress      REAL NOT NULL DEFAULT 0,
        max_progress  REAL NOT NULL DEFAULT 1
      );

      -- Seed inicial de logros
      INSERT OR IGNORE INTO achievements
        (id, code, title, description, icon_name, xp_reward, max_progress)
      VALUES
        ('ach-001','FIRST_WORKOUT',     'Primera Sesión',         'Completa tu primer entrenamiento',               'fitness-outline',   50,  1),
        ('ach-002','STREAK_7',          'Racha de Fuego',         'Mantén una racha de 7 días consecutivos',        'flame-outline',    100,  7),
        ('ach-003','STREAK_30',         'Mes de Hierro',          'Mantén una racha de 30 días consecutivos',       'flame',            300, 30),
        ('ach-004','WORKOUTS_10',       'Atleta Dedicado',        'Completa 10 entrenamientos',                     'barbell-outline',   75, 10),
        ('ach-005','WORKOUTS_50',       'Guerrero del Gym',       'Completa 50 entrenamientos',                     'shield-outline',   200, 50),
        ('ach-006','WORKOUTS_100',      'Centurión',              'Completa 100 entrenamientos',                    'trophy-outline',   500,100),
        ('ach-007','FIRST_PR',          'Primer Récord',          'Rompe tu primer récord personal',                'star-outline',      50,  1),
        ('ach-008','PRS_10',            'Máquina de PRs',         'Rompe 10 récords personales',                    'star',             150, 10),
        ('ach-009','VOLUME_1T',         'Una Tonelada',           'Levanta 1 000 kg en un solo entrenamiento',      'barbell',          100,  1),
        ('ach-010','VOLUME_TOTAL_100T', 'Élite del Volumen',      'Acumula 100 000 kg en toda tu carrera',          'trending-up',      400,  1),
        ('ach-011','LEVEL_5',           'En el Camino',           'Alcanza el nivel 5',                             'ribbon-outline',   100,  1),
        ('ach-012','LEVEL_10',          'Atleta de Hierro',       'Alcanza el nivel 10',                            'ribbon',           250,  1),
        ('ach-013','FIRST_LEGS',        'No Saltar Piernas',      'Completa un entrenamiento de piernas',           'walk-outline',      50,  1),
        ('ach-014','EARLY_BIRD',        'Madrugador',             'Entrena antes de las 7:00 am',                   'sunny-outline',     75,  1),
        ('ach-015','NIGHT_OWL',         'Búho Nocturno',          'Entrena después de las 10:00 pm',                'moon-outline',      75,  1),
        ('ach-016','STREAK_3',          'Tres en Raya',           'Entrena 3 días seguidos',                        'flash-outline',     30,  3),
        ('ach-017','WORKOUTS_5',        'Calentando Motores',     'Completa 5 entrenamientos',                      'walk-outline',      30,  5),
        ('ach-018','LONG_SESSION',      'Maratón de Hierro',      'Entrena más de 90 minutos en una sesión',        'timer-outline',    100,  1),
        ('ach-019','PERFECT_WEEK',      'Semana Perfecta',        'Entrena 5 o más días en la misma semana',        'calendar-outline', 150,  5),
        ('ach-020','VARIETY',           'Explorador',             'Entrena 5 grupos musculares distintos',          'grid-outline',     100,  5);
    `,
  },
];
