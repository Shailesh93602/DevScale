'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function ChallengeCard() {
  return (
    <div className="w-max rounded-md bg-lightSecondary p-4">
      <div className="flex w-max flex-col gap-8">
        <span>Challenge your opponents</span>
        <p>Conquer Challenges and Rise as a Champion in our BattleZone.</p>
        <Button onClick={() => {}}>Challenge</Button>
      </div>
    </div>
  );
}
