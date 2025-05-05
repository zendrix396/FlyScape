import React from 'react';

const CountUp = ({ to = 100, separator = '', className = '' }) => (
  <span className={className}>
    {to.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)}
  </span>
);

export default CountUp; 