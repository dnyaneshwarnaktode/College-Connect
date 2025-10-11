import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, User, Tag } from 'lucide-react';
import { Event } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  onSave: (eventData: Partial<Event>) => void;
  viewOnly?: boolean;
}

export default function EventModal({ isOpen, onClose, event, onSave, viewOnly = false }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'academic',
    capacity: 50,
    image: ''
  });

  // Update form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        category: event.category || 'academic',
        capacity: event.capacity || 50,
        image: event.image || ''
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      category: formData.category as 'academic' | 'cultural' | 'sports' | 'technical'
    });
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {viewOnly ? 'Event Details' : event ? 'Edit Event' : 'Create New Event'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {viewOnly ? (
            // View Mode - Display event details
            <div className="space-y-6">
              {/* Event Image */}
              {event?.image && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Event Title and Category */}
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event?.title}</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(event?.category || '')}`}>
                  <Tag size={14} className="mr-1" />
                  {event?.category}
                </span>
              </div>

              {/* Event Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{event?.description}</p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                    <p className="text-gray-600 dark:text-gray-400">{event?.date ? new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</p>
                    <p className="text-gray-600 dark:text-gray-400">{event?.time || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">{event?.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</p>
                    <p className="text-gray-600 dark:text-gray-400">{event?.registered || 0} / {event?.capacity || 0} registered</p>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              {event?.organizer && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <User className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Organizer</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.organizer}</p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Edit/Create Mode - Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {event ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}