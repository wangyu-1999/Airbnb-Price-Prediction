'use client'

import { useState, useEffect } from 'react';
import { Map, MapCameraChangedEvent, AdvancedMarker, MapMouseEvent, APIProvider } from '@vis.gl/react-google-maps';
import RootLayout from './layout';
import { isMapIterator } from 'util/types';

export default function Home() {
  // State variables for managing UI and data
  const [serverAddress, setServerAddress] = useState(process.env.NEXT_PUBLIC_SERVER_ADDRESS || '');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [propertyType, setPropertyType] = useState('');
  const [roomType, setRoomType] = useState('');
  const [bedCount, setBedCount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('')
  const [mapId, setMapId] = useState<string>('')
  useEffect(() => {
    fetch('/api/maps-api-key')
      .then(response => response.json())
      .then(data => {
        setApiKey(data.apiKey)
        setMapId(data.mapId)
      })
      .catch(error => console.error('Error fetching API key:', error))
  }, [])

  // Arrays for dropdown options
  const propertyTypes = [
    'Apartment', 'House', 'Townhouse', 'Condominium', 'Villa', 'Cabin',
    'Treehouse', 'Houseboat', 'Camper/RV', 'Tent', 'Hotel room',
    'Bed and Breakfast', 'Loft', 'Farmhouse', 'Castle'
  ];

  const roomTypes = [
    'Entire home/apt', 'Private room', 'Shared room', 'Hotel room'
  ];

  // Function to handle price calculation
  const handleSearch = async () => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastSearchTime < 5000) {
      setShowAlert(true);
      setAlertMessage('Operation too fast, please try again later');
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setLastSearchTime(now);

    // Server address validation
    if (!serverAddress) {
      setShowAlert(true);
      setAlertMessage('Please enter server address');
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setIsLoading(true);
    setPrice(null);

    // API call to get price prediction
    try {
      const response = await fetch(`${serverAddress}/price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: selectedLocation, propertyType, roomType, bedCount: parseInt(bedCount) }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      console.log('Success:', data);
      if (typeof data.price === 'number') {
        setPrice(data.price);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle map click event
  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      setSelectedLocation({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng
      });
    }
  };

  // Function to handle bed count input
  const handleBedCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setBedCount(value);
    } else {
      setShowAlert(true);
      setAlertMessage('Please enter a valid integer');
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Modal control functions
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Main component render
  return (
    <RootLayout>
      <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
        {/* Header section */}
        <header className="w-full flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Airbnb Price Prediction</h1>
          <div className="flex items-center">
            <input
              placeholder="Enter server address..."
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </header>

        {/* Alert message */}
        {showAlert && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
            {alertMessage}
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col md:flex-row w-full gap-8 mb-8">
          {/* Input parameters section */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Input Parameters</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-600">
                    {selectedLocation ? 'Location selected' : 'Please select a location on the map'}
                  </p>
                </div>
                <button
                  onClick={openModal}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Fill Other Parameters
                </button>
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedLocation || !propertyType || !roomType || !bedCount}
                className={`w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${(isLoading || !selectedLocation || !propertyType || !roomType || !bedCount) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Calculating...' : 'Calculate Price'}
              </button>
            </div>
          </div>

          {/* Prediction result section */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Prediction Result</h2>
              <div className="text-center">
                <p className="text-lg mb-2">Estimated Price:</p>
                <p className="text-5xl font-bold text-blue-600">
                  {isLoading ? 'Calculating...' : (price !== null ? `$${price.toFixed(2)}` : '???')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map component */}

        {apiKey ? (
          <APIProvider
            apiKey={apiKey}
            language='en'
            onLoad={() => console.log('Google Maps API loaded.')}
          >
            <div className="w-full h-[500px] mb-8">
              <Map
                mapId={mapId}
                defaultZoom={11}
                defaultCenter={{ lat: 42.3601, lng: -71.0589 }}
                onClick={handleMapClick}
              >
                {selectedLocation && (
                  <AdvancedMarker position={selectedLocation} />
                )}
              </Map>
            </div>
          </APIProvider>
        ) : (
          <div className="w-full h-[500px] mb-8 flex items-center justify-center bg-gray-100">
            <p className="text-xl text-gray-600">Loading map...</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          <p>&copy; 2024 Airbnb Price Prediction. All rights reserved.</p>
        </footer>

        {/* Modal for additional parameters */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
              <h3 className="text-2xl font-bold mb-6">Other Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Beds</label>
                  <input
                    type="text"
                    value={bedCount}
                    onChange={handleBedCountChange}
                    placeholder="Enter number of beds"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </main>
    </RootLayout>
  )
}
