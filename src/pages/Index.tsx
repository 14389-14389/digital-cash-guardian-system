
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Banknote, 
  TrendingUp, 
  Shield, 
  Users, 
  Clock, 
  Award,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Daily Returns",
      description: "Earn consistent daily returns on your investments with our proven strategies"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your investments are protected with bank-level security and encryption"
    },
    {
      icon: Users,
      title: "Referral Program",
      description: "Earn extra income by referring friends and family to our platform"
    },
    {
      icon: Clock,
      title: "Quick Withdrawals",
      description: "Access your earnings quickly with our fast withdrawal system"
    }
  ];

  const packages = [
    {
      name: "Starter Package",
      price: "KES 1,000",
      dailyEarning: "KES 100",
      features: ["Daily earnings", "24/7 support", "Mobile access"]
    },
    {
      name: "Growth Package",
      price: "KES 5,000",
      dailyEarning: "KES 600",
      features: ["Higher daily earnings", "Priority support", "Advanced analytics"]
    },
    {
      name: "Premium Package",
      price: "KES 10,000",
      dailyEarning: "KES 1,200",
      features: ["Maximum earnings", "VIP support", "Exclusive features"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Banknote className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Cash-telle</h1>
            </div>
            <div className="space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Gateway to 
              <span className="text-blue-600"> Digital Investment</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Start your journey to financial freedom with Cash-telle's secure and profitable 
              investment packages. Earn daily returns and build wealth consistently.
            </p>
            <div className="space-x-4">
              <Link to="/auth">
                <Button size="lg" className="px-8 py-3">
                  Start Investing Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Cash-telle?
            </h2>
            <p className="text-xl text-gray-600">
              We provide the tools and security you need for successful digital investing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Investment Packages
            </h2>
            <p className="text-xl text-gray-600">
              Choose the package that fits your investment goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">{pkg.price}</div>
                  <div className="text-lg text-green-600">
                    {pkg.dailyEarning} daily
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg">
                View All Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are already earning daily returns with Cash-telle
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Banknote className="h-8 w-8" />
              <h3 className="text-2xl font-bold">Cash-telle</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in digital investment
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Cash-telle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
