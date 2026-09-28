ALTER TABLE "MoneyAccount" ADD COLUMN "color" TEXT NOT NULL DEFAULT 'sage';
ALTER TABLE "MoneyAccount" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'wallet';

WITH shuffled AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY random()) AS position
  FROM "MoneyAccount"
)
UPDATE "MoneyAccount" a
SET "color" = (ARRAY['sage', 'sand', 'clay', 'sky', 'lavender', 'butter', 'mint', 'rose'])[1 + ((s.position - 1) % 8)::int]
FROM shuffled s
WHERE s."id" = a."id";

WITH shuffled AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY random()) AS position
  FROM "MoneyAccount"
)
UPDATE "MoneyAccount" a
SET "icon" = (ARRAY['landmark', 'wallet', 'smartphone', 'piggy', 'coins', 'banknote', 'vault', 'gem'])[1 + ((s.position - 1) % 8)::int]
FROM shuffled s
WHERE s."id" = a."id";
