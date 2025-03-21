
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Globe, LineChart, Lock, PieChart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-analytics-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-analytics-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-analytics-blue" />
              <span className="ml-2 text-xl font-semibold text-analytics-gray-900">DataPulse</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-analytics-gray-600 hover:text-analytics-gray-900 transition-colors duration-200">Features</a>
              <a href="#benefits" className="text-analytics-gray-600 hover:text-analytics-gray-900 transition-colors duration-200">Benefits</a>
              <Link 
                to="/dashboard" 
                className="btn-primary px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-analytics-gray-900 mb-6 tracking-tight">
            Visualize Your Analytics Data <span className="text-analytics-blue">Beautifully</span>
          </h1>
          <p className="text-xl text-analytics-gray-600 mb-10 leading-relaxed">
            Aggregate and analyze your Google Analytics data from multiple websites in one intuitive dashboard. Make better decisions with crystal-clear insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/dashboard" 
              className="btn-primary px-6 py-3 flex items-center justify-center"
            >
              <span>Start Exploring</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a 
              href="#features" 
              className="btn-outline px-6 py-3"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Preview Image */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6">
        <div className="glass-card overflow-hidden rounded-xl shadow-subtle-lg animate-slide-up-fade">
          <div className="relative bg-analytics-blue p-2 rounded-t-xl">
            <div className="flex space-x-2 absolute left-4 top-4">
              <div className="w-3 h-3 rounded-full bg-analytics-error"></div>
              <div className="w-3 h-3 rounded-full bg-analytics-warning"></div>
              <div className="w-3 h-3 rounded-full bg-analytics-success"></div>
            </div>
            <div className="text-center text-white text-sm py-2">
              Dashboard Preview
            </div>
          </div>
          <div className="p-4 bg-analytics-gray-100">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-analytics-gray-50 rounded-lg p-4 text-center">
                  <p className="text-analytics-gray-500 text-xs mb-1">Visitors</p>
                  <p className="text-analytics-blue text-xl font-bold">24.5K</p>
                </div>
                <div className="bg-analytics-gray-50 rounded-lg p-4 text-center">
                  <p className="text-analytics-gray-500 text-xs mb-1">Page Views</p>
                  <p className="text-analytics-violet text-xl font-bold">87.1K</p>
                </div>
                <div className="bg-analytics-gray-50 rounded-lg p-4 text-center">
                  <p className="text-analytics-gray-500 text-xs mb-1">Conversion</p>
                  <p className="text-analytics-success text-xl font-bold">3.28%</p>
                </div>
                <div className="bg-analytics-gray-50 rounded-lg p-4 text-center">
                  <p className="text-analytics-gray-500 text-xs mb-1">Avg. Time</p>
                  <p className="text-analytics-warning text-xl font-bold">2:47</p>
                </div>
              </div>
              <div className="h-40 bg-analytics-gray-50 rounded-lg mb-6 flex items-center justify-center">
                <LineChart className="h-16 w-16 text-analytics-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-32 bg-analytics-gray-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-analytics-gray-300" />
                </div>
                <div className="h-32 bg-analytics-gray-50 rounded-lg flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-analytics-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-analytics-gray-900 mb-4">Powerful Analytics Features</h2>
          <p className="text-lg text-analytics-gray-600 max-w-2xl mx-auto">
            Everything you need to understand and optimize your online presence across multiple websites.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-6 card-hover animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
            <div className="bg-analytics-blue bg-opacity-10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-analytics-blue" />
            </div>
            <h3 className="text-xl font-semibold text-analytics-gray-900 mb-3">Multi-Site Dashboard</h3>
            <p className="text-analytics-gray-600">
              View and compare performance across all your websites in a single, unified dashboard.
            </p>
          </div>
          
          <div className="glass-card p-6 card-hover animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
            <div className="bg-analytics-violet bg-opacity-10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <LineChart className="h-6 w-6 text-analytics-violet" />
            </div>
            <h3 className="text-xl font-semibold text-analytics-gray-900 mb-3">Advanced Visualizations</h3>
            <p className="text-analytics-gray-600">
              Beautiful and interactive charts that make complex data easy to understand at a glance.
            </p>
          </div>
          
          <div className="glass-card p-6 card-hover animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
            <div className="bg-analytics-success bg-opacity-10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-analytics-success" />
            </div>
            <h3 className="text-xl font-semibold text-analytics-gray-900 mb-3">Detailed Insights</h3>
            <p className="text-analytics-gray-600">
              Drill down into user behavior, traffic sources, and conversion funnels with detailed analytics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-analytics-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your analytics experience?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Get started with DataPulse today and unlock powerful insights across all your websites.
          </p>
          <Link 
            to="/dashboard" 
            className="inline-block bg-white text-analytics-blue px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition-all duration-200"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-analytics-gray-900 text-analytics-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-analytics-blue" />
                <span className="ml-2 text-lg font-semibold text-white">DataPulse</span>
              </div>
              <p className="text-sm mb-4">
                Beautiful analytics for modern businesses. Monitor and optimize your web presence.
              </p>
            </div>
            
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors duration-200">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-analytics-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2023 DataPulse. All rights reserved.</p>
            <div className="flex items-center mt-4 md:mt-0">
              <Lock className="h-4 w-4 mr-1" />
              <span className="text-xs">Secure & Encrypted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
