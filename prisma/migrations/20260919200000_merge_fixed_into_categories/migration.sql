-- Fixed costs stop being a separate idea. Setting "বাসা ভাড়া ৳8,000" is a plan,
-- not a payment, so a fixed cost is now an ordinary SpendCategory that real
-- expenses get logged against like any other.
--
-- Written by hand rather than generated: the generated version would have
-- dropped the FixedCost rows and the openingSavings values instead of moving
-- them.

-- Existing categories move down so the former fixed costs keep their place at
-- the top of the merged list.
UPDATE "SpendCategory" SET "sortOrder" = "sortOrder" + 1000;

INSERT INTO "SpendCategory" (
  "id", "monthId", "lineageId", "name", "budget", "sortOrder", "createdAt", "updatedAt"
)
SELECT
  "id", "monthId", "lineageId", "name", "amount", "sortOrder", "createdAt", "updatedAt"
FROM "FixedCost";

DROP TABLE "FixedCost";

-- The opening figure is a wallet balance now, not a savings pot. RENAME keeps
-- the value; a drop-and-add would not.
ALTER TABLE "User" RENAME COLUMN "openingSavings" TO "openingBalance";
