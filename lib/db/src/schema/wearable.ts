import { pgTable, text, serial, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wearableTable = pgTable("wearable", {
  id: serial("id").primaryKey(),
  steps: integer("steps").notNull().default(0),
  activeCalories: integer("active_calories").notNull().default(0),
  sleepHours: real("sleep_hours").notNull().default(0),
  heartRate: integer("heart_rate").notNull().default(0),
  aiCommentary: text("ai_commentary").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWearableSchema = createInsertSchema(wearableTable).omit({ id: true });
export type InsertWearable = z.infer<typeof insertWearableSchema>;
export type Wearable = typeof wearableTable.$inferSelect;
