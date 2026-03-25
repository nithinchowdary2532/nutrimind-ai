import { pgTable, text, serial, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  calories: real("calories").notNull().default(0),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fats: real("fats").notNull().default(0),
  fiber: real("fiber").notNull().default(0),
  healthScore: real("health_score").notNull().default(0),
  insight: text("insight").notNull().default(""),
  tip: text("tip").notNull().default(""),
  mealTime: text("meal_time").notNull().default("Lunch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true, createdAt: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;
