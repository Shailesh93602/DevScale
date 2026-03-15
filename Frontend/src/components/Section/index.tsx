import React, { ReactNode } from 'react';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="mb-12">
    <h3 className="mb-6 text-3xl font-bold text-foreground">{title}</h3>
    {children}
  </div>
);

export default Section;
