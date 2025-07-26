import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Zap, Code, Database, Lock } from "lucide-react";

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

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Next.js 15 Authentication Boilerplate
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Authentication Made <span className="text-blue-600">Simple</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A complete authentication system built with Next.js 15, NextAuth.js, and Firebase. Ready for development and
          production with mock data support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/test">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              View Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build Something Amazing?</h2>
        <p className="text-gray-600 mb-6">
          Start with a solid authentication foundation and focus on what makes your app unique.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">Create Account</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
