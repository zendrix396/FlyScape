import React from 'react';

export default function GradientText({
    children,
    className = "",
}) {
    return (
        <div className={`font-medium ${className}`}>
            {children}
        </div>
    );
} 