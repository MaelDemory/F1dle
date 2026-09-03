import React, { useMemo } from 'react';

type ConfettiProps = {
    active: boolean;
    pieces?: number;
};

type ConfettiPiece = {
    id: number;
    left: string;
    delay: string;
    duration: string;
    size: string;
    rotation: string;
    color: string;
    opacity: number;
};

const palette = [
    'hsl(var(--accent))',
    'hsl(var(--game-difficulty-1))',
    'hsl(var(--game-difficulty-2))',
    'hsl(var(--game-difficulty-3))',
    'hsl(var(--game-difficulty-4))',
];

export const Confetti = ({ active, pieces = 120 }: ConfettiProps) => {
    const confettiPieces = useMemo<ConfettiPiece[]>(() => {
        return Array.from({ length: pieces }, (_, index) => ({
            id: index,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 0.9}s`,
            duration: `${3.2 + Math.random() * 2.4}s`,
            size: `${8 + Math.random() * 10}px`,
            rotation: `${Math.random() * 360}deg`,
            color: palette[index % palette.length],
            opacity: 0.65 + Math.random() * 0.35
        }));
    }, [pieces]);

    if (!active) {
        return null;
    }

    return (
        <div className="confetti-overlay" aria-hidden="true">
            {confettiPieces.map((piece) => (
                <span
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: piece.left,
                        animationDelay: piece.delay,
                        animationDuration: piece.duration,
                        width: piece.size,
                        height: piece.size,
                        background: piece.color,
                        opacity: piece.opacity,
                        transform: `rotate(${piece.rotation})`
                    }}
                />
            ))}
        </div>
    );
}