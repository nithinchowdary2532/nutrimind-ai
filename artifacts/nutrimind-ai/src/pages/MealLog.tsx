import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Utensils, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useListMeals, useCreateMeal, useDeleteMeal } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function MealLog() {
  const [description, setDescription] = useState("");
  const [mealTime, setMealTime] = useState("Lunch");
  
  const queryClient = useQueryClient();
  const { data: meals = [], isLoading } = useListMeals({ date: "today" });
  
  const createMutation = useCreateMeal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meals"] });
        setDescription("");
      }
    }
  });

  const deleteMutation = useDeleteMeal({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meals"] })
    }
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    createMutation.mutate({ data: { description, mealTime } });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meal Log</h1>
        <p className="text-muted-foreground mt-1">Track and analyze your meals with AI.</p>
      </div>

      <Card className="border-2 border-primary/10 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g. Grilled salmon with quinoa and roasted asparagus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              disabled={createMutation.isPending}
            />
            <select
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              disabled={createMutation.isPending}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
            <Button 
              type="submit" 
              variant="default" 
              size="lg" 
              showArrow 
              disabled={createMutation.isPending || !description.trim()}
              className="md:w-auto w-full"
            >
              {createMutation.isPending ? "Analyzing..." : "Analyze Meal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary" /> Today's Meals
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl border border-border" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-16 px-4 bg-muted/30 rounded-xl border border-border border-dashed">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No meals logged today</p>
            <p className="text-muted-foreground mt-1">Describe what you ate above to get started.</p>
          </div>
        ) : (
          <AnimatePresence>
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 text-xs font-semibold bg-muted text-foreground rounded-md">
                            {meal.mealTime}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(meal.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-foreground">{meal.description}</h4>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <MacroBadge label="Kcal" value={meal.calories} />
                          <MacroBadge label="Pro" value={`${meal.protein}g`} />
                          <MacroBadge label="Carb" value={`${meal.carbs}g`} />
                          <MacroBadge label="Fat" value={`${meal.fats}g`} />
                        </div>
                      </div>
                      
                      <div className="md:w-64 flex flex-col justify-between bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <div>
                          <div className="flex items-center gap-1.5 text-primary font-semibold mb-1 text-sm">
                            <Sparkles className="w-4 h-4" /> AI Insight
                          </div>
                          <p className="text-sm text-foreground/80 leading-snug">{meal.insight}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs font-semibold bg-white px-2 py-1 rounded shadow-sm text-primary">
                            Score: {meal.healthScore}/10
                          </div>
                          <button 
                            onClick={() => deleteMutation.mutate({ id: meal.id })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Delete meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

function MacroBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
      <span className="px-2 py-1 bg-muted text-xs font-medium text-muted-foreground border-r border-border">{label}</span>
      <span className="px-3 py-1 text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
