import { useParams, Link } from 'react-router-dom';
import { roomsData } from '../data/rooms';

const RoomDetailPage = () => {
  const { roomId } = useParams();
  
  // Find the room that matches the ID from the URL
  const room = roomsData.find((r) => r.id === parseInt(roomId));

  // If someone types a wrong URL, show this
  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Room Not Found</h1>
        <p className="text-gray-500 mb-8">The room you are looking for doesn't exist or has been booked.</p>
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link> 
        <span className="mx-2">/</span> 
        <span className="text-gray-800">{room.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Image Section */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <img 
            src={room.image} 
            alt={room.name} 
            className="w-full h-[400px] object-cover rounded-lg"
          />
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
          <p className="text-gray-500 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {room.location}
          </p>

          <div className="border-t border-b py-4 my-4">
            <span className="text-4xl font-extrabold text-indigo-600">₹{room.rent.toLocaleString('en-IN')}</span>
            <span className="text-gray-500 text-lg">/month</span>
          </div>

          {/* Amenities */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Wi-Fi Included
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Attached Bathroom
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              24/7 Water Supply
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Fully Furnished
            </div>
          </div>

          {/* Description */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed mb-8">
            This spacious and well-lit room is perfect for students. Located just minutes away from the main campus, it offers a quiet environment for studying along with all necessary amenities for a comfortable stay. Security is guaranteed with CCTV monitoring.
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-auto">
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors duration-200">
              Book Now
            </button>
            <button className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 rounded-lg transition-colors duration-200">
              Schedule Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
