'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader/temp';
import { useAxiosGet } from '@/hooks/useAxios';

export default function InstantBattlePage() {
  const [opponentFound, setOpponentFound] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [battleData, setBattleData] = useState<{ id: string } | null>(null);
  const router = useRouter();
  const [getWaitingRoom] = useAxiosGet<{
    success?: boolean;
    opponentFound?: boolean;
    battleData?: { id: string };
  }>('/battles/waiting-room');

  useEffect(() => {
    const checkForOpponent = async () => {
      try {
        const response = await getWaitingRoom();
        if (!response.data) {
          throw new Error('Failed to check for opponent');
        }
        const data = response.data;
        if (data.success && data.opponentFound) {
          setOpponentFound(true);
          setBattleData(data.battleData ?? null);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to check for opponent.');
      }
    };

    const interval = setInterval(checkForOpponent, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !opponentFound) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (opponentFound) {
      toast.success('Opponent found! Starting battle...');
      setTimeout(() => {
        router.push(`/battles/${battleData?.id}`);
      }, 3000);
    } else if (timeLeft === 0) {
      toast.error('No opponent found. Battle cancelled.');
      router.push('/battle-zone');
    }
  }, [timeLeft, opponentFound, battleData, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 text-center shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          Waiting for Opponent
        </h1>
        {!opponentFound ? (
          <>
            <p className="mb-4 text-lg text-muted-foreground">
              Please wait while we find an opponent for you...
            </p>
            <div className="mb-4 h-2.5 w-full rounded-full bg-muted">
              <div
                className="h-2.5 rounded-full bg-blue transition-all duration-1000"
                style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
              ></div>
            </div>
            <p className="mb-6 text-muted-foreground">
              Time left: {timeLeft} seconds
            </p>
            <Loader />
          </>
        ) : (
          <p className="text-lg text-muted-foreground">
            Opponent found! Starting battle...
          </p>
        )}
      </div>
    </div>
  );
}
