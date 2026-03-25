import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Flame, Target, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

const WEEKLY_DATA = [
  { day: "Mon", calories: 1850 },
  { day: "Tue", calories: 2100 },
  { day: "Wed", calories: 1780 },
  { day: "Thu", calories: 2200 },
  { day: "Fri", calories: 1950 },
  { day: "Sat", calories: 2050 },
  { day: "Sun", calories: 1900 },
];

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here is your daily nutrition summary.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Calories Today" value="1,850" subtitle="Goal: 2,000 kcal" icon={Flame} color="text-orange-500" />
        <MetricCard title="Protein" value="112g" subtitle="Goal: 140g" icon={Target} color="text-primary" />
        <MetricCard title="Hydration" value="65%" subtitle="1.5L / 2.5L" icon={Droplet} color="text-blue-500" />
        <MetricCard title="Streak" value="12 Days" subtitle="Keep it up!" icon={TrendingUp} color="text-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Calorie Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={2000} stroke="hsl(var(--secondary))" strokeDasharray="3 3" />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Macros Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Macros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MacroBar label="Protein" current={112} total={140} unit="g" color="bg-primary" />
            <MacroBar label="Carbs" current={180} total={250} unit="g" color="bg-orange-500" />
            <MacroBar label="Fats" current={55} total={65} unit="g" color="bg-secondary" />
            <MacroBar label="Fiber" current={22} total={30} unit="g" color="bg-blue-500" />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 font-medium">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function MacroBar({ label, current, total, unit, color }: any) {
  const percent = Math.min(100, Math.round((current / total) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{current} / {total}{unit}</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
    </div>
  );
}
