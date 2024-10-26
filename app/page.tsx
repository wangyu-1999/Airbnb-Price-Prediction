'use client'

import { useState, useEffect } from 'react';
import { Map, AdvancedMarker, MapMouseEvent, APIProvider } from '@vis.gl/react-google-maps';
import RootLayout from './layout';

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
  const [hostResponseTime, setHostResponseTime] = useState('');
  const [hostResponseRate, setHostResponseRate] = useState(50);
  const [hostAcceptanceRate, setHostAcceptanceRate] = useState(50);
  const [hostNeighbourhood, setHostNeighbourhood] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('')
  const [mapId, setMapId] = useState<string>('')
  const [hostIdentityVerified, setHostIdentityVerified] = useState(false);
  const [accommodates, setAccommodates] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [minimumNights, setMinimumNights] = useState('');
  const [maximumNights, setMaximumNights] = useState('');
  const [numberOfReviews, setNumberOfReviews] = useState('');
  const [reviewScoresRating, setReviewScoresRating] = useState(2.5);
  const [reviewScoresAccuracy, setReviewScoresAccuracy] = useState(2.5);
  const [reviewScoresCleanliness, setReviewScoresCleanliness] = useState(2.5);
  const [reviewScoresCheckin, setReviewScoresCheckin] = useState(2.5);
  const [reviewScoresCommunication, setReviewScoresCommunication] = useState(2.5);
  const [reviewScoresLocation, setReviewScoresLocation] = useState(2.5);
  const [reviewScoresValue, setReviewScoresValue] = useState(2.5);
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

  const hostResponseTimes = ["Fast", "Moderate", "Slow"];

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
        body: JSON.stringify({
          location: selectedLocation,
          propertyType,
          roomType,
          bedCount: parseInt(bedCount),
          hostResponseTime,
          hostResponseRate: hostResponseRate / 100,
          hostAcceptanceRate: hostAcceptanceRate / 100,
          hostNeighbourhood,
          hostIdentityVerified: hostIdentityVerified ? 1 : 0,
          accommodates: parseInt(accommodates),
          bathrooms: parseFloat(bathrooms),
          bedrooms: parseInt(bedrooms),
          minimumNights: parseInt(minimumNights),
          maximumNights: parseInt(maximumNights),
          numberOfReviews: parseInt(numberOfReviews),
          reviewScoresRating,
          reviewScoresAccuracy,
          reviewScoresCleanliness,
          reviewScoresCheckin,
          reviewScoresCommunication,
          reviewScoresLocation,
          reviewScoresValue
        }),
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

  // Function to handle accommodates input
  const handleAccommodatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAccommodates(value);
    } else {
      setShowAlert(true);
      setAlertMessage('Please enter a valid integer');
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Function to handle bathrooms input
  const handleBathroomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBathrooms(value);
    } else {
      setShowAlert(true);
      setAlertMessage('Please enter a valid number');
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Function to handle bedrooms input
  const handleBedroomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setBedrooms(value);
    } else {
      setShowAlert(true);
      setAlertMessage('Please enter a valid integer');
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Function to handle minimum nights input
  const handleMinimumNightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMinimumNights(value);
    } else {
      setShowAlert(true);
      setAlertMessage('Please enter a valid integer');
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Function to handle maximum nights input
  const handleMaximumNightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMaximumNights(value);
    } else {
      setShowAlert(true);
      setAlertMessage('Please enter a valid integer');
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Function to handle number of reviews input
  const handleNumberOfReviewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setNumberOfReviews(value);
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
                  <label className="block text-lg font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-600">
                    {selectedLocation ? <span className="text-green-500">Location selected</span> : <span className="text-red-500">Please select a location on the map</span>}
                  </p>
                </div>
                <button
                  onClick={openModal}
                  className="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Fill Other Parameters
                </button>
              </div>
            </div>
          </div>

          {/* Prediction result section */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-5">Estimated Price</h2>
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-5">
                  {isLoading ? 'Calculating...' : (price !== null ? `$${price.toFixed(2)}` : '???')}
                </p>
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedLocation || !propertyType || !roomType || !bedCount || !hostResponseTime || !accommodates || !bathrooms || !bedrooms || !minimumNights || !maximumNights || !numberOfReviews}
                className={`w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${(isLoading || !selectedLocation || !propertyType || !roomType || !bedCount || !hostResponseTime || !accommodates || !bathrooms || !bedrooms || !minimumNights || !maximumNights || !numberOfReviews) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Calculating...' : 'Calculate Price'}
              </button>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accommodates</label>
                  <input
                    type="text"
                    value={accommodates}
                    onChange={handleAccommodatesChange}
                    placeholder="Enter number of guests"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="text"
                    value={bedrooms}
                    onChange={handleBedroomsChange}
                    placeholder="Enter number of bedrooms"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="text"
                    value={bathrooms}
                    onChange={handleBathroomsChange}
                    placeholder="Enter number of bathrooms"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Nights</label>
                  <input
                    type="text"
                    value={minimumNights}
                    onChange={handleMinimumNightsChange}
                    placeholder="Enter minimum nights"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Nights</label>
                  <input
                    type="text"
                    value={maximumNights}
                    onChange={handleMaximumNightsChange}
                    placeholder="Enter maximum nights"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Response Time</label>
                  <select
                    value={hostResponseTime}
                    onChange={(e) => setHostResponseTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">Select host response time</option>
                    {hostResponseTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Neighbourhood</label>
                  <input
                    type="text"
                    value={hostNeighbourhood}
                    onChange={(e) => setHostNeighbourhood(e.target.value)}
                    placeholder="Enter host neighbourhood"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Response Rate <span className="text-blue-500 ml-2">{hostResponseRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hostResponseRate}
                    onChange={(e) => setHostResponseRate(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Acceptance Rate <span className="text-blue-500 ml-2">{hostAcceptanceRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hostAcceptanceRate}
                    onChange={(e) => setHostAcceptanceRate(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={hostIdentityVerified}
                      onChange={(e) => setHostIdentityVerified(e.target.checked)}
                      className="mr-2"
                    />
                    Host Identity Verified
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Reviews</label>
                  <input
                    type="text"
                    value={numberOfReviews}
                    onChange={handleNumberOfReviewsChange}
                    placeholder="Enter number of reviews"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Rating <span className="text-blue-500 ml-2">{reviewScoresRating.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresRating}
                    onChange={(e) => setReviewScoresRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Accuracy <span className="text-blue-500 ml-2">{reviewScoresAccuracy.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresAccuracy}
                    onChange={(e) => setReviewScoresAccuracy(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Cleanliness <span className="text-blue-500 ml-2">{reviewScoresCleanliness.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresCleanliness}
                    onChange={(e) => setReviewScoresCleanliness(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Checkin <span className="text-blue-500 ml-2">{reviewScoresCheckin.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresCheckin}
                    onChange={(e) => setReviewScoresCheckin(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Communication <span className="text-blue-500 ml-2">{reviewScoresCommunication.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresCommunication}
                    onChange={(e) => setReviewScoresCommunication(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Location <span className="text-blue-500 ml-2">{reviewScoresLocation.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresLocation}
                    onChange={(e) => setReviewScoresLocation(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Scores Value <span className="text-blue-500 ml-2">{reviewScoresValue.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={reviewScoresValue}
                    onChange={(e) => setReviewScoresValue(parseFloat(e.target.value))}
                    className="w-full"
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