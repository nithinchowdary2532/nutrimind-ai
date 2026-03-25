import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useGetWeeklyInsights } from "@workspace/api-client-react";

export default function Insights() {
  const { data: insights = [], isLoading } = useGetWeeklyInsights();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-6 h-6 text-warning" />;
      case 'positive': return <CheckCircle className="w-6 h-6 text-success" />;
      default: return <Info className="w-6 h-6 text-primary" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'positive': return 'bg-success/10 border-success/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Weekly AI Insights</h1>
        <p className="text-muted-foreground mt-1">Personalized analysis based on your recent activity.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, idx) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${getBgColor(insight.type)}`}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="mt-1 p-2 bg-background rounded-full shadow-sm">
                    {getIcon(insight.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {insight.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{insight.title}</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">{insight.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {insights.length === 0 && (
             <div className="col-span-full text-center py-16 px-4 bg-muted/30 rounded-xl border border-border border-dashed">
               <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
               <p className="text-lg font-medium text-foreground">Not enough data yet</p>
               <p className="text-muted-foreground mt-1">Log a few meals to get personalized AI insights.</p>
             </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
