import React from "react";

const Section = ({ title, children }) => (
  <div className="mb-12">
    <h3 className="text-3xl font-bold mb-6">{title}</h3>
    {children}
  </div>
);

export default Section;
