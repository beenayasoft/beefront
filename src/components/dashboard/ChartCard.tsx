import { useState } from "react";
import { BarChart3, TrendingUp, Calendar, MoreHorizontal } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const chartData = [
  { name: "Jan", value: 0, target: 50000 },
  { name: "Fév", value: 0, target: 55000 },
  { name: "Mar", value: 0, target: 60000 },
  { name: "Avr", value: 0, target: 65000 },
  { name: "Mai", value: 0, target: 70000 },
  { name: "Jun", value: 0, target: 75000 },
];

interface ChartCardProps {
  title: string;
  period: string;
  onPeriodChange: (period: string) => void;
}

export function ChartCard({ title, period, onPeriodChange }: ChartCardProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
        "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%233b82f6" fill-opacity="0.1"%3E%3Cpath d="M20 20.5V18H18v2.5h-2.5V22H18v2.5h2V22h2.5v-1.5H20z"/%3E%3C/g%3E%3C/svg%3E\')]'
          }
        ></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  "bg-gradient-to-br from-blue-500 to-purple-600",
                  "shadow-lg shadow-blue-500/25",
                )}
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100/50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Tendance
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Ce mois
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType("area")}>
                  Graphique en aires
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  Graphique linéaire
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Metric */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              0,00
            </span>
            <span className="text-xl font-medium text-slate-600 dark:text-slate-400">
              MAD
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Chiffre d'affaires total sur la période
          </p>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                  stroke="currentColor"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorTarget)"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                  stroke="currentColor"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: "#3b82f6" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Réalisé
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full opacity-70"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Objectif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
