import React, { ReactNode } from "react";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="mb-12">
    <h3 className="text-3xl dark:text-gray-200 font-bold mb-6">{title}</h3>
    {children}
  </div>
);

export default Section;
