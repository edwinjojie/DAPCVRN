import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Search,
  MapPin,
  Filter,
  QrCode,
  BarChart3,
  Star,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2,
  UserCheck
} from 'lucide-react';

export default function Landing() {
 
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: CheckCircle,
      title: 'Verify Skills Instantly',
      description: 'Real-time verification of credentials with blockchain security and instant validation',
      color: 'blue'
    },
    {
      icon: QrCode,
      title: 'Share via NFC/QR',
      description: 'Seamlessly share your verified credentials through NFC technology and QR codes',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'Build Analyzed Portfolio',
      description: 'AI-powered portfolio analysis with skill gap identification and career insights',
      color: 'purple'
    }
  ];

  const skillTrends = [
    { skill: 'JavaScript', demand: 95, growth: '+12%' },
    { skill: 'Python', demand: 88, growth: '+8%' },
    { skill: 'React', demand: 82, growth: '+15%' },
    { skill: 'Machine Learning', demand: 76, growth: '+22%' },
    { skill: 'Blockchain', demand: 71, growth: '+18%' },
    { skill: 'Cloud Computing', demand: 68, growth: '+14%' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'TechCorp',
      content: 'BOSE transformed how I showcase my skills. Employers can instantly verify my credentials, and I got 3x more interview calls!',
      rating: 5,
      avatar: 'SC'
    },
    {
      name: 'Michael Rodriguez',
      role: 'HR Director',
      company: 'InnovateLabs',
      content: 'The verification process is seamless. We can trust candidate credentials completely, saving us weeks of background checks.',
      rating: 5,
      avatar: 'MR'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Academic Dean',
      company: 'University of Technology',
      content: 'Issuing credentials through BOSE is incredibly efficient. Students love the instant verification and employers trust our graduates more.',
      rating: 5,
      avatar: 'EW'
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Make you Career Footprint with BOSE
            </h1>
            <p className="mt-6 text-xl leading-8 text-blue-100">
              Verified, Seamless, Equitable
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-200">
              The future of credential verification is here. Join thousands of professionals, 
              employers, and institutions building trust through blockchain technology.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Join as Candidate
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="bg-blue-500 text-white hover:bg-blue-400 px-8 py-3">
                  <Building2 className="mr-2 h-5 w-5" />
                  Join as Employer
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-400 px-8 py-3">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Join as Institution
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

    

      {/* Feature Grid Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose BOSE?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Experience the next generation of credential verification with cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`mx-auto w-16 h-16 rounded-full bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Trends Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Top In-Demand Skills
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Stay ahead with real-time skill demand analytics and market trends
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">
              {skillTrends.map((trend, index) => (
                <div key={trend.skill} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                    <span className="text-lg font-semibold text-gray-900">{trend.skill}</span>
                    <span className="text-sm text-green-600 font-medium">{trend.growth}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-48 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${trend.demand}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">{trend.demand}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" className="px-8">
                View Full Analytics
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Professionals Worldwide
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              See what our community says about BOSE
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl font-medium text-gray-900 mb-6">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Secure Your Career?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-200">
              Join thousands of professionals who trust BOSE for their credential verification needs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-white font-semibold">BOSE Platform</span>
            </div>
            <p className="text-sm text-gray-400">
              Built with Hyperledger Fabric • Enterprise Blockchain Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}