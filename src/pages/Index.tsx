
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, TrendingUp, Shield, Users, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import CreateAdminButton from "@/components/admin/CreateAdminButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Digital Investment <span className="text-blue-600">Revolution</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your journey to financial freedom with secure, transparent, and profitable investment packages designed for modern investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Cash-telle?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of digital investments with our secure platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Daily Returns</CardTitle>
                <CardDescription>
                  Earn consistent daily returns on your investments with our proven strategies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Your investments are protected with bank-level security and encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Referral Rewards</CardTitle>
                <CardDescription>
                  Earn additional income by referring friends and family to our platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Packages Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Investment Packages</h3>
            <p className="text-gray-600">Choose the package that fits your investment goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Starter", price: "KES 1,000", daily: "KES 100", total: "KES 2,000", popular: false },
              { name: "Growth", price: "KES 5,000", daily: "KES 500", total: "KES 10,000", popular: true },
              { name: "Premium", price: "KES 10,000", daily: "KES 1,000", total: "KES 20,000", popular: false },
            ].map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'border-blue-500 border-2' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{pkg.price}</div>
                  <CardDescription>Investment Amount</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{pkg.daily}/day</div>
                    <div className="text-sm text-gray-600">Daily Returns</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{pkg.total}</div>
                    <div className="text-sm text-gray-600">Total Returns (10 days)</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Setup Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h3>
            <p className="text-gray-600">
              Set up your admin account to manage the platform
            </p>
          </div>
          <div className="flex justify-center">
            <CreateAdminButton />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust Cash-telle with their financial future
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Banknote className="h-6 w-6" />
            <span className="text-lg font-semibold">Cash-telle</span>
          </div>
          <p className="text-gray-400">
            © 2024 Cash-telle. All rights reserved. Secure Digital Investments.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
