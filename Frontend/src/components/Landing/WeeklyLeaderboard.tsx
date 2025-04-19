import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaTrophy, FaMedal, FaAward, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

// Sample leaderboard data
const leaderboardData = [
  {
    rank: 1,
    name: 'Sarthak Sharma',
    points: 2890,
    college: 'IIT Bombay',
    avatar: 'https://i.pravatar.cc/150?img=1', // Using pravatar.cc for placeholder avatars
  },
  {
    rank: 2,
    name: 'Pranav Agarwal',
    points: 2780,
    college: 'IIT Kharagpur',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    rank: 3,
    name: 'Aman Singh',
    points: 2690,
    college: 'BITS Pilani',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    rank: 4,
    name: 'Priya M.',
    points: 2610,
    college: 'IIT Delhi',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    rank: 5,
    name: 'Shailesh Chaudhari',
    points: 2580,
    college: 'VIT Vellore',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Medal components with better visuals
const MedalIcon = ({
  rank,
  isEmbedded = false,
}: {
  rank: number;
  isEmbedded?: boolean;
}) => {
  if (rank === 1) {
    return (
      <div
        className={`flex ${isEmbedded ? 'h-12 w-12 p-2.5' : 'h-14 w-14 p-3'} items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(255,215,0,0.5)]`}
      >
        <FaTrophy
          className={`${isEmbedded ? 'h-7 w-7' : 'h-8 w-8'} text-white drop-shadow-md`}
        />
      </div>
    );
  } else if (rank === 2) {
    return (
      <div
        className={`flex ${isEmbedded ? 'h-10 w-10 p-2' : 'h-12 w-12 p-3'} items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_0_10px_rgba(192,192,192,0.5)]`}
      >
        <FaMedal
          className={`${isEmbedded ? 'h-6 w-6' : 'h-7 w-7'} text-white drop-shadow-md`}
        />
      </div>
    );
  } else {
    return (
      <div
        className={`flex ${isEmbedded ? 'h-9 w-9 p-2' : 'h-11 w-11 p-3'} items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_0_10px_rgba(176,141,87,0.5)]`}
      >
        <FaAward
          className={`${isEmbedded ? 'h-5 w-5' : 'h-6 w-6'} text-white drop-shadow-md`}
        />
      </div>
    );
  }
};

// User avatar component with fallback to initials
const UserAvatar = ({
  user,
  isEmbedded = false,
}: {
  user: (typeof leaderboardData)[0];
  isEmbedded?: boolean;
}) => {
  const [imgError, setImgError] = React.useState(false);
  const size = isEmbedded ? 'h-12 w-12' : 'h-16 w-16';
  const fontSize = isEmbedded ? 'text-lg' : 'text-xl';

  return imgError ? (
    <div
      className={`flex ${size} items-center justify-center rounded-full ${fontSize} font-bold text-white ${
        user.rank === 1
          ? 'bg-yellow-500'
          : user.rank === 2
            ? 'bg-gray-500'
            : 'bg-amber-700'
      }`}
    >
      {getInitials(user.name)}
    </div>
  ) : (
    <Image
      src={user.avatar}
      alt={user.name}
      width={isEmbedded ? 48 : 64}
      height={isEmbedded ? 48 : 64}
      className={`${size} rounded-full border-2 border-white object-cover shadow-md`}
      onError={() => setImgError(true)}
      unoptimized={user.avatar.startsWith('http')} // Skip optimization for external URLs
    />
  );
};

interface WeeklyLeaderboardProps {
  isEmbedded?: boolean;
}

export default function WeeklyLeaderboard({
  isEmbedded = false,
}: WeeklyLeaderboardProps) {
  // Only show the top 3
  const toppers = leaderboardData.slice(0, 3);

  // Heights for podium bars (center tallest) - adjust based on embedding
  const heights = isEmbedded
    ? ['h-28', 'h-20', 'h-16']
    : ['h-40', 'h-32', 'h-24'];

  // Widths for podium bars - make them wider
  const widths = isEmbedded
    ? ['w-24', 'w-24', 'w-24']
    : ['w-28', 'w-28', 'w-28'];
  // Correct order: 2nd left, 1st center, 3rd right
  const podiumOrder = [1, 0, 2];

  return (
    <section
      className={`relative z-10 overflow-hidden ${!isEmbedded ? 'bg-gradient-to-b from-[#1e293b] via-[#232946] to-[#18181b]' : ''} ${isEmbedded ? 'py-4' : 'py-10'} text-white`}
    >
      {/* Background decorative elements - only show when not embedded */}
      {!isEmbedded && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-purple-700 blur-3xl"></div>
          <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-blue-700 blur-3xl"></div>
        </div>
      )}

      <div className="relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            className={`${isEmbedded ? 'mb-1 text-2xl' : 'mb-3 text-3xl sm:text-4xl'} font-bold tracking-tight text-white drop-shadow-lg`}
          >
            Weekly Leaderboard
          </h2>
          {!isEmbedded && (
            <p className="mb-6 text-base text-gray-300 sm:text-lg">
              Celebrate the top performers of the week! Compete, climb, and
              claim your spot among the best engineers.
            </p>
          )}
          {isEmbedded && (
            <p className="mb-3 text-sm text-gray-300">
              Compete, climb, and claim your spot among the best engineers.
            </p>
          )}
        </motion.div>

        <div className="mx-auto flex max-w-3xl flex-col items-center">
          {/* Enhanced 3D Podium display */}
          <div className="relative mb-8 flex w-full items-end justify-center gap-8 md:gap-12">
            {podiumOrder.map((podiumIdx, i) => {
              const user = toppers[podiumIdx];
              let barHeight = '';
              if (podiumIdx === 0)
                barHeight = heights[0]; // 1st
              else if (podiumIdx === 1)
                barHeight = heights[1]; // 2nd
              else barHeight = heights[2]; // 3rd

              // Enhanced color schemes for podiums
              const podiumColors = {
                first: {
                  top: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
                  front: 'bg-gradient-to-b from-yellow-500 to-yellow-600',
                  side: 'bg-gradient-to-b from-yellow-600 to-yellow-700',
                  shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
                },
                second: {
                  top: 'bg-gradient-to-r from-gray-300 to-gray-400',
                  front: 'bg-gradient-to-b from-gray-400 to-gray-500',
                  side: 'bg-gradient-to-b from-gray-500 to-gray-600',
                  shadow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
                },
                third: {
                  top: 'bg-gradient-to-r from-amber-600 to-amber-700',
                  front: 'bg-gradient-to-b from-amber-700 to-amber-800',
                  side: 'bg-gradient-to-b from-amber-800 to-amber-900',
                  shadow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]',
                },
              };

              const colors =
                podiumIdx === 0
                  ? podiumColors.first
                  : podiumIdx === 1
                    ? podiumColors.second
                    : podiumColors.third;

              return (
                <motion.div
                  key={user.rank}
                  className={`relative flex ${isEmbedded ? 'w-20 md:w-24' : 'w-24 md:w-28'} flex-col items-center`}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2 * i,
                    type: 'spring',
                    stiffness: 100,
                  }}
                >
                  {/* User avatar positioned above the podium */}
                  <motion.div
                    className={`absolute ${isEmbedded ? '-top-16' : '-top-20'} z-20`}
                    initial={{ scale: 0.8, y: 10 }}
                    whileInView={{ scale: 1, y: 0 }}
                    transition={{
                      delay: 0.5 + 0.2 * i,
                      duration: 0.5,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <UserAvatar user={user} isEmbedded={isEmbedded} />
                  </motion.div>

                  {/* Medal icon */}
                  <motion.div
                    className={`absolute ${isEmbedded ? '-top-28' : '-top-32'} z-10`}
                    initial={{ scale: 0, rotate: -30 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.7 + 0.2 * i,
                      duration: 0.5,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <MedalIcon rank={user.rank} isEmbedded={isEmbedded} />
                  </motion.div>

                  {/* 3D Podium with perspective */}
                  <div className="relative">
                    {/* Top face */}
                    <div
                      className={`${widths[podiumIdx]} ${barHeight} relative ${colors.top} rounded-t-md ${colors.shadow}`}
                    >
                      {/* Front face - 3D effect */}
                      <div
                        className={`absolute -bottom-3 left-0 h-3 w-full ${colors.front} skew-x-[0deg] transform rounded-b-md`}
                      ></div>
                      {/* Right side face - 3D effect */}
                      <div
                        className={`absolute -right-3 top-0 h-full w-3 ${colors.side} skew-y-[0deg] transform rounded-r-md`}
                      ></div>
                    </div>

                    {/* Rank number on podium */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-3xl font-bold text-white drop-shadow-md">
                      {user.rank}
                    </div>
                  </div>

                  {/* Enhanced info card */}
                  <motion.div
                    className="mt-4 flex w-full flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + 0.1 * i, duration: 0.5 }}
                  >
                    <div
                      className={`flex ${widths[podiumIdx]} flex-col items-center rounded-xl border border-gray-700/30 bg-white/10 px-3 py-2 backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:shadow-lg`}
                    >
                      <span
                        className="w-full truncate text-center text-sm font-semibold text-white"
                        title={user.name}
                      >
                        {user.name}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          user.rank === 1
                            ? 'text-yellow-300'
                            : user.rank === 2
                              ? 'text-gray-300'
                              : 'text-amber-400'
                        }`}
                      >
                        {user.points.toLocaleString()} pts
                      </span>
                      <span className="mt-0.5 text-[10px] text-gray-400">
                        {user.college}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Additional leaderboard entries */}
          <motion.div
            className={`${isEmbedded ? 'mt-1' : 'mt-2'} w-full max-w-md`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {leaderboardData.slice(3, 5).map((user, index) => (
              <motion.div
                key={user.rank}
                className="mb-1 flex items-center rounded-lg border border-gray-700/30 bg-white/5 p-1.5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
              >
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-300">
                  {user.rank}
                </div>
                <div className="mr-2">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border border-gray-700 object-cover"
                    unoptimized={user.avatar.startsWith('http')} // Skip optimization for external URLs
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (
                        e.target as HTMLElement
                      ).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
                    {getInitials(user.name)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {user.college}
                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-gray-300">
                  {user.points.toLocaleString()} pts
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className={`${isEmbedded ? 'mt-2' : 'mt-4'} text-center`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <Link
              href="/battle-zone"
              className="inline-flex items-center text-sm text-primary transition-colors hover:text-primary2"
            >
              Will you make it to the top?{' '}
              <FaArrowRight className="ml-1" size={12} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
