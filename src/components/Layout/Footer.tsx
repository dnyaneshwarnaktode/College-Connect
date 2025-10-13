import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/dnyaneshwarnaktode/College-Connect',
      color: 'hover:text-gray-300'
    }
  ];

  const quickLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Events', path: '/events' },
    { name: 'Projects', path: '/projects' },
    { name: 'Teams', path: '/teams' },
    { name: 'Forums', path: '/forums' },
    { name: 'Class Groups', path: '/class-groups' }
  ];

  return (
    <footer className="bg-dark-900 dark:bg-dark-900 border-t border-dark-700 dark:border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-darkblue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-xl font-bold text-dark-100 dark:text-dark-100">
                CollegeConnect
              </span>
            </div>
            <p className="text-dark-300 dark:text-dark-300 text-sm mb-6 max-w-xs">
              Connecting students, faculty, and alumni through events, projects, and collaborative learning.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-dark-400 dark:text-dark-400">
                <Mail size={16} />
                <span>contact@collegeconnect.edu</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-dark-400 dark:text-dark-400">
                <Phone size={16} />
                <span>+91 9356943456</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-dark-400 dark:text-dark-400">
                <MapPin size={16} />
                <span>KIT College, Kolhapur</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-dark-100 dark:text-dark-100 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-dark-400 dark:text-dark-400 hover:text-darkblue-400 dark:hover:text-darkblue-400 transition-colors text-sm flex items-center group"
                  >
                    {link.name}
                    <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Contact */}
          <div>
            <h3 className="text-lg font-semibold text-dark-100 dark:text-dark-100 mb-4">
              About Us
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-dark-400 dark:text-dark-400 hover:text-darkblue-400 dark:hover:text-darkblue-400 transition-colors text-sm flex items-center group"
                >
                  About CollegeConnect
                  <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-dark-400 dark:text-dark-400 hover:text-darkblue-400 dark:hover:text-darkblue-400 transition-colors text-sm flex items-center group"
                >
                  Contact Us
                  <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-8 pt-8 border-t border-dark-700 dark:border-dark-700">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-sm text-dark-400 dark:text-dark-400">Follow us:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-dark-400 dark:text-dark-400 ${social.color} transition-colors p-2 rounded-lg hover:bg-dark-800 dark:hover:bg-dark-800`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <IconComponent size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
            
            <div className="text-sm text-dark-400 dark:text-dark-400">
              © {currentYear} CollegeConnect. Made with{' '}
              <Heart size={14} className="inline text-red-500 mx-1" />
              for students.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
