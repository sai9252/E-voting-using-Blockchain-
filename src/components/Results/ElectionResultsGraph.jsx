import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ElectionResultsGraph = () => {
    const { electionId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/election-results/${electionId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching results:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [electionId]);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error)
        return <div className="text-center text-red-500">Error: {error}</div>;
    if (!data)
        return <div className="text-center text-red-500">No data found</div>;

    // Calculate total votes dynamically
    const sumOfAllVotes = data.partyVotes.reduce((sum, { totalVotes }) => sum + parseInt(totalVotes), 0) || 1;
    console.log(sumOfAllVotes);
    console.log(typeof sumOfAllVotes);

    // Recalculate winning percentage based on actual votes
    const partyVotesData = data.partyVotes.map(({ party, totalVotes }) => ({
        name: party,
        votes: totalVotes,
        percentage: ((totalVotes / sumOfAllVotes) * 100).toFixed(2), // Proper % calculation
    }));

    return (
        <div className="flex items-center justify-center p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4 text-center">
                    Election Results: Votes & Winning Percentage
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={partyVotesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickMargin={100} />
                        <YAxis yAxisId="left" orientation="left" allowDecimals={false} />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 100]}
                            allowDecimals={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="votes"
                            fill="#2563eb"
                            name="Total Votes"
                            radius={[10, 10, 0, 0]} // Rounded corners
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="percentage"
                            fill="#93c5fd"
                            name="Winning %"
                            radius={[10, 10, 0, 0]} // Rounded corners
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ElectionResultsGraph;
