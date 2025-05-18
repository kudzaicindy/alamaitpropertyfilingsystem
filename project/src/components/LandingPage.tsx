import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import { Button } from './ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <div className="relative w-6 h-6">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
              </div>
              <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Alamait Property
                </h1>
                <p className="text-xs text-gray-500">Management Filing System</p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative group">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-full text-sm font-medium flex items-center space-x-2 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-sm hover:shadow-md">
                    <Lock className="h-4 w-4 animate-pulse" />
                    <span>Secure Portal</span>
                  </span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <Link to="/login">
                  <Button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-0.5">
                    <KeyRound className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
              </div>
              
              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <svg className="h-6 w-6 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed navbar */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-12 mt-20">
        <div className="max-w-4xl">
          <div className="mb-12 transform hover:scale-105 transition-transform duration-300">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-6">
              <span className="text-4xl">🏢</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to the official
              <span className="block text-blue-600 mt-2">property management filing portal</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              This secure system is for use by Alamait staff only. 
              <br />
              Access property and insurance records, manage company assets, and keep all documentation organized in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl mb-4 inline-block group-hover:bg-blue-100 transition-colors duration-300">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Property Records</h3>
              <p className="text-gray-600">Access and manage all property documentation with ease</p>
            </div>
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl mb-4 inline-block group-hover:bg-blue-100 transition-colors duration-300">
                <span className="text-4xl">🚗</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Vehicle Management</h3>
              <p className="text-gray-600">Track company vehicles and their documentation efficiently</p>
            </div>
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-xl mb-4 inline-block group-hover:bg-blue-100 transition-colors duration-300">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Insurance Tracking</h3>
              <p className="text-gray-600">Monitor all insurance policies and renewals in real-time</p>
            </div>
          </div>

          <div className="space-y-6">
            <Link to="/login" className="inline-block">
              <Button className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-3">
                <span className="text-2xl">👤</span>
                <span>Staff Login</span>
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4 flex items-center justify-center">
              <span className="inline-block mr-2 text-lg">🔐</span>
              Secure access for authorized personnel only
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-12 bg-white/80 backdrop-blur-md border-t mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
            <div className="text-center md:text-left transform hover:scale-105 transition-transform duration-300">
              <h4 className="font-semibold text-lg mb-4 text-gray-900">Contact Support</h4>
              <p className="text-gray-600 text-base flex items-center md:justify-start justify-center">
                <span className="text-2xl mr-3">📧</span>
                support@alamait.com
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <h4 className="font-semibold text-lg mb-4 text-gray-900">Quick Links</h4>
              <p className="text-gray-600 text-base flex items-center justify-center">
                <span className="text-2xl mr-3">📱</span>
                Mobile Access Available
              </p>
            </div>
            <div className="text-center md:text-right transform hover:scale-105 transition-transform duration-300">
              <h4 className="font-semibold text-lg mb-4 text-gray-900">System Status</h4>
              <p className="text-green-600 text-base flex items-center md:justify-end justify-center">
                <span className="text-2xl mr-3">🟢</span>
                All Systems Operational
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center">
              <span className="inline-block mr-2 text-lg">©</span>
              {new Date().getFullYear()} Alamait Property Management. Internal Use Only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 