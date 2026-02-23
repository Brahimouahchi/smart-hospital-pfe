import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const PatientChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch real growth data from Python
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/chart-data');
        setData(response.data);
      } catch (error) {
        console.error("Chart Error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="patients" 
            stroke="#8884d8" 
            strokeWidth={3} 
            dot={{ r: 6 }} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientChart;