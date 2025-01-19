import React from "react";

export const Timeline: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primaryLight"></div>
      <div className="space-y-12">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full"></div>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
