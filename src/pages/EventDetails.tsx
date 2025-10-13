import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Tag, 
  ArrowLeft, 
  Edit, 
  Share2,
  Download,
  Mail,
  Phone,
  GraduationCap,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      checkRegistrationStatus();
    }
  }, [id]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }
      
      const data = await response.json();
      setEvent(data.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const userEventIds = (data.user?.registeredEvents || []).map((eventId: any) => 
          typeof eventId === 'string' ? eventId : 
          eventId._id ? (typeof eventId._id === 'string' ? eventId._id : eventId._id.toString()) :
          eventId.toString()
        );
        setIsRegistered(userEventIds.includes(id));
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const handleRegister = async () => {
    if (!id || registering) return;

    try {
      setRegistering(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle "already registered" as a success case, not an error
        if (errorData.message && errorData.message.includes('Already registered')) {
          setIsRegistered(true);
          await fetchEventDetails();
          return; // Exit early, don't throw error
        }
        throw new Error(errorData.message || 'Failed to register for event');
      }
      
      setIsRegistered(true);
      await fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error registering for event:', error);
      setError(error instanceof Error ? error.message : 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!id || registering) return;

    try {
      setRegistering(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unregister from event');
      }
      
      setIsRegistered(false);
      await fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error unregistering from event:', error);
      setError(error instanceof Error ? error.message : 'Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cultural': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'sports': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'academic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const isEventFull = () => {
    return event ? event.registered >= event.capacity : false;
  };

  const canRegister = () => {
    return !isEventPast(event?.date || '') && !isEventFull() && !isRegistered && !registering;
  };

  const canUnregister = () => {
    return !isEventPast(event?.date || '') && isRegistered && !registering;
  };

  const exportEventDetails = () => {
    if (!event) return;
    
    const eventData = {
      title: event.title,
      description: event.description,
      date: new Date(event.date).toLocaleDateString(),
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      category: event.category,
      capacity: event.capacity,
      registered: event.registered
    };
    
    const blob = new Blob([JSON.stringify(eventData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareEvent = async () => {
    if (!event) return;
    
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/events')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">Event Details</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={shareEvent}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Share Event"
              >
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={exportEventDetails}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Export Details"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              {(user?.role === 'admin' || user?.role === 'faculty') && (
                <button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Edit Event"
                >
                  <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.image && (
              <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Event Description */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Registered Participants */}
            {event.registeredUsers && event.registeredUsers.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  Registered Participants ({event.registeredUsers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.registeredUsers.map((registration, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {registration.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {registration.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {registration.user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {registration.user.role}
                          </span>
                          {registration.user.department && (
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {registration.user.department}
                            </span>
                          )}
                          {registration.user.year && (
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Year {registration.user.year}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Information</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(event.category)}`}>
                  <Tag size={14} className="mr-1" />
                  {event.category}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.registered} / {event.capacity} registered
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Organizer</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.organizer}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registration</h3>
              
              {isEventPast(event.date) ? (
                <div className="text-center py-4">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">This event has ended</p>
                </div>
              ) : isEventFull() ? (
                <div className="text-center py-4">
                  <Users className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Event is full</p>
                </div>
              ) : isRegistered ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium mb-3">You are registered!</p>
                  <button
                    onClick={handleUnregister}
                    disabled={registering}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {registering ? 'Unregistering...' : 'Unregister'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">Join this event</p>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                  </button>
                </div>
              )}
            </div>

            {/* Event Status */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Status</h3>
              <div className="space-y-2">
                {isEventPast(event.date) && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Event Ended</span>
                  </div>
                )}
                {!isEventPast(event.date) && isEventFull() && (
                  <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Fully Booked</span>
                  </div>
                )}
                {!isEventPast(event.date) && !isEventFull() && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Open for Registration</span>
                  </div>
                )}
                {isRegistered && (
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">You are registered</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
