import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { mealsTable, insightsTable, wearableTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

router.get("/meals", async (req, res) => {
  try {
    const meals = await db
      .select()
      .from(mealsTable)
      .orderBy(desc(mealsTable.createdAt))
      .limit(50);
    res.json(meals);
  } catch (err) {
    req.log.error({ err }, "Failed to list meals");
    res.status(500).json({ error: "Failed to list meals" });
  }
});

router.post("/meals", async (req, res) => {
  const { description, mealTime } = req.body as { description: string; mealTime: string };

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    res.status(400).json({ error: "Meal description is required" });
    return;
  }

  try {
    const prompt = `Analyze this meal and return ONLY valid JSON (no markdown, no extra text):
Meal: "${description.trim()}"

Return exactly this JSON structure:
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "fiber": <number in grams>,
  "health_score": <number 1-10>,
  "insight": "<one sentence about nutritional value>",
  "tip": "<one actionable improvement tip>"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    const rawText = block.type === "text" ? block.text : "{}";

    let analysis: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber: number;
      health_score: number;
      insight: string;
      tip: string;
    };

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      analysis = {
        calories: 400,
        protein: 20,
        carbs: 40,
        fats: 15,
        fiber: 5,
        health_score: 6,
        insight: "A balanced meal with reasonable macronutrients.",
        tip: "Consider adding more vegetables for additional fiber and micronutrients.",
      };
    }

    const [meal] = await db
      .insert(mealsTable)
      .values({
        description: description.trim(),
        mealTime: mealTime || "Lunch",
        calories: Math.round(analysis.calories || 0),
        protein: Math.round(analysis.protein || 0),
        carbs: Math.round(analysis.carbs || 0),
        fats: Math.round(analysis.fats || 0),
        fiber: Math.round(analysis.fiber || 0),
        healthScore: Math.round((analysis.health_score || 5) * 10) / 10,
        insight: analysis.insight || "",
        tip: analysis.tip || "",
      })
      .returning();

    res.status(201).json(meal);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze meal");
    res.status(500).json({ error: "Failed to analyze meal. Please try again." });
  }
});

router.delete("/meals/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid meal ID" });
    return;
  }

  try {
    const deleted = await db.delete(mealsTable).where(eq(mealsTable.id, id)).returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Meal not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete meal");
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

router.get("/insights", async (req, res) => {
  try {
    const existing = await db
      .select()
      .from(insightsTable)
      .orderBy(desc(insightsTable.createdAt))
      .limit(4);

    if (existing.length >= 4) {
      res.json(existing);
      return;
    }

    const meals = await db
      .select()
      .from(mealsTable)
      .orderBy(desc(mealsTable.createdAt))
      .limit(21);

    const mealSummary = meals.length > 0
      ? meals.map(m => `${m.mealTime}: ${m.description} (${Math.round(m.calories)} kcal, P:${Math.round(m.protein)}g C:${Math.round(m.carbs)}g F:${Math.round(m.fats)}g)`).join("\n")
      : "No meals logged yet. User is just starting their nutrition tracking journey.";

    const prompt = `You are a nutrition coach. Based on these recent meals, generate exactly 4 insights as a JSON array.

Recent meals:
${mealSummary}

Return ONLY a JSON array with exactly 4 objects. No markdown, no extra text:
[
  {"type": "warning", "title": "...", "detail": "..."},
  {"type": "positive", "title": "...", "detail": "..."},
  {"type": "info", "title": "...", "detail": "..."},
  {"type": "warning", "title": "...", "detail": "..."}
]

type must be one of: "warning", "positive", "info"
title: max 8 words
detail: max 25 words, actionable advice`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    const rawText = block.type === "text" ? block.text : "[]";

    let insightData: Array<{ type: string; title: string; detail: string }>;
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      insightData = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      insightData = [
        { type: "info", title: "Start tracking meals", detail: "Log your first meal to get personalized nutrition insights." },
        { type: "positive", title: "You're getting started!", detail: "Beginning nutrition tracking is a great step toward your health goals." },
        { type: "warning", title: "Hydration reminder", detail: "Aim for 8 glasses of water daily to support metabolism and energy." },
        { type: "info", title: "Balance your macros", detail: "Target 30% protein, 40% carbs, 30% fats for balanced nutrition." },
      ];
    }

    await db.delete(insightsTable);

    const inserted = await db
      .insert(insightsTable)
      .values(
        insightData.slice(0, 4).map(i => ({
          type: i.type || "info",
          title: i.title || "Insight",
          detail: i.detail || "",
        }))
      )
      .returning();

    res.json(inserted);
  } catch (err) {
    req.log.error({ err }, "Failed to get insights");
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

router.get("/wearable", async (req, res) => {
  try {
    const existing = await db.select().from(wearableTable).limit(1);

    if (existing.length > 0) {
      res.json(existing[0]);
      return;
    }

    const commentary = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `You are a health coach. Today's wearable metrics: 8,432 steps, 387 active calories, 7.2 hours sleep, 68 bpm resting heart rate. Write a brief 2-sentence AI commentary on how these metrics affect nutrition needs. Keep it under 40 words.`,
        },
      ],
    });

    const commentBlock = commentary.content[0];
    const aiCommentary = commentBlock.type === "text" ? commentBlock.text : "Great activity today! Your steps and sleep support healthy metabolism.";

    const [wearable] = await db
      .insert(wearableTable)
      .values({
        steps: 8432,
        activeCalories: 387,
        sleepHours: 7.2,
        heartRate: 68,
        aiCommentary,
      })
      .returning();

    res.json(wearable);
  } catch (err) {
    req.log.error({ err }, "Failed to get wearable data");
    res.status(500).json({ error: "Failed to get wearable data" });
  }
});

export default router;
