export const ProgressCircle = ({ completed }: { completed: number }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completed / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          className="text-muted"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-primary transition-all duration-1000 ease-in-out"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-primary font-semibold">
        {completed}%
      </div>
    </div>
  );
};
