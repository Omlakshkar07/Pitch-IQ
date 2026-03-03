-- ============================================================
-- MIGRATION 001: Extensions & Enums
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE deck_status AS ENUM ('pending', 'analyzing', 'completed', 'failed');
CREATE TYPE readiness_level AS ENUM ('Ready', 'Nearly Ready', 'Not Ready');
CREATE TYPE confidence_level AS ENUM ('High', 'Medium', 'Low');
