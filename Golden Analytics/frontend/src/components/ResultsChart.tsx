import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

type Props = {
    data: any[];
    resultType: string;
};

export default function ResultsChart({
    data,
    resultType,
}: Props) {

    const chartData =
        data?.map((row) => ({
            name:
                resultType === "vendors"
                    ? row?._id?.vendor
                    : resultType === "categories"
                        ? row?._id?.category
                        : row?._id?.agency ??
                        row?._id ??
                        "Unknown",

            amount: Number(
                row?.totalAmount ?? 0
            ),
        })) ?? [];

    return (
        <div
            style={{
                width: "100%",
                minHeight: "400px",
                marginBottom: "2rem",
            }}
        >
            <ResponsiveContainer
                width="100%"
                height={400}
            >
                <BarChart data={chartData}>
                    <CartesianGrid
                        stroke="#222"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="name"
                        hide
                    />

                    <YAxis
                        tick={{ fill: "#888" }}
                        tickFormatter={(value) => {

                            if (
                                value >= 1_000_000_000
                            ) {
                                return `$${(
                                    value /
                                    1_000_000_000
                                ).toFixed(1)}B`;
                            }

                            if (
                                value >= 1_000_000
                            ) {
                                return `$${(
                                    value /
                                    1_000_000
                                ).toFixed(1)}M`;
                            }

                            if (
                                value >= 1_000
                            ) {
                                return `$${(
                                    value /
                                    1_000
                                ).toFixed(1)}K`;
                            }

                            return `$${value}`;
                        }}
                    />

                    <Tooltip
                        formatter={(value) => [
                            `$${Number(
                                value
                            ).toLocaleString()}`,
                            "Amount",
                        ]}
                    />

                    <Bar
                        dataKey="amount"
                        fill="#38bdf8"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}