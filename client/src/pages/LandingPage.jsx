import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import {
  CheckCircle,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Shield,
} from "lucide-react";

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(null);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Team Collaboration",
      description:
        "Real-time collaboration with your team members and instant notifications.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
      title: "Project Management",
      description:
        "Track projects, milestones, and deadlines with comprehensive progress monitoring.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-600" />,
      title: "Performance Analytics",
      description:
        "Monitor team performance with detailed analytics and Red Zone alerts.",
    },
    {
      icon: <Bell className="w-8 h-8 text-primary-600" />,
      title: "Real-time Notifications",
      description:
        "Stay updated with instant notifications and browser push alerts.",
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary-600" />,
      title: "Quality Assurance",
      description:
        "Built-in QA workflow with revision tracking and approval processes.",
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control.",
    },
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {showAuth === "signin" ? "Welcome Back" : "Join NLS Portal"}
            </h2>
            <p className="text-gray-600">
              {showAuth === "signin"
                ? "Sign in to your account to continue"
                : "Create your account to get started"}
            </p>
          </div>

          {showAuth === "signin" ? (
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary-600 hover:bg-primary-700",
                  card: "shadow-none",
                },
              }}
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary-600 hover:bg-primary-700",
                  card: "shadow-none",
                },
              }}
            />
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAuth(null)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">NLS Portal</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAuth("signin")}
                className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth("signup")}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Project Management
            <span className="block text-primary-600">Reimagined</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your workflow with comprehensive project tracking,
            real-time collaboration, and intelligent performance monitoring.
            Built for modern teams who demand excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuth("signup")}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => setShowAuth("signin")}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-primary-600 font-semibold rounded-lg text-lg transition-colors border-2 border-primary-600"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help your team collaborate effectively
            and deliver projects on time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-primary-100"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of teams already using NLS Portal to deliver
            exceptional results.
          </p>
          <button
            onClick={() => setShowAuth("signup")}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-lg text-lg transition-colors shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NLS Portal</span>
            </div>
            <p className="text-gray-400">
              © 2024 NLS Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
