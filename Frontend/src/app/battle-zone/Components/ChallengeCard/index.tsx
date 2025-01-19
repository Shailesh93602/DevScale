"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function ChallengeCard() {
  return (
    <div className="bg-lightSecondary rounded-md p-4 w-max">
      <div className="flex flex-col w-max gap-8">
        <span>Challenge your opponents</span>
        <p>Conquer Challenges and Rise as a Champion in our BattleZone.</p>
        <Button
          onClick={() => {}}
          className="bg-primary text-white hover:bg-primary2"
        >
          Challenge
        </Button>
      </div>
    </div>
  );
}
