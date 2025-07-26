import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Zap, Code, Database, Lock, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Built with NextAuth.js and industry-standard security practices"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Complete user registration, login, and profile management"
    },
    {
      icon: Zap,
      title: "Mock & Firebase Modes",
      description: "Switch between mock data for development and Firebase for production"
    },
    {
      icon: Code,
      title: "Next.js 15 Ready",
      description: "Built with the latest Next.js features and App Router"
    },
    {
      icon: Database,
      title: "Flexible Backend",
      description: "Supports Firebase, Supabase, and other database providers"
    },
    {
      icon: Lock,
      title: "Build-Safe Config",
      description: "Environment variables handled safely during build process"
    }
  ];

  const benefits = [
    "Complete authentication system",
    "User registration and login",
    "Protected dashboard routes",
    "Profile management",
    "Mock data for development",
    "Firebase integration ready",
    "Responsive design",
    "TypeScript support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                🔐 Auth Boilerplate
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/test"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Demo
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center py-20">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            ✨ Next.js 15 Authentication Boilerplate
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Authentication
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            A complete, production-ready authentication system built with Next.js 15, NextAuth.js, and Firebase. Start
            building your app with secure user management from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/test">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-4 bg-white/50 backdrop-blur-sm">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">TypeScript</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Next.js 15</div>
              <div className="text-sm text-gray-600">Latest Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Secure</div>
              <div className="text-sm text-gray-600">NextAuth.js</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Ready</div>
              <div className="text-sm text-gray-600">Production</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern best practices and ready for production deployment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Skip the Setup,
                <br />
                Start Building
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Don't waste weeks building authentication from scratch. This boilerplate gives you everything you need
                to get started with secure user management immediately.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Deploy</h3>
                <p className="mb-6 opacity-90">
                  Works in both development and production environments with seamless Firebase integration.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Mock mode for development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Firebase ready for production</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Build-safe configuration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Something Amazing?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Start with a solid authentication foundation and focus on what makes your app unique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">🔐 Auth Boilerplate</h3>
            <p className="text-gray-400">Built with Next.js 15 and NextAuth.js</p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">© 2024 Auth Boilerplate. Ready for your next project.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
