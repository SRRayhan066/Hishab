-- Categories added from the add-expense screen belong to one month only. Every
-- existing category was part of the plan, so they all start as permanent.
ALTER TABLE "SpendCategory" ADD COLUMN "temporary" BOOLEAN NOT NULL DEFAULT false;
