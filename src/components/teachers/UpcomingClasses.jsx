import React from 'react';

const UpcomingClasses = ({ liveSessions = [] }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-josefin p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-lilita text-[#015575] mb-6 pb-4 border-b border-gray-200">
            Upcoming Sessions
          </h2>
          {liveSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming classes scheduled</p>
          ) : (
            <ul className="space-y-4">
              {liveSessions.map((session) => (
                <li
                  key={session.id}
                  className="bg-gray-50 rounded-xl p-4 transition hover:bg-[#f0f8ff]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#015575] text-lg">
                        {session.subject?.name || 'Unnamed Session'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(session.scheduled_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(session.zoom_link, '_blank')}
                      className="bg-[#015575] text-white px-4 py-2 rounded-lg hover:bg-[#01415e] transition flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Start
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Class Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-lilita text-[#015575] mb-6 pb-4 border-b border-gray-200">
            Session Details
          </h2>
          {liveSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Select a class to view details</p>
          ) : (
            <div className="space-y-6">
              {liveSessions.map((session) => (
                <div key={session.id} className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xl font-semibold text-[#015575]">
                      {session.title || 'Untitled Session'}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {session.description || 'No description available'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#015575]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="font-medium">Teacher:</span>
                        <span>{session.teacher?.name || 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#015575]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <span className="font-medium">Subject:</span>
                        <span>{session.subject?.name || 'General'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#015575]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">Duration:</span>
                        <span>60 mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#015575]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">Price:</span>
                        <span>KES {session.price || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingClasses;