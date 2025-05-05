import React from "react";

const ScrollReveal = ({
  children,
  containerClassName = "",
  textClassName = "",
}) => (
  <h2 className={`my-5 ${containerClassName}`}>
    <p className={`font-semibold ${textClassName}`}>{children}</p>
  </h2>
);

export default ScrollReveal; 