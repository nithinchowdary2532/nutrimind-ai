import { Card, CardContent } from "@/components/ui/card";
import { Activity, Flame, Moon, Heart, Sparkles, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useGetWearableData } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function Wearable() {
  const { data: wearable, isLoading, refetch, isRefetching } = useGetWearableData();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wearable Sync</h1>
          <p className="text-muted-foreground mt-1">Data imported from your connected devices.</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl border border-border" />)}
        </div>
      ) : wearable ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Steps" value={wearable.steps.toLocaleString()} icon={Activity} color="text-blue-500" />
            <MetricCard title="Active Kcal" value={wearable.activeCalories} icon={Flame} color="text-orange-500" />
            <MetricCard title="Sleep" value={`${wearable.sleepHours}h`} icon={Moon} color="text-indigo-500" />
            <MetricCard title="Avg HR" value={`${wearable.heartRate} bpm`} icon={Heart} color="text-red-500" />
          </div>

          <Card className="border-2 border-secondary/20 bg-secondary/5 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-xl shadow-sm text-white shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">AI Physiology Commentary</h3>
                  <p className="text-foreground/80 leading-relaxed md:text-lg font-medium">
                    "{wearable.aiCommentary}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 font-semibold uppercase tracking-wider">
                    Last synced: {format(new Date(wearable.updatedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-16 px-4 bg-muted/30 rounded-xl border border-border border-dashed">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">No wearable data found</p>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
      </CardContent>
    </Card>
  );
}
