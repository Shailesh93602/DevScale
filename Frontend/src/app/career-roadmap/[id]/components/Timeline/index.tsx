import React from 'react';

export const Timeline: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative">
      <div className="absolute left-1/2 h-full w-1 -translate-x-1/2 transform bg-primaryLight"></div>
      <div className="space-y-12">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="relative">
            <div className="absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-primary"></div>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
