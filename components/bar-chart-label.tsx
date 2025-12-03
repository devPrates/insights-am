"use client";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type Datum = { label: string; value: number };

const chartConfig: ChartConfig = {
  value: {
    label: "Valor",
    color: "var(--chart-4)",
  },
};

export function ChartBarLabel({
  title,
  description,
  data,
  titleClassName,
}: {
  title: string;
  description?: string;
  data: Datum[];
  titleClassName?: string;
}) {
  const fills = data.map((d) =>
    d.label === "Prazo técnico"
      ? "#FACC15"
      : d.label === "Atrasadas"
      ? "#EF4444"
      : "var(--color-value)"
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className={titleClassName}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={8}>
              {fills.map((fill, i) => (
                <Cell key={`cell-${i}`} fill={fill} />
              ))}
              <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
