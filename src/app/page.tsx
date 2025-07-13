"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

import {
  Search, Target, MapPin, Mail, Globe, CheckCircle, Clock, AlertCircle,
  Play, Github, Twitter, Linkedin, Star, Shield, Zap, Users, ArrowDown,
  Rocket, Orbit, Satellite, Sparkles, Eye
} from 'lucide-react';

interface FormData {
  jobTitle: string;
  location: string;
  email: string;
  proxy: string;
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
      {[...Array(40)].map((_, i) => (
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
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes spinOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          className="backdrop-blur-md bg-white/5 border border-white/10 text-white text-sm px-4 py-2 rounded-full shadow-sm flex items-center space-x-2 pointer-events-auto hover:bg-white/10 transition"
        >
          {badge.icon}
          <span className="font-medium">{badge.text}</span>
        </motion.div>
      ))}
    </div>
  );
};


// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center snap-start">
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
            <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
              Automated Job Alerts.
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
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
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:shadow-purple-500/25 inline-flex items-center space-x-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-6 h-6" />
              <span>Start Free</span>
            </motion.button>

            <motion.button
              className="border border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-white/10 inline-flex items-center space-x-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
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
    const newErrors: FormErrors = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <section className="relative z-10 py-20 snap-start">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 p-8 sm:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Launch Your Job Search
          </motion.h2>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { name: 'jobTitle', icon: Target, placeholder: 'e.g., Frontend Developer', label: 'Job Title' },
                { name: 'location', icon: MapPin, placeholder: 'San Francisco, Remote', label: 'Location' },
                { name: 'email', icon: Mail, placeholder: 'your@email.com', label: 'Email' },
                { name: 'proxy', icon: Globe, placeholder: 'proxy.example.com:8080', label: 'Proxy (Optional)' }
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
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:shadow-purple-500/25 inline-flex items-center space-x-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
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

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/30 rounded-lg px-6 py-4 shadow-lg"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-100" />
              <span className="text-white font-medium">Job scan started successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Scraping Tasks Component
const ScrapingTasks = ({ tasks }: { tasks: Task[] }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'queued': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm";
    switch (status) {
      case 'done': return `${baseClasses} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`;
      case 'running': return `${baseClasses} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
      case 'queued': return `${baseClasses} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
      default: return `${baseClasses} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
    }
  };

  return (
    <section className="relative z-10 py-20 snap-start">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-bold text-white mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Your Scraping Missions
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              className="bg-white/10 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:bg-white/15"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:bg-white/25 transition-colors">
                    {getStatusIcon(task.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.location}</p>
                  </div>
                </div>
                <span className={getStatusBadge(task.status)}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-medium">{task.progress}%</span>
                </div>
                <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${task.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Jobs Found</span>
                <span className="text-2xl font-bold text-white">{task.jobs}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Cards Component
const FeatureCards = () => {
  const features = [
    {
      icon: Shield,
      title: "No Login Required",
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
    <section id="features" className="relative z-10 py-20 snap-start">
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
              className="text-center p-8 sm:p-10 bg-white/10 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 hover:bg-white/15 transition-all duration-300"
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
      icon: Target
    },
    {
      step: "2",
      title: "We Start Scraping",
      description: "Our system continuously monitors LinkedIn for new job postings that match your criteria.",
      icon: Orbit
    },
    {
      step: "3",
      title: "Get Instant Alerts",
      description: "Receive email notifications whenever new opportunities are found.",
      icon: Satellite
    }
  ];

  return (
    <section id="how-it-works" className="relative z-10 py-20 snap-start">
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
                {step.step}
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-blue-400" />
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
const Footer = () => {
  return (
    <footer className="relative z-10 bg-gradient-to-b from-[#10131a]/90 to-[#0a0c12] backdrop-blur-2xl pt-1 pb-12 md:pb-16 snap-start overflow-hidden">
      {/* Top Glow Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/60 via-blue-500/40 to-purple-500/60 blur-sm opacity-80" />
      {/* Blurred Planet/Blob */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 py-12 md:py-16">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/30 backdrop-blur-xl">
                <Search className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">KronJobs</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md text-base md:text-lg">
              Automated job search made simple. Find your next opportunity without the hassle.
            </p>
            <div className="flex space-x-4 mt-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-500/10 rounded-lg"
                  aria-label="Social link"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-wide">Product</h4>
            <ul className="space-y-2 text-gray-300">
              {['Features', 'Pricing', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-wide">Support</h4>
            <ul className="space-y-2 text-gray-300">
              {['Privacy', 'Terms', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-cyan-500/10 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2024 KronJobs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Component
const KronJobsLanding = () => {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    location: '',
    email: '',
    proxy: ''
  });
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Frontend Developer', location: 'San Francisco', status: 'done', progress: 100, jobs: 23 },
    { id: 2, title: 'Product Manager', location: 'Remote', status: 'running', progress: 65, jobs: 12 },
    { id: 3, title: 'Data Scientist', location: 'New York', status: 'queued', progress: 0, jobs: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newTask: Task = {
        id: tasks.length + 1,
        title: formData.jobTitle,
        location: formData.location,
        status: 'queued',
        progress: 0,
        jobs: 0
      };
      setTasks([...tasks, newTask]);
      setFormData({ jobTitle: '', location: '', email: '', proxy: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden snap-y snap-mandatory max-w-full w-full">
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
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                KronJobs
              </span>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How it Works', 'Contact'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-300 hover:text-white font-medium transition-colors relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-sm hover:bg-cyan-500/10 transition-all duration-300"
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



            {/* CTA Button */}
            <motion.button
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:shadow-purple-500/25"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free
            </motion.button>
          </div>

          {/* Mobile Menu Overlay */}
          <FloatingBadges />
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
                  {['Features', 'How it Works', 'Contact'].map((item, i) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className="block text-gray-300 hover:text-white font-medium transition-colors py-2"
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
      <HeroSection />
      <JobScanForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
      <ScrapingTasks tasks={tasks} />
      <FeatureCards />
      <HowItWorksSteps />
      <Footer />

      {/* Mobile Sticky CTA */}
      <motion.div
        className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.button
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:shadow-purple-500/25"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Rocket className="w-5 h-5" />
            <span>Start Free</span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default KronJobsLanding;