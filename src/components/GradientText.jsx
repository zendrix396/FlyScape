import React, { useState, useEffect } from 'react';

export default function GradientText({
    children,
    className = "",
    colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
    animationSpeed = 8,
    showBorder = false,
    printMode = false,
}) {
    const [isPrintMode, setIsPrintMode] = useState(printMode);
    
    useEffect(() => {
        const checkPrintMode = () => {
            const isPrinting = document.querySelector('[data-print-mode="true"]');
            setIsPrintMode(printMode || !!isPrinting);
        };
        
        checkPrintMode();
        document.body.addEventListener('beforeprint', () => setIsPrintMode(true));
        document.body.addEventListener('afterprint', () => setIsPrintMode(false));
        
        return () => {
            document.body.removeEventListener('beforeprint', () => setIsPrintMode(true));
            document.body.removeEventListener('afterprint', () => setIsPrintMode(false));
        };
    }, [printMode]);
    
    const printColor = typeof colors === 'string' ? colors : 
                      Array.isArray(colors) && colors.length > 0 ? colors[0] : '#10b981';
    
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        animationDuration: `${animationSpeed}s`,
    };
    
    const printStyle = {
        color: printColor,
        background: 'transparent',
    };

    return (
        <div
            className={`relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer ${className}`}
        >
            {showBorder && !isPrintMode && (
                <div
                    className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
                    style={{
                        ...gradientStyle,
                        backgroundSize: "300% 100%",
                    }}
                >
                    <div
                        className="absolute inset-0 bg-black rounded-[1.25rem] z-[-1]"
                        style={{
                            width: "calc(100% - 2px)",
                            height: "calc(100% - 2px)",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    ></div>
                </div>
            )}
            <div
                className="inline-block relative z-2 text-transparent bg-cover animate-gradient"
                style={isPrintMode ? printStyle : {
                    ...gradientStyle,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    backgroundSize: "300% 100%",
                }}
            >
                {children}
            </div>
        </div>
    );
} 