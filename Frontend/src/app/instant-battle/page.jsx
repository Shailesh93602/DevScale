"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";

export default function InstantBattlePage() {
  const [opponentFound, setOpponentFound] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [battleData, setBattleData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkForOpponent = async () => {
      try {
        const response = await fetch(
          "https://mrengineersapi.vercel.app/battles/waiting-room",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to check for opponent");
        }
        const json = await response.json();
        if (json.success && json.opponentFound) {
          setOpponentFound(true);
          setBattleData(json.battleData);
        }
      } catch (error) {
        console.error("Error checking for opponent:", error);
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
      toast.success("Opponent found! Starting battle...");
      setTimeout(() => {
        router.push(`/battles/${battleData?.id}`);
      }, 3000);
    } else if (timeLeft === 0) {
      toast.error("No opponent found. Battle cancelled.");
      router.push("/battle-zone");
    }
  }, [timeLeft, opponentFound, battleData, router]);

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen flex items-center justify-center">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Waiting for Opponent
        </h1>
        {!opponentFound ? (
          <>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Please wait while we find an opponent for you...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Time left: {timeLeft} seconds
            </p>
            <Loader />
          </>
        ) : (
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Opponent found! Starting battle...
          </p>
        )}
      </div>
    </div>
  );
}
