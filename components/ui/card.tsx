import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={`rounded-lg shadow-md bg-white ${className}`}>
            {children}
        </div>
    );
}