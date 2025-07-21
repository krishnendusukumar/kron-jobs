"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GradientButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export default function GradientButton({
    children,
    onClick,
    icon: Icon,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button'
}: GradientButtonProps) {
    const baseClasses = "font-semibold transition-all duration-300 rounded-2xl flex items-center justify-center space-x-2";

    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    const variantClasses = {
        primary: "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-xl hover:shadow-cyan-500/25 hover:shadow-purple-500/25 hover:from-cyan-400 hover:to-purple-500",
        secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-gray-500/25 hover:from-gray-500 hover:to-gray-600",
        outline: "border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/70"
    };

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} cursor-pointer ${className}`;

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{children}</span>
        </motion.button>
    );
} 