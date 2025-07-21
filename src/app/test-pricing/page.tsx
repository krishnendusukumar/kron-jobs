"use client"

import React from 'react';
import PricingSection from '../../components/PricingSection/page';

const TestPricingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white text-center mb-8">
                    Pricing System Test
                </h1>
                <PricingSection />
            </div>
        </div>
    );
};

export default TestPricingPage; 