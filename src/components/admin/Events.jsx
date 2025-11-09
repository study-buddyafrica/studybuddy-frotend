import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Edit2, Trash2 } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Math Workshop',
      date: '2024-03-20',
      time: '14:00',
      location: 'Online',
      capacity: 50,
      registered: 35,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Science Fair',
      date: '2024-03-25',
      time: '10:00',
      location: 'Main Hall',
      capacity: 100,
      registered: 75,
      status: 'upcoming'
    }
  ]);

  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', capacity: 0 });
  const [editingEvent, setEditingEvent] = useState(null);

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || newEvent.capacity <= 0) {
      alert('All fields are required and capacity must be greater than zero.');
      return;
    }
    if (editingEvent) {
      setEvents(events.map(event => event.id === editingEvent.id ? { ...newEvent, id: event.id, registered: event.registered } : event));
      setEditingEvent(null);
    } else {
      setEvents([...events, { ...newEvent, id: events.length + 1, registered: 0, status: 'upcoming' }]);
    }
    setNewEvent({ title: '', date: '', time: '', location: '', capacity: 0 });
  };

  const handleEditEvent = (event) => {
    setNewEvent(event);
    setEditingEvent(event);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Event Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
        <div className="mt-4 space-y-4">
          <input type="text" name="title" placeholder="Title" value={newEvent.title} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          <input type="date" name="date" value={newEvent.date} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          <input type="time" name="time" value={newEvent.time} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          <input type="text" name="location" placeholder="Location" value={newEvent.location} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          <input type="number" name="capacity" placeholder="Capacity" value={newEvent.capacity} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          <button onClick={handleAddEvent} className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            {editingEvent ? 'Update Event' : 'Add Event'}
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{event.status}</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" /> {event.date}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" /> {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" /> {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" /> {event.registered} / {event.capacity} registered
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button onClick={() => handleEditEvent(event)} className="text-blue-600 hover:text-blue-900">
                  <Edit2 className="h-5 w-5" />
                </button>
                <button onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
