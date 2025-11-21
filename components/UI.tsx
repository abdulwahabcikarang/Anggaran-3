
import React, { useEffect, useState } from 'react';

// --- COUNT UP ANIMATION ---
// Animates a number from 0 to 'end' value
export const CountUp: React.FC<{
    end: number;
    duration?: number;
    className?: string;
    formatter?: (val: number) => string;
}> = ({ end, duration = 1000, className, formatter }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease Out Expo for smooth "rolling" stop effect
            const ease = (x: number) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            
            const currentVal = end * ease(percentage);
            setCount(currentVal);

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [end, duration]);

    return <span className={className}>{formatter ? formatter(count) : Math.round(count)}</span>;
};

// --- SKELETON LOADING ---
// Placeholder for loading states
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200/70 rounded ${className}`}></div>
);

// --- AI TEXT SKELETON ---
// Specific skeleton pattern for AI text generation
export const AISkeleton: React.FC = () => (
    <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
    </div>
);
