"use client"

import React, { useState } from 'react';
import { Search, Target, Bell, Shield, Zap, Users, ChevronRight, Mail, MapPin, DollarSign, Play, Star, Github, Linkedin, Twitter } from 'lucide-react';

const KronJobsLanding = () => {
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [currentUser, setCurrentUser] = useState('krrishendusukumar@gmail.com');

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "LinkedIn Guest Scraper",
      description: "Scrape job listings without LinkedIn Premium or login requirements"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Supabase Storage",
      description: "Secure cloud storage for all your job data and preferences"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Alerts",
      description: "Get notified via Email & WhatsApp when new jobs match your criteria"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Custom Filters",
      description: "Filter by job title, location, salary range, and company size"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Proxy Management",
      description: "Built-in proxy rotation to ensure reliable, uninterrupted scraping"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Share job searches and collaborate with your team members"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Set Preferences",
      description: "Define your job criteria, location, and salary expectations"
    },
    {
      number: "2",
      title: "Scrape LinkedIn Jobs",
      description: "Our AI automatically finds relevant opportunities"
    },
    {
      number: "3",
      title: "Get Instant Alerts",
      description: "Receive notifications via WhatsApp and Email"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      text: "KronJobs helped me find my dream job in just 2 weeks. The automation saved me hours of manual searching!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      text: "The WhatsApp alerts are game-changing. I never miss a good opportunity anymore."
    },
    {
      name: "Emily Watson",
      role: "Data Scientist",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      text: "Clean interface, powerful features. This is exactly what job seekers needed."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#00E060] rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#00E060]">KronJobs</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-[#00E060] transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-[#00E060] transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-300 hover:text-[#00E060] transition-colors">Pricing</a>
              <button className="bg-[#00E060] hover:bg-green-600 px-4 py-2 rounded-lg transition-colors text-white font-semibold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Planetary Motion */}
      <section className="relative overflow-hidden bg-slate-900 min-h-screen flex items-center pt-8 lg:pt-0">
        {/* Centered Planetary Motion Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none hidden md:flex items-center justify-center">
          <div className="relative w-[600px] h-[600px]">

            {/* Central Sun - The main focal point */}
            <div className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
              <div className="w-full h-full bg-gradient-to-br from-[#00E060] to-[#00B050] rounded-full shadow-2xl shadow-[#00E060]/60 animate-pulse">
                <div className="absolute inset-0 rounded-full bg-[#00E060] opacity-40 blur-3xl animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#00E060] to-[#00B050] opacity-80"></div>
              </div>
            </div>

            {/* Orbit 1 - Innermost */}
            <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-[#00E060]/30 rounded-full animate-spin-slow-7">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-[#00E060] to-[#00B050] rounded-full shadow-lg shadow-[#00E060]/60"></div>
            </div>

            {/* Orbit 2 */}
            <div className="absolute left-1/2 top-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 border border-[#00E060]/25 rounded-full animate-spin-slow-12-reverse">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-[#00E060] to-[#00B050] opacity-90 rounded-full shadow-lg shadow-[#00E060]/50"></div>
            </div>

            {/* Orbit 3 */}
            <div className="absolute left-1/2 top-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 border border-[#00E060]/20 rounded-full animate-spin-slow-18">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-[#00E060] to-[#00B050] opacity-80 rounded-full shadow-lg shadow-[#00E060]/40"></div>
            </div>

            {/* Orbit 4 */}
            <div className="absolute left-1/2 top-1/2 w-[30rem] h-[30rem] -translate-x-1/2 -translate-y-1/2 border border-[#00E060]/15 rounded-full animate-spin-slow-24-reverse">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-[#00E060] to-[#00B050] opacity-70 rounded-full shadow shadow-[#00E060]/30"></div>
            </div>

            {/* Orbit 5 - Outermost */}
            <div className="absolute left-1/2 top-1/2 w-[36rem] h-[36rem] -translate-x-1/2 -translate-y-1/2 border border-[#00E060]/10 rounded-full animate-spin-slow-32">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-[#00E060] to-[#00B050] opacity-60 rounded-full shadow shadow-[#00E060]/20"></div>
            </div>

          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Left: Headline and CTA */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-[#00E060] leading-tight">
              Your Personal Job Scout
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-xl">
              Automate job search, track applications, and never miss an opportunity. Let AI do the heavy lifting while you focus on landing your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <button className="bg-[#00E060] hover:bg-green-600 px-8 py-4 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto">
                <Play className="w-5 h-5" />
                <span>Start Scraping</span>
              </button>
              <button className="border border-[#00E060] px-8 py-4 rounded-lg text-[#00E060] hover:bg-[#00E060] hover:text-white transition-colors font-semibold w-full sm:w-auto">
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Right: Dashboard Preview Card */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-16 lg:mt-0">
            <div className="relative bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 shadow-xl backdrop-blur-md max-w-md w-full z-20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-[#00E060] rounded-full"></div>
                <span className="text-sm text-gray-300 ml-4">Dashboard Preview</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00E060] rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Senior React Developer</span>
                  </div>
                  <span className="text-xs text-gray-400">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00E060] rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Product Manager</span>
                  </div>
                  <span className="text-xs text-gray-400">5 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#00E060] rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Data Scientist</span>
                  </div>
                  <span className="text-xs text-gray-400">8 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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

      </section>

      {/* Footer and other sections remain as-is */}

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Simple, automated, effective</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-gray-600 absolute top-8 -right-3 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to land your next job</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Preferences Form */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Job Preferences */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Target className="w-6 h-6 text-green-400" />
                <span>Job Preferences</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="e.g., Software Engineer, Product Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="React, Python, Machine Learning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="San Francisco, Remote, New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Salary (USD)</label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="80000"
                  />
                </div>

                <button className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>

            {/* Job Scraper */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Zap className="w-6 h-6 text-blue-400" />
                <span>Job Scraper</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current User</label>
                  <div className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg text-gray-400">
                    {currentUser}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    If no user is detected, enter your email manually:
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                      Set User
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Scraper Status: Active</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Last scan: 2 minutes ago • Found 12 new jobs
                  </p>
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
                  Start Scraping Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-400">Join thousands of successful job seekers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section id="pricing" className="py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join our beta and get free access to all premium features
          </p>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-green-400 mb-2">Free</div>
              <div className="text-lg text-gray-400">During Beta</div>
            </div>

            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Unlimited job scraping</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Email & WhatsApp alerts</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Advanced filtering</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Priority support</span>
              </li>
            </ul>

            <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25">
              Get Early Access
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#00E060] rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#00E060]">KronJobs</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your personal job scout. Automate job search, track applications, and never miss an opportunity.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KronJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default KronJobsLanding;