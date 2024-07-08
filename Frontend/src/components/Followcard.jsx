// Card.jsx
'use client';
import React, { useState } from 'react';
import './Followcard.css';

function Card() {


    const users = [
        { name: 'John Doe', role: 'Software Developer' },
        { name: 'Jane Smith', role: 'Backend Developer' },
        { name: 'Michael Johnson', role: 'UX Designer' },
        { name: 'Sarah Wilson', role: 'Project Manager' },
        { name: 'David Brown', role: 'Frontend Developer' },
        { name: 'David Brown', role: 'Frontend Developer' },
        { name: 'David Brown', role: 'Frontend Developer' },
    ];



    const [follows, setFollows] = useState(() => {

        return users?.reduce((acc, user) => ({ ...acc, [user.name]: false }), {});
    });



    const toggleFollow = (userName) => {
        setFollows((prevFollows) => ({
            ...prevFollows,
            [userName]: !prevFollows[userName],
        }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, index) => (
                <div className="card" key={index}>
                    <div className="image"></div>
                    <div className="card-info">
                        <span>{user.name}</span>
                        <p>{user.role}</p>
                    </div>
                    <a
                        href="#"
                        className="button"
                        onClick={() => toggleFollow(user.name)}
                    >
                        {follows[user.name] ? 'Unfollow' : 'Follow'}
                    </a>
                </div>
            ))}
        </div>
    );
}

export default Card;
