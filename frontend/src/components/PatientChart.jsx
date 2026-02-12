import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fake data for now (Later we will connect this to Python)
const data = [
  { name: 'Mon', patients: 2 },
  { name: 'Tue', patients: 5 },
  { name: 'Wed', patients: 3 },
  { name: 'Thu', patients: 8 },
  { name: 'Fri', patients: 12 },
  { name: 'Sat', patients: 6 },
  { name: 'Sun', patients: 4 },
];

const PatientChart = () => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="patients" stroke="#8884d8" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientChart;