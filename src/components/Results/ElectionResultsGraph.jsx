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
import PropTypes from 'prop-types';




// props = {data:<value>}
const ElectionResultsGraph = ({data}) => {

    if (!data)
        return <div className="text-center text-red-500">No data found</div>;

    // Calculate total votes dynamically
    const sumOfAllVotes = data.reduce((sum, { votes }) => sum + parseInt(votes), 0) || 1;
    
    // Recalculate winning percentage based on actual votes
    const partyVotesData = data.map(({ party, votes }) => ({
        name: party,
        votes: votes,
        percentage: ((votes / sumOfAllVotes) * 100).toFixed(2), // Proper % calculation
    }));
    console.log(partyVotesData);

    return (
        <div className="flex items-center justify-center p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4 text-center">
                    Election Results: Votes & Winning Percentage
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={partyVotesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickMargin={10} />
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


ElectionResultsGraph.propTypes = {
    data: PropTypes.array, // or whatever type your 'data' prop should be
  };


export default ElectionResultsGraph;
