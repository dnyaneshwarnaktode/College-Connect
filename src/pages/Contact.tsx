import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  HelpCircle,
  Calendar
} from 'lucide-react';

export default function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['support@collegeconnect.edu', 'info@collegeconnect.edu'],
      description: 'We typically respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 9356943456', '+91 9876543210'],
      description: 'Monday - Friday, 9 AM - 6 PM IST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['KIT College, Kolhapur', 'Maharashtra, India'],
      description: 'Open Monday - Friday, 9 AM - 5 PM'
    },
    {
      icon: Clock,
      title: 'Live Chat',
      details: ['Available 24/7', 'Average response: 2 minutes'],
      description: 'Get instant help from our support team'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-transparent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              We're here to help! Reach out to us with any questions, concerns, or feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Information */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your preferred way to contact us
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div key={index} className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-darkblue-100 dark:bg-darkblue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent size={32} className="text-darkblue-600 dark:text-darkblue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {info.title}
                </h3>
                <div className="space-y-2 mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 dark:text-gray-300 font-medium">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get help instantly with these options
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button className="bg-white/20 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex flex-col items-center space-y-3">
              <MessageCircle size={32} />
              <span className="font-semibold">Start Live Chat</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex flex-col items-center space-y-3">
              <Calendar size={32} />
              <span className="font-semibold">Schedule a Call</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex flex-col items-center space-y-3">
              <HelpCircle size={32} />
              <span className="font-semibold">Browse Help Center</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}