-- ============================================================================
-- Meridian Financial Group — 01. Catalog, schemas, volume
-- Run first. Idempotent.
-- ============================================================================

CREATE CATALOG IF NOT EXISTS mfg
  COMMENT 'Meridian Financial Group — synthetic teaching dataset for the Genie Agents course. Contains deliberate data-quality flaws; not a reference implementation.';

-- Curated business data. Everything a Genie Agent is pointed at lives here.
CREATE SCHEMA IF NOT EXISTS mfg.core
  COMMENT 'Core banking facts and dimensions for Meridian Financial Group.';

-- Reference material: unstructured documents for Agent mode and Knowledge Assistant.
CREATE SCHEMA IF NOT EXISTS mfg.ref
  COMMENT 'Reference and unstructured material: credit committee memos, branch notes, complaint letters.';

-- Staging holds the deliberately awful objects used in Modules 7 and 13.
-- Kept in a separate schema so the "before" and "after" states are visibly distinct.
CREATE SCHEMA IF NOT EXISTS mfg.staging
  COMMENT 'Deliberately unfit-for-purpose objects used to teach scoping and latency. Never point a production agent here.';

CREATE VOLUME IF NOT EXISTS mfg.ref.documents
  COMMENT 'PDFs attached to the agent for Agent mode: credit committee memos, branch manager notes, customer complaint letters.';

-- ----------------------------------------------------------------------------
-- Verify
-- ----------------------------------------------------------------------------
SELECT 'catalog' AS object, 'mfg' AS name
UNION ALL SELECT 'schema', schema_name FROM mfg.information_schema.schemata
WHERE catalog_name = 'mfg'
ORDER BY object, name;
