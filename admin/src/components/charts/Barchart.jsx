import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Barchart({ data, isLoading }) {

  if (isLoading) {
    return "Loading Sales ...";
  }

  if (data.length === 0) {
    return <p>Sotuvlar mavjud emas</p>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalKeldi" fill="#8884d8" />
        <Bar dataKey="totalKetdi" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}