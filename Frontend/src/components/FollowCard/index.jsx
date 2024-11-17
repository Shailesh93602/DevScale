"use client";
import React, { useState } from "react";
import "./Followcard.css";

function Card({ users }) {
  const toggleFollow = (userName) => {
    setFollows((prevFollows) => ({
      ...prevFollows,
      [userName]: !prevFollows[userName],
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
  );
}

export default Card;
