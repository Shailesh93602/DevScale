
'use client'

import React from 'react'
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill }
    from 'react-icons/bs'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line }
    from 'recharts';
import './Achivement.css'

function Home() {

    const data = [
        {
            name: 'Day 1',
            webdevlopement: 100,
            appdevlopement: 40,
            ml: 24,
            DSA: 20,
        },
        {
            name: 'Day 2',
            webdevlopement: 70,
            appdevlopement: 35,
            ml: 34,
            DSA: 30,
        },
        {
            name: 'Day 3',
            webdevlopement: 50,
            appdevlopement: 45,
            ml: 44,
            DSA: 50,
        },
        {
            name: 'Day 4',
            webdevlopement: 60,
            appdevlopement: 30,
            ml: 34,
            DSA: 20,
        },
        {
            name: 'Day 5',
            webdevlopement: 56,
            appdevlopement: 46,
            ml: 24,
            DSA: 34,
        },
        {
            name: 'Day 6',
            webdevlopement: 33,
            appdevlopement: 38,
            ml: 44,
            DSA: 50,
        },
        {
            name: 'Day 7',
            webdevlopement: 25,
            appdevlopement: 23,
            ml: 38,
            DSA: 70,
        },
    ];


    return (
        <main className='main-container'>
            <div className='main-title'>
                <h4>Your weekly progress Report and achivement</h4>
            </div>

            <div className='main-cards'>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Web Devlopment</h3>
                        <BsFillArchiveFill className='card_icon' />
                    </div>
                    <h1>20%</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>App Devlopment</h3>
                        <BsFillGrid3X3GapFill className='card_icon' />
                    </div>
                    <h1>12%</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Machine Learning</h3>
                        <BsPeopleFill className='card_icon' />
                    </div>
                    <h1>33%</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Data science</h3>
                        <BsFillBellFill className='card_icon' />
                    </div>
                    <h1>100%</h1>
                </div>
            </div>

            <div className='charts'>
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
                        <Bar dataKey="webdevlopement" fill="#8884d8" />
                        <Bar dataKey="appdevlopement" fill="#82ca9d" />
                        <Bar dataKey="ml" fill="#8884d8" />
                        <Bar dataKey="DSA" fill="#82ca9d" />
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
                        <Line type="monotone" dataKey="webdevlopement" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="appdevlopement" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="ml" stroke="#9740da" />
                        <Line type="monotone" dataKey="DSA" stroke="#1925cc" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </main>
    )
}

export default Home





