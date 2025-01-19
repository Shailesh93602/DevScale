"use client";

import React from "react";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsFillBellFill,
} from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "./achievements.css";

function Home() {
  const data = [
    {
      name: "Day 1",
      webDevelopment: 100,
      appDevelopment: 40,
      ML: 24,
      DSA: 20,
    },
    {
      name: "Day 2",
      webDevelopment: 70,
      appDevelopment: 35,
      ml: 34,
      DSA: 30,
    },
    {
      name: "Day 3",
      webDevelopment: 50,
      appDevelopment: 45,
      ML: 44,
      DSA: 50,
    },
    {
      name: "Day 4",
      webDevelopment: 60,
      appDevelopment: 30,
      ML: 34,
      DSA: 20,
    },
    {
      name: "Day 5",
      webDevelopment: 56,
      appDevelopment: 46,
      ML: 24,
      DSA: 34,
    },
    {
      name: "Day 6",
      webDevelopment: 33,
      appDevelopment: 38,
      ML: 44,
      DSA: 50,
    },
    {
      name: "Day 7",
      webDevelopment: 25,
      appDevelopment: 23,
      ML: 38,
      DSA: 70,
    },
  ];

  return (
    <main className="main-container">
      <div className="main-title">
        <h4>Your weekly progress Report and Achievements</h4>
      </div>

      <div className="main-cards">
        <div className="card">
          <div className="card-inner">
            <h3>Web Development</h3>
            <BsFillArchiveFill className="card_icon" />
          </div>
          <h1>20%</h1>
        </div>
        <div className="card">
          <div className="card-inner">
            <h3>App Development</h3>
            <BsFillGrid3X3GapFill className="card_icon" />
          </div>
          <h1>12%</h1>
        </div>
        <div className="card">
          <div className="card-inner">
            <h3>Machine Learning</h3>
            <BsPeopleFill className="card_icon" />
          </div>
          <h1>33%</h1>
        </div>
        <div className="card">
          <div className="card-inner">
            <h3>Data science</h3>
            <BsFillBellFill className="card_icon" />
          </div>
          <h1>100%</h1>
        </div>
      </div>

      <div className="charts">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="webDevelopment" fill="blue" />
            <Bar dataKey="appDevelopment" fill="orange" />
            <Bar dataKey="ML" fill="green" />
            <Bar dataKey="DSA" fill="red" />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="webDevelopment"
              stroke="blue"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="appDevelopment" stroke="orange" />
            <Line type="monotone" dataKey="ML" stroke="green" />
            <Line type="monotone" dataKey="DSA" stroke="red" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

export default Home;
