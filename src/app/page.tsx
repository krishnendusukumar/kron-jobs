"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

import {
  Search, Target, MapPin, Mail, Globe, CheckCircle, Clock, AlertCircle,
  Play, Github, Twitter, Linkedin, Star, Shield, Zap, Users, ArrowDown,
  Rocket, Orbit, Satellite, Sparkles, Eye
} from 'lucide-react';

import LocationAutocomplete from '@/components/LocationAutocomplete';

// Import the pricing component
import PricingSection from '../components/PricingSection/page';

interface FormData {
  jobTitle: string;
  location: string;
  email: string;
}

interface FormErrors {
  jobTitle?: string;
  location?: string;
  email?: string;
}

interface Task {
  id: number;
  title: string;
  location: string;
  status: 'done' | 'running' | 'queued';
  progress: number;
  jobs: number;
}

// Planetary Motion Animation Component
const PlanetaryMotion = () => {
  const { scrollY } = useScroll();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [particles, setParticles] = useState<{ left: string; top: string }[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Generate random positions only on the client
  useEffect(() => {
    const arr = Array.from({ length: 40 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(arr);
  }, []);

  const y = useTransform(scrollY, [0, 1000], [0, isReducedMotion ? -20 : -100]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Centered Planetary Motion Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:flex items-center justify-center overflow-hidden">
        <motion.div
          className="relative w-[600px] h-[600px] max-w-full max-h-full"
          style={{ y }}
        >
          {/* Orbit 1 - Innermost */}
          <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-cyan-400/30 rounded-full animate-spin-slow-7">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/60"></div>
          </div>

          {/* Orbit 2 */}
          <div className="absolute left-1/2 top-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 border border-cyan-400/25 rounded-full animate-spin-slow-12-reverse">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-90 rounded-full shadow-lg shadow-emerald-400/50"></div>
          </div>

          {/* Orbit 3 */}
          <div className="absolute left-1/2 top-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 border border-cyan-400/20 rounded-full animate-spin-slow-18">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 opacity-80 rounded-full shadow-lg shadow-violet-400/40"></div>
          </div>

          {/* Orbit 4 */}
          <div className="absolute left-1/2 top-1/2 w-[30rem] h-[30rem] -translate-x-1/2 -translate-y-1/2 border border-cyan-400/15 rounded-full animate-spin-slow-24-reverse">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 opacity-70 rounded-full shadow shadow-amber-400/30"></div>
          </div>

          {/* Orbit 5 - Outermost */}
          <div className="absolute left-1/2 top-1/2 w-[36rem] h-[36rem] -translate-x-1/2 -translate-y-1/2 border border-cyan-400/10 rounded-full animate-spin-slow-32">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-60 rounded-full shadow shadow-blue-400/20"></div>
          </div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      {particles.map((pos, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${i % 4 === 0 ? 'w-2 h-2 bg-cyan-400/50' :
            i % 4 === 1 ? 'w-1.5 h-1.5 bg-emerald-400/40' :
              i % 4 === 2 ? 'w-1 h-1 bg-violet-400/30' :
                'w-0.5 h-0.5 bg-amber-400/20'
            }`}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * -200, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            delay: Math.random() * 8,
          }}
          style={{
            left: pos.left,
            top: pos.top,
          }}
        />
      ))}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes spinOrbit {
          from {transform: rotate(0deg); }
          to {transform: rotate(360deg); }
        }

        .animate-spin-slow-7 {
          animation: spinOrbit 14s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        .animate-spin-slow-12-reverse {
          animation: spinOrbit 20s cubic-bezier(0.42, 0, 0.58, 1) infinite reverse;
        }
        .animate-spin-slow-18 {
          animation: spinOrbit 26s ease-in-out infinite;
        }
        .animate-spin-slow-24-reverse {
          animation: spinOrbit 32s ease-in-out infinite reverse;
        }
        .animate-spin-slow-32 {
          animation: spinOrbit 40s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Animated Blob Component
const AnimatedBlob = ({ className = "" }: { className?: string }) => {
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

  return (
    <motion.div
      ref={ref}
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
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
};

// Floating Badges Component
const FloatingBadges = () => {
  const badges = [
    { icon: <Zap className="w-4 h-4" />, text: "Fast Alerts" },
    { icon: <Shield className="w-4 h-4" />, text: "Secure & Private" },
    { icon: <Search className="w-4 h-4" />, text: "LinkedIn Scraping" },
    { icon: <Clock className="w-4 h-4" />, text: "Runs Every x Hour" },
  ];

  return (
    <div className="fixed top-24 inset-x-0 z-40 hidden lg:flex justify-center space-x-4 pointer-events-none">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className="backdrop-blur-md bg-white/5 border border-white/10 text-white text-sm px-4 py-2 rounded-full shadow-sm flex items-center space-x-2 pointer-events-auto hover:bg-white/10 transition cursor-pointer"
        >
          {badge.icon}
          <span className="font-medium">{badge.text}</span>
        </motion.div>
      ))}
    </div>
  );
};

// Hero Section Component
const HeroSection = ({ isSignedIn, router }: { isSignedIn: boolean; router: any }) => {
  // Helper for navigation


  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">
              Automated Job Alerts.
            </span>
            <br />
            <span className="text-cyan-700/90">
              Orbiting Your Inbox.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed px-4 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            KronJobs scrapes the universe of LinkedIn jobs — and brings the right ones straight to you.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="bg-cyan-700/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:bg-cyan-600/90 cursor-pointer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isSignedIn) {
                  router.push('/dashboard');
                } else {
                  router.push('/sign-in');
                }
              }}
            >
              <span className="font-semibold">Start Free</span>
            </motion.button>

            <motion.button
              className="border border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-white/10 inline-flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isSignedIn) {
                  router.push('/dashboard');
                } else {
                  router.push('/sign-in');
                }
              }}
            >
              <Eye className="w-6 h-6" />
              <span>View Live Jobs</span>
            </motion.button>


          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Job Scan Form Component
const JobScanForm = ({ formData, setFormData, handleSubmit, isSubmitting }: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    console.log('🔍 validateForm called with formData:', formData);
    const newErrors: FormErrors = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    console.log('🔍 Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 Form is valid:', isValid);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Only validate and call parent handleSubmit
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 onFormSubmit called');
    if (validateForm()) {
      console.log('🔍 Form is valid, calling handleSubmit');
      handleSubmit(e);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      console.log('🔍 Form validation failed');
    }
  };

  return (
    <section className="relative z-10 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* macOS-style window wrapper */}
        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl overflow-hidden backdrop-blur-lg">
          {/* Mac window header with control dots */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 border-b border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {/* Actual animated job form container */}
          <motion.div
            className="p-6 sm:p-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-8 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Launch Your Job Search
            </motion.h2>
            <form onSubmit={onFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { name: 'jobTitle', icon: Target, placeholder: 'e.g., Frontend Developer', label: 'Job Title' },
                  { name: 'location', icon: MapPin, placeholder: 'San Francisco, Remote', label: 'Location', isLocation: true },
                  { name: 'email', icon: Mail, placeholder: 'your@email.com', label: 'Email' }
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                    <div className="relative group">
                      {field.isLocation ? (
                        <LocationAutocomplete
                          value={formData[field.name as keyof FormData]}
                          onChange={(value) => setFormData({ ...formData, [field.name]: value })}
                          placeholder={field.placeholder}
                          className={`w-full pl-12 pr-4 py-4 bg-white/10 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 ${errors[field.name as keyof FormErrors]
                            ? 'border-red-500/50 focus:border-red-500/50'
                            : 'border-cyan-500/30'
                            }`}
                        />
                      ) : (
                        <>
                          <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                          <input
                            type={field.name === 'email' ? 'email' : 'text'}
                            name={field.name}
                            value={formData[field.name as keyof FormData]}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 ${errors[field.name as keyof FormErrors]
                              ? 'border-red-500/50 focus:border-red-500/50'
                              : 'border-cyan-500/30'
                              }`}
                            placeholder={field.placeholder}
                          />
                        </>
                      )}
                      {errors[field.name as keyof FormErrors] && (
                        <motion.p
                          className="text-red-400 text-sm mt-1"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {errors[field.name as keyof FormErrors]}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
              >
                <motion.button
                  type="submit"
                  disabled={!!isSubmitting}
                  className="bg-cyan-700/90 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:bg-cyan-600/90 inline-flex items-center space-x-3 cursor-pointer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => console.log('🔍 Submit button clicked, isSubmitting:', isSubmitting)}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Launching Scan...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Launch Job Scan</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-4 right-4 bg-gradient-to-r from-cyan-500/95 to-blue-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right duration-300 border border-cyan-400/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
              <div>
                <div className="font-bold text-sm">Success!</div>
                <div className="text-xs opacity-90">Job scan started successfully!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};


// Feature Cards Component
const FeatureCards = () => {
  const features = [
    {
      icon: Shield,
      title: "Free to use",
      description: "Scrape LinkedIn jobs without needing an account or premium subscription.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description: "Get notified immediately when new jobs match your criteria.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Automated search execution",
      description: "Job search query hiting linkedin servers with your preferences every x hours to find if any job matches your criteria.",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section id="features" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">Why Choose KronJobs?</h2>
          <p className="text-xl text-gray-300">Simple, automated, and reliable job search</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center p-8 sm:p-10 bg-white/10 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl`}>
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Steps Component
const HowItWorksSteps = () => {
  const steps = [
    {
      step: "1",
      title: "Enter Your Criteria",
      description: "Specify job title, location, and preferences through our simple form.",
    },
    {
      step: "2",
      title: "We Start Scraping",
      description: "Our system continuously monitors LinkedIn for new job postings that match your criteria.",
    },
    {
      step: "3",
      title: "Get Instant Alerts",
      description: "Receive email notifications whenever new opportunities are found.",
    }
  ];

  return (
    <section id="how-it-works" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
          <p className="text-xl text-gray-300">Get started in 3 simple steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold shadow-lg">
                <span className="text-2xl font-bold text-white">{step.step}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = ({ isSignedIn, router }: { isSignedIn: boolean; router: any }) => {
  const [showContactToast, setShowContactToast] = useState(false);

  useEffect(() => {
    if (showContactToast) {
      const timer = setTimeout(() => setShowContactToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showContactToast]);

  // Helper for navigation
  const handleProtectedNav = (url: string) => {
    if (isSignedIn) {
      router.push(url);
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <footer className="w-full rounded-2xl py-6 px-4 md:px-8 mt-16 mb-4 shadow-lg z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">KronJobs</span>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Contact Us - Button Fix */}
          <button
            onClick={() => setShowContactToast(true)}
            className="rounded-full bg-cyan-700/90 text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Contact us
          </button>

          {/* Twitter Button */}
          <a
            href="https://x.com/i_m_krrishnendu"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-cyan-700/90 text-cyan-400 hover:bg-cyan-700/20 px-3 py-2 text-sm font-medium transition-all flex items-center hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Contact Toast */}
      {showContactToast && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-cyan-500/95 to-blue-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right duration-300 border border-cyan-400/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
            <div>
              <div className="font-bold text-sm">Success!</div>
              <div className="text-xs opacity-90">Message sent successfully</div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};


// Jobs Dashboard Component
const JobsDashboard = ({ email }: { email: string }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/start-scraping?userId=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [email]);

  const getStatusBadge = (status: string) => {
    let base = 'px-3 py-1 rounded-full text-xs font-bold mr-2';
    if (status === 'done') return `${base} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`;
    if (status === 'running') return `${base} bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse`;
    if (status === 'queued') return `${base} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
    return `${base} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
  };

  return (
    <section className="relative z-10 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Your Scraped Jobs</h2>
          <button
            onClick={fetchJobs}
            className="rounded-full bg-cyan-700/90 text-white px-6 py-2 font-semibold shadow hover:bg-cyan-600/90 cursor-pointer"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading jobs...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-10">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id || idx}
                className="bg-white/10 backdrop-blur-xl border border-cyan-500/10 rounded-2xl p-6 shadow-lg hover:bg-white/15 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-semibold text-white text-lg mr-2">{task.title || 'Job Scan'}</span>
                    <span className="text-sm text-gray-400">{task.location}</span>
                  </div>
                  <span className={getStatusBadge(task.status)}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                </div>
                {task.jobs && task.jobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {task.jobs.map((job: any, jdx: number) => (
                      <motion.div
                        key={job.id || jdx}
                        className="bg-white/10 border border-cyan-500/10 rounded-2xl p-4 shadow flex flex-col justify-between hover:bg-white/20 transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                      >
                        <div>
                          <div className="font-semibold text-white truncate">{job.title || job.job_title || 'Job Title'}</div>
                          <div className="text-cyan-300 text-sm">{job.company || job.company_name || 'Company'}</div>
                          <div className="text-gray-400 text-sm mb-2">{job.location || 'Location'}</div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <a
                            href={job.url || job.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-cyan-700/90 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-cyan-600/90 transition-all cursor-pointer"
                          >
                            View Job
                          </a>
                          {job.posted_at && (
                            <span className="text-xs text-gray-400 ml-2">{job.posted_at}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">No jobs found for this scan.</div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-5xl mb-4">🔍</div>
            <div>No jobs found yet. Start a scan or refresh to see results!</div>
          </div>
        )}
      </div>
    </section>
  );
};

// Main Component
const KronJobsLanding = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    location: '',
    email: '',
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);

  // Fetch user profile when signed in
  useEffect(() => {
    // Wait for Clerk to be fully loaded before proceeding
    if (!isLoaded) {
      console.log('⏳ Waiting for Clerk to load...');
      return;
    }

    const fetchUserProfile = async () => {
      console.log('🔍 fetchUserProfile called - isSignedIn:', isSignedIn, 'user:', user?.emailAddresses?.[0]?.emailAddress);

      // Only proceed if user is signed in and has email
      if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) {
        console.log('🔍 User not signed in or no email, setting profile to null');
        setUserProfile(null);
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      try {
        console.log('🔍 Fetching user profile for:', user.emailAddresses[0].emailAddress);
        const response = await fetch(`/api/user-profile?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);
        console.log('🔍 Response status:', response.status);

        if (response.ok) {
          const profile = await response.json();
          console.log('🔍 User profile fetched:', profile);

          if (profile) {
            console.log('✅ Setting user profile:', profile);
            setUserProfile(profile);
          } else {
            // Profile is null, create one
            console.log('🔍 Profile is null, creating new user profile...');
            const createResponse = await fetch('/api/user-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.emailAddresses[0].emailAddress,
                email: user.emailAddresses[0].emailAddress
              })
            });

            if (createResponse.ok) {
              const newProfile = await createResponse.json();
              console.log('✅ Created new user profile:', newProfile.profile);
              setUserProfile(newProfile.profile);
            } else {
              console.error('❌ Failed to create user profile');
            }
          }
        } else if (response.status === 404) {
          // User profile doesn't exist, create one
          console.log('🔍 Creating new user profile (404 response)...');
          const createResponse = await fetch('/api/user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.emailAddresses[0].emailAddress,
              email: user.emailAddresses[0].emailAddress
            })
          });

          if (createResponse.ok) {
            const newProfile = await createResponse.json();
            console.log('✅ Created new user profile (404):', newProfile.profile);
            setUserProfile(newProfile.profile);
          } else {
            console.error('❌ Failed to create user profile');
          }
        } else {
          // Handle other error cases by creating a profile
          console.log('🔍 Response not ok, creating new user profile as fallback...');
          const createResponse = await fetch('/api/user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.emailAddresses[0].emailAddress,
              email: user.emailAddresses[0].emailAddress
            })
          });

          if (createResponse.ok) {
            const newProfile = await createResponse.json();
            console.log('✅ Created new user profile (fallback):', newProfile.profile);
            setUserProfile(newProfile.profile);
          } else {
            console.error('❌ Failed to create user profile');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        // Try to create profile even if fetch fails
        try {
          console.log('🔍 Attempting to create user profile after fetch error...');
          const createResponse = await fetch('/api/user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.emailAddresses[0].emailAddress,
              email: user.emailAddresses[0].emailAddress
            })
          });

          if (createResponse.ok) {
            const newProfile = await createResponse.json();
            console.log('✅ Created new user profile (error fallback):', newProfile.profile);
            setUserProfile(newProfile.profile);
          }
        } catch (createError) {
          console.error('❌ Failed to create user profile after fetch error:', createError);
        }
      } finally {
        console.log('🔍 Setting isLoadingProfile to false');
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isSignedIn, user]);

  // Poll for plan upgrade after payment redirect
  useEffect(() => {
    if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) return;

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const plan = urlParams.get('plan');

    if (paymentStatus === 'success') {
      console.log('🔍 Payment success detected, polling for profile update...');
      setIsPolling(true);
      let attempts = 0;
      const maxAttempts = 15; // ~15 seconds

      const poll = async () => {
        try {
          console.log(`🔍 Polling attempt ${attempts + 1}/${maxAttempts}`);
          const response = await fetch(`/api/user-profile?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);

          if (response.ok) {
            const profile = await response.json();
            console.log('🔍 Polled profile:', profile);

            if (profile && (profile.plan === 'weekly' || profile.plan === 'monthly')) {
              console.log('✅ Plan upgrade detected, updating profile');
              setUserProfile(profile);
              setShowPaymentSuccess(true);
              setPaymentPlan(plan || profile.plan);
              setIsPolling(false);
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }
          }
        } catch (error) {
          console.error('❌ Error polling profile:', error);
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          console.log('❌ Polling timeout, stopping');
          setIsPolling(false);
        }
      };

      poll();
    }
  }, [isSignedIn, user]);

  // Scroll to form
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // Scroll to tasks/results
  const scrollToTasks = () => {
    tasksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch tasks for user
  const fetchTasks = async (email: string) => {
    const res = await fetch(`/api/start-scraping?userId=${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks || []);
    }
  };

  // Enhanced handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleSubmit called with formData:', formData);
    setIsSubmitting(true);
    try {
      // 0. Ensure user profile exists (for production)
      console.log('🔍 Ensuring user profile exists...');
      const profileRes = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.email,
          email: formData.email
        }),
      });
      console.log('🔍 Profile creation response status:', profileRes.status);

      // 1. Save preferences
      console.log('🔍 Saving preferences...');
      const prefRes = await fetch('/api/submit-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          keywords: '', // Add keywords if you have them
          location: formData.location,
          minSalary: '', // Add minSalary if you have it
          notifyMethod: 'email',
          experience: '',
          email: formData.email,
        }),
      });
      console.log('🔍 Preferences response status:', prefRes.status);
      if (!prefRes.ok) throw new Error('Failed to save preferences');

      // 2. Start scraping
      console.log('🔍 Starting scraping...');
      const scrapeRes = await fetch('/api/start-scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: formData.email }),
      });
      const scrapeData = await scrapeRes.json();
      console.log('🔍 Scraping response:', scrapeData);
      if (!scrapeRes.ok) throw new Error(scrapeData.error || 'Failed to start scraping');

      // 3. Fetch and show tasks
      console.log('🔍 Fetching tasks...');
      await fetchTasks(formData.email);
      setFormData({ jobTitle: '', location: '', email: '' });
      setTimeout(scrollToTasks, 500); // Scroll to results
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      // Optionally show error UI
    } finally {
      console.log('🔍 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  // Manual profile refresh function
  const refreshUserProfile = async () => {
    if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) return;

    console.log('🔍 Manually refreshing user profile...');
    setIsLoadingProfile(true);

    try {
      const response = await fetch(`/api/user-profile?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);
      if (response.ok) {
        const profile = await response.json();
        console.log('🔍 Refreshed profile:', profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a182e] via-[#1a2a3d] to-[#0a182e] relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a182e] to-[#1a2a3d] text-white overflow-x-hidden max-w-full w-full">
      {/* Animated Background */}
      <PlanetaryMotion />
      {/* Animated Blobs */}
      <AnimatedBlob className="w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 top-1/4 left-1/4 max-w-[90vw] max-h-[90vh]" />
      <AnimatedBlob className="w-56 h-56 md:w-80 md:h-80 bg-purple-500/20 top-3/4 right-1/4 max-w-[90vw] max-h-[90vh]" />
      <AnimatedBlob className="w-48 h-48 md:w-72 md:h-72 bg-emerald-500/20 bottom-1/4 left-1/3 max-w-[90vw] max-h-[90vh]" />
      {/* Floating Badges */}
      {/* Navigation */}
      <nav className="relative z-50 bg-black/30 backdrop-blur-2xl border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-[#0a182e] rounded-xl flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                KronJobs
              </span>
            </motion.div>
            {/* Navigation Links */}
            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm hover:bg-cyan-500/10 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </motion.button>
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <motion.a
                href="/dashboard"
                className="text-gray-300 hover:text-white font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Dashboard
              </motion.a>
              <motion.button
                className="bg-cyan-700/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:bg-cyan-600/90 cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isSignedIn) {
                    router.push('/dashboard');
                  } else {
                    router.push('/sign-in');
                  }
                }}
              >
                <span className="font-semibold">Start Free</span>
              </motion.button>
            </div>
          </div>
          {/* Mobile Menu Overlay */}
          <div className="top-24 inset-x-0 z-40 hidden lg:flex justify-center space-x-4 pointer-events-none">
            <FloatingBadges />
          </div>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-cyan-500/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 py-6 space-y-4">
                  {['Features', 'Pricing', 'How it Works', 'Contact'].map((item, i) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className="block text-gray-300 hover:text-white font-medium transition-colors py-2 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      {/* Main Content */}
      <HeroSection isSignedIn={Boolean(isSignedIn)} router={router} />
      <div ref={formRef} className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Selling/Pain Point */}
          <div className="mb-10 md:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tired of missing jobs?</h2>
            <p className="text-lg text-gray-300 mb-6">Let KronJobs do the searching for you. No more endless scrolling, no more FOMO. Get instant alerts, save hours every week, and never miss a great opportunity again.</p>
            <ul className="list-disc list-inside text-gray-400 space-y-2 pl-2">
              <li>⏰ Real-time job alerts</li>
              <li>🤖 Automated LinkedIn scraping</li>
              <li>🔒 Early access </li>
              <li>🚀 Apply faster, stress less</li>
            </ul>
          </div>
          {/* Right: Tilted Form */}
          <div className="w-full">
            <div className="relative w-full">
              <div className="rotate-[-2deg] hover:rotate-0 transition-transform duration-300 w-full">
                <JobScanForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <FeatureCards />
      <PricingSection
        userProfile={userProfile}
        showFAQ={false}
        isLoadingProfile={isLoadingProfile || (isSignedIn && !userProfile)}
        onRefresh={refreshUserProfile}
      />
      <HowItWorksSteps />
      <Footer isSignedIn={Boolean(isSignedIn)} router={router} />
      {/* Mobile Sticky CTA */}
      <motion.div
        className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.button
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:shadow-purple-500/25 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (isSignedIn) {
              router.push('/dashboard');
            } else {
              router.push('/sign-in');
            }
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Rocket className="w-5 h-5" />
            <span>Start Free</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Payment Success Toast */}
      {showPaymentSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500/95 to-emerald-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
            <div>
              <div className="font-bold text-sm">Payment Successful!</div>
              <div className="text-xs opacity-90">Your {paymentPlan} plan has been activated</div>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="ml-4 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Polling Toast */}
      {isPolling && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-cyan-500/95 to-blue-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-cyan-400/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
            <div>
              <div className="font-bold text-sm">Waiting for payment confirmation...</div>
              <div className="text-xs opacity-90">This may take a few seconds.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KronJobsLanding;