import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import HeroSection from './landing/HeroSection';
import FeatureSection from './landing/FeatureSection';
import HowItWorksSection from './landing/HowItWorksSection';
import SDGSection from './landing/SDGSection';
import TestimonialsSection from './landing/TestimonialsSection';
import CTASection from './landing/CTASection';

export default function Landing() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0C10] transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50 flex items-center">
        <span className="mr-2 text-gray-800 dark:text-gray-200 text-sm font-medium">{darkMode ? 'Dark' : 'Light'} Mode</span>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle dark mode"
          className="relative w-14 h-7 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none flex items-center"
        >
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Sun size={16} className={darkMode ? 'opacity-40' : 'opacity-100 text-yellow-500'} />
          </span>
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Moon size={16} className={darkMode ? 'opacity-100 text-blue-400' : 'opacity-40'} />
          </span>
          <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? 'translate-x-7' : ''}`}
            style={{ transform: darkMode ? 'translateX(28px)' : 'translateX(0)' }}
          />
        </button>
      </div>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <SDGSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}