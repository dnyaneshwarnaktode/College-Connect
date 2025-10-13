import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EventModal from '../components/Modals/EventModal';
import { Event } from '../types';
import { EventCardSkeleton } from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('collegeconnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/events?limit=100`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      
      const data = await response.json();
      const normalizedEvents = (data.events || []).map((event: any) => ({
        ...event,
        id: event._id ? (typeof event._id === 'string' ? event._id : event._id.toString()) : 
            (event.id ? (typeof event.id === 'string' ? event.id : event.id.toString()) : 
            String(Date.now() + Math.random())),
        registered: event.registeredUsers?.length || 0
      }));
      setEvents(normalizedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user, fetchEvents]);

  const fetchUserRegistrations = async () => {
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
        setRegisteredEvents(userEventIds);
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const isEventFull = (event: Event) => {
    return event.registered >= event.capacity;
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      const matchesPastFilter = showPastEvents || !isEventPast(event.date);
      return matchesSearch && matchesCategory && matchesPastFilter;
    });
  }, [events, searchTerm, filterCategory, showPastEvents]);

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    try {
      setError(null);
      if (selectedEvent) {
        const response = await fetch(`${API_BASE_URL}/events/${selectedEvent.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(eventData)
        });
        if (!response.ok) {
          throw new Error('Failed to update event');
        }
        await fetchEvents();
      } else {
        const payload = {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          category: eventData.category,
          organizer: eventData.organizer || user?.department || 'Unknown',
          capacity: eventData.capacity,
          image: (eventData as any)?.image,
          tags: (eventData as any)?.tags || []
        };
        const response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error('Failed to create event');
        }
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error instanceof Error ? error.message : 'Failed to save event. Please try again.');
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      setError(null);
      
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      // Check if already registered
      if (registeredEvents.includes(eventId)) {
        return; // Already registered, no need to make API call
      }

      const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle "already registered" as a success case, not an error
        if (errorData.message && errorData.message.includes('Already registered')) {
          setRegisteredEvents([...registeredEvents, eventId]);
          await fetchEvents();
          return; // Exit early, don't throw error
        }
        throw new Error(errorData.message || 'Failed to register for event');
      }
      
      setRegisteredEvents([...registeredEvents, eventId]);
      await fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      setError(error instanceof Error ? error.message : 'Failed to register for event. Please try again.');
    }
  };

  const handleViewEventDetails = (event: Event) => {
    navigate(`/events/${event.id}`);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-100 dark:text-dark-100">Events</h1>
          <p className="text-dark-300 dark:text-dark-300 mt-1">Discover and join exciting college events</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button 
            onClick={handleCreateEvent}
            className="flex items-center space-x-2 bg-darkblue-600 hover:bg-darkblue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPastEvents}
                onChange={(e) => setShowPastEvents(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show past events</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            {event.image && (
              <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
                <div className="flex items-center gap-2">
                  {isEventPast(event.date) && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Expired
                    </span>
                  )}
                  {!isEventPast(event.date) && isEventFull(event) && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Full
                    </span>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {event.registered}/{event.capacity}
                  </div>
                </div>
              </div>

              <h3 
                onClick={() => handleViewEventDetails(event)}
                className="text-xl font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {event.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={16} className="mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin size={16} className="mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users size={16} className="mr-2" />
                  {event.organizer}
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewEventDetails(event)}
                  className="flex-1 py-2 px-4 rounded-lg transition-colors font-medium bg-gray-600 hover:bg-gray-700 text-white"
                >
                  View Details
                </button>
                
                {registeredEvents.includes(event.id) ? (
                  <button 
                    disabled
                    className="flex-1 py-2 px-4 rounded-lg font-medium bg-green-600 text-white cursor-default"
                  >
                    ✓ Registered
                  </button>
                ) : isEventPast(event.date) ? (
                  <button 
                    disabled
                    className="flex-1 py-2 px-4 rounded-lg font-medium bg-gray-400 text-white cursor-not-allowed"
                  >
                    Closed
                  </button>
                ) : isEventFull(event) ? (
                  <button 
                    disabled
                    className="flex-1 py-2 px-4 rounded-lg font-medium bg-yellow-500 text-white cursor-not-allowed"
                  >
                    Full
                  </button>
                ) : (
                  <button 
                    onClick={() => handleRegisterEvent(event.id)}
                    className="flex-1 py-2 px-4 rounded-lg transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Register
                  </button>
                )}
                
                {(user?.role === 'admin' || user?.role === 'faculty') && (
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSave={handleSaveEvent}
        viewOnly={registeredEvents.includes(selectedEvent?.id || '')}
      />
    </div>
  );
}

export default React.memo(Events);