import { roomsData } from '../data/rooms';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 mb-10 text-white text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Perfect Student Home</h1>
        <p className="text-indigo-100">Browse hundreds of verified rooms near your campus.</p>
      </div>

      {/* Rooms Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Rooms for Rent</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {roomsData.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
            
            <Link to={`/rooms/${room.id}`}>
              <img 
                src={room.image} 
                alt={room.name} 
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
              />
            </Link>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors">
                <Link to={`/rooms/${room.id}`}>{room.name}</Link>
              </h3>
              
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {room.location}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-900">₹{room.rent.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500 block">per month</span>
                </div>
                
                <Link 
                  to={`/rooms/${room.id}`} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
