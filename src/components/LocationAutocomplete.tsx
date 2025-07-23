"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';

interface LocationOption {
    name: string;
    country: string;
    type: 'city' | 'country' | 'remote';
}

// Popular cities and countries for autocomplete
const locationOptions: LocationOption[] = [
    // Major US Cities
    { name: 'New York, NY', country: 'United States', type: 'city' },
    { name: 'San Francisco, CA', country: 'United States', type: 'city' },
    { name: 'Los Angeles, CA', country: 'United States', type: 'city' },
    { name: 'Chicago, IL', country: 'United States', type: 'city' },
    { name: 'Austin, TX', country: 'United States', type: 'city' },
    { name: 'Seattle, WA', country: 'United States', type: 'city' },
    { name: 'Boston, MA', country: 'United States', type: 'city' },
    { name: 'Denver, CO', country: 'United States', type: 'city' },
    { name: 'Atlanta, GA', country: 'United States', type: 'city' },
    { name: 'Miami, FL', country: 'United States', type: 'city' },

    // Major European Cities
    { name: 'London, UK', country: 'United Kingdom', type: 'city' },
    { name: 'Berlin, Germany', country: 'Germany', type: 'city' },
    { name: 'Paris, France', country: 'France', type: 'city' },
    { name: 'Amsterdam, Netherlands', country: 'Netherlands', type: 'city' },
    { name: 'Barcelona, Spain', country: 'Spain', type: 'city' },
    { name: 'Stockholm, Sweden', country: 'Sweden', type: 'city' },
    { name: 'Zurich, Switzerland', country: 'Switzerland', type: 'city' },
    { name: 'Dublin, Ireland', country: 'Ireland', type: 'city' },
    { name: 'Vienna, Austria', country: 'Austria', type: 'city' },
    { name: 'Copenhagen, Denmark', country: 'Denmark', type: 'city' },

    // Major Asian Cities
    { name: 'Tokyo, Japan', country: 'Japan', type: 'city' },
    { name: 'Singapore', country: 'Singapore', type: 'city' },
    { name: 'Seoul, South Korea', country: 'South Korea', type: 'city' },
    { name: 'Hong Kong', country: 'Hong Kong', type: 'city' },
    { name: 'Bangalore, India', country: 'India', type: 'city' },
    { name: 'Mumbai, India', country: 'India', type: 'city' },
    { name: 'Delhi, India', country: 'India', type: 'city' },
    { name: 'Hyderabad, India', country: 'India', type: 'city' },
    { name: 'Pune, India', country: 'India', type: 'city' },
    { name: 'Chennai, India', country: 'India', type: 'city' },
    { name: 'Kolkata, India', country: 'India', type: 'city' },
    { name: 'Gurgaon, India', country: 'India', type: 'city' },
    { name: 'Noida, India', country: 'India', type: 'city' },
    { name: 'Beijing, China', country: 'China', type: 'city' },
    { name: 'Shanghai, China', country: 'China', type: 'city' },
    { name: 'Sydney, Australia', country: 'Australia', type: 'city' },
    { name: 'Melbourne, Australia', country: 'Australia', type: 'city' },

    // Major Canadian Cities
    { name: 'Toronto, Canada', country: 'Canada', type: 'city' },
    { name: 'Vancouver, Canada', country: 'Canada', type: 'city' },
    { name: 'Montreal, Canada', country: 'Canada', type: 'city' },
    { name: 'Ottawa, Canada', country: 'Canada', type: 'city' },

    // Countries
    { name: 'United States', country: 'United States', type: 'country' },
    { name: 'Canada', country: 'Canada', type: 'country' },
    { name: 'United Kingdom', country: 'United Kingdom', type: 'country' },
    { name: 'Germany', country: 'Germany', type: 'country' },
    { name: 'France', country: 'France', type: 'country' },
    { name: 'Netherlands', country: 'Netherlands', type: 'country' },
    { name: 'Spain', country: 'Spain', type: 'country' },
    { name: 'Sweden', country: 'Sweden', type: 'country' },
    { name: 'Switzerland', country: 'Switzerland', type: 'country' },
    { name: 'Ireland', country: 'Ireland', type: 'country' },
    { name: 'Austria', country: 'Austria', type: 'country' },
    { name: 'Denmark', country: 'Denmark', type: 'country' },
    { name: 'Japan', country: 'Japan', type: 'country' },
    { name: 'Singapore', country: 'Singapore', type: 'country' },
    { name: 'South Korea', country: 'South Korea', type: 'country' },
    { name: 'Hong Kong', country: 'Hong Kong', type: 'country' },
    { name: 'India', country: 'India', type: 'country' },
    { name: 'China', country: 'China', type: 'country' },
    { name: 'Australia', country: 'Australia', type: 'country' },

    // Remote options
    { name: 'Remote', country: 'Worldwide', type: 'remote' },
    { name: 'Remote (US)', country: 'United States', type: 'remote' },
    { name: 'Remote (Europe)', country: 'Europe', type: 'remote' },
    { name: 'Remote (Global)', country: 'Worldwide', type: 'remote' },
];

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export default function LocationAutocomplete({
    value,
    onChange,
    placeholder = "e.g., New York, NY or Remote",
    className = "",
    required = false
}: LocationAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<LocationOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on input value
    useEffect(() => {
        if (!value.trim()) {
            setFilteredOptions(locationOptions.slice(0, 10)); // Show first 10 options when empty
        } else {
            const filtered = locationOptions.filter(option =>
                option.name.toLowerCase().includes(value.toLowerCase()) ||
                option.country.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredOptions(filtered.slice(0, 8)); // Limit to 8 results
        }
        setHighlightedIndex(-1);
    }, [value]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
    };

    // Handle option selection
    const handleOptionSelect = (option: LocationOption) => {
        onChange(option.name);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                return;
            }
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleOptionSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get icon based on location type
    const getLocationIcon = (type: string) => {
        switch (type) {
            case 'city':
                return <MapPin className="w-4 h-4 text-cyan-400" />;
            case 'country':
                return <Search className="w-4 h-4 text-blue-400" />;
            case 'remote':
                return <div className="w-4 h-4 bg-green-500 rounded-full" />;
            default:
                return <MapPin className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-xl px-4 py-3 pr-10 ${className}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800/95 backdrop-blur-sm border border-cyan-400/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                    {filteredOptions.map((option, index) => (
                        <div
                            key={`${option.name}-${option.country}`}
                            onClick={() => handleOptionSelect(option)}
                            className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center gap-3 ${index === highlightedIndex
                                    ? 'bg-cyan-700/30 text-white'
                                    : 'text-gray-200 hover:bg-cyan-700/20 hover:text-white'
                                }`}
                        >
                            {getLocationIcon(option.type)}
                            <div className="flex-1">
                                <div className="font-medium">{option.name}</div>
                                <div className="text-xs text-gray-400">{option.country}</div>
                            </div>
                            {option.type === 'remote' && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                    Remote
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 