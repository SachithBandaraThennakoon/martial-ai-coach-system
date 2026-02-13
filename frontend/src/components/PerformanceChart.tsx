import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function PerformanceChart({ data }: any) {
  return (
    <LineChart
      width={200}
      height={150}
      data={data}
    >
      <XAxis dataKey="rep" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="score"
        stroke="#2ecc71"
      />
    </LineChart>
  );
}
