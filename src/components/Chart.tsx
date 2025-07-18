import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const data = [
  { name: "avr.", value: 0 },
  { name: "mai", value: 0 },
  { name: "juin", value: 0 },
];

interface ChartProps {
  title: string;
  value: string;
  currency?: string;
  type?: "line" | "bar";
  className?: string;
}

export function Chart({
  title,
  value,
  currency = "MAD",
  type = "line",
  className,
}: ChartProps) {
  return (
    <div className={`neo-card p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-benaya-100 dark:bg-benaya-900 rounded-lg">
          <svg
            className="w-4 h-4 text-benaya-600 dark:text-benaya-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neo-gray-900 dark:text-neo-gray-100">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-benaya-600 dark:text-benaya-400">
          {value} {currency}
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-neo-gray-500"
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#14b8a6" }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-neo-gray-500"
                />
                <YAxis hide />
                <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
