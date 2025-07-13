"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBlobProps {
    className?: string;
    color?: 'blue' | 'purple' | 'emerald' | 'cyan';
}

export default function AnimatedBlob({ className = "", color = 'blue' }: AnimatedBlobProps) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const colorClasses = {
        blue: 'bg-blue-500/20',
        purple: 'bg-purple-500/20',
        emerald: 'bg-emerald-500/20',
        cyan: 'bg-cyan-500/20'
    };

    return (
        <motion.div
            ref={ref}
            className={`absolute rounded-full blur-3xl opacity-20 ${colorClasses[color]} ${className}`}
            animate={isInView ? {
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
            } : {}}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );
} 