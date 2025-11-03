import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import NotificationBell from '../modules/recruiter/components/NotificationBell';
import { 
  Shield, 
  Menu, 
  X, 
  Home, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useStore();
  const location = useLocation();

  // Role-based navigation
  const navigation = (() => {
    const role = (user?.role || '').toLowerCase();
    if (role === 'student' || role === 'candidate' || role === 'employee') {
      return [
        { name: 'Home', href: '/dashboard/student', icon: Home },
        { name: 'Upload Creds', href: '/dashboard/student#upload', icon: FileText },
        { name: 'Portfolio', href: '/dashboard/student#portfolio', icon: User },
        { name: 'Share', href: '/dashboard/student#share', icon: Shield },
        { name: 'Recommendations', href: '/dashboard/student#reco', icon: Settings },
        { name: 'Analytics', href: '/dashboard/student#analytics', icon: BarChart3 },
      ];
    }
    if (role === 'employer' || role === 'recruiter') {
      return [
        { name: 'Home', href: '/dashboard/employer', icon: Home },
        { name: 'Jobs', href: '/dashboard/employer/jobs', icon: FileText },
        { name: 'Applicants', href: '/dashboard/employer/applicants', icon: User },
        { name: 'Candidates', href: '/dashboard/employer/candidates', icon: Shield },
        { name: 'Analytics', href: '/dashboard/employer/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/dashboard/employer/settings', icon: Settings },
      ];
    }
    if (role === 'institution' || role === 'verifier' || role === 'issuer') {
      return [
        { name: 'Home', href: '/dashboard/institution', icon: Home },
        { name: 'Issue Creds', href: '/dashboard/institution#issue', icon: FileText },
        { name: 'Verification Queue', href: '/dashboard/institution#queue', icon: Shield },
        { name: 'Bulk Upload', href: '/dashboard/institution#bulk', icon: Settings },
        { name: 'Analytics', href: '/dashboard/institution#analytics', icon: BarChart3 },
      ];
    }
    // Default navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Credentials', href: '/dashboard/credentials', icon: FileText },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>
            <SidebarContent navigation={navigation} currentPath={location.pathname} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent navigation={navigation} currentPath={location.pathname} />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Global Search */}
            <form aria-label="Global search" role="search" className="flex flex-1 items-center" onSubmit={(e) => e.preventDefault()}>
              <input
                aria-label="Search"
                placeholder="Search credentials, users, reports..."
                className="w-full max-w-xl rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="flex items-center gap-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:flex lg:flex-col lg:text-sm lg:leading-6">
                  <span className="font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-gray-500 capitalize">{user?.role}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, currentPath }: { navigation: any[], currentPath: string }) {
  const { user } = useAuth();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">BOSE</h1>
            <p className="text-xs text-gray-500">Blockchain Credentials</p>
          </div>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      currentPath === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                    )}
                  >
                    <item.icon
                      className={cn(
                        currentPath === item.href ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700',
                        'h-6 w-6 shrink-0'
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{user?.organization}</p>
                  <p className="text-xs text-blue-700 capitalize">{user?.role} Access</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}