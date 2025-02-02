import React, { useState } from 'react';
// import AchievementsCard from "./AchievementsCard";
import { CheckIcon } from 'lucide-react';

const VerticalStepper = () => {
  const [steps] = useState([
    { title: 'Step 1', description: 'Description of Step 1', achieved: false },
    { title: 'Step 2', description: 'Description of Step 2', achieved: false },
    { title: 'Step 3', description: 'Description of Step 3', achieved: false },
    { title: 'Step 4', description: 'Description of Step 4', achieved: false },
    { title: 'Step 5', description: 'Description of Step 5', achieved: false },
  ]);

  // const handleAchievementUnlock = (stepIndex: number) => {
  //   const updatedSteps = [...steps];
  //   updatedSteps[stepIndex].achieved = true;
  //   setSteps(updatedSteps);
  // };

  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 ${
              step.achieved ? 'border-green-500 bg-green-500' : 'bg-gray-300'
            }`}
          >
            {step.achieved ? (
              <CheckIcon className="h-4 w-4 text-white" />
            ) : (
              index + 1
            )}
          </div>
          <div className="ml-4">
            <h3
              className={`font-bold ${
                step.achieved ? 'text-green-500' : 'text-gray-900'
              }`}
            >
              {step.title}
            </h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
      {/* <div className="mt-4">
        <AchievementsCard  />
      </div> */}
    </div>
  );
};

export default VerticalStepper;
