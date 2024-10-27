'use client'

import { useState, useEffect } from 'react';
import { MapMouseEvent } from '@vis.gl/react-google-maps';
import RootLayout from './layout';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { propertyTypes, roomTypes, hostResponseTimes, neighbourhoodOptions, neighbourhoodCoordinates } from './constants';
import MapComponent from '@/components/MapComponent';
import Header from '@/components/Header';

export default function Home() {
  // State variables for managing UI and data
  const [serverAddress, setServerAddress] = useState('');
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
  const [superhost, setSuperhost] = useState(false);
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
  const [numberOfReviewsL30d, setNumberOfReviewsL30d] = useState('');
  const [instantBookable, setInstantBookable] = useState(false);
  const [havingLicense, setHavingLicense] = useState(false);
  const [selectedNeighborhoodCoords, setSelectedNeighborhoodCoords] = useState<google.maps.LatLngLiteral | null>(null);

  // Update selectedNeighborhoodCoords when hostNeighbourhood changes
  useEffect(() => {
    if (hostNeighbourhood && neighbourhoodCoordinates[hostNeighbourhood]) {
      const coords = neighbourhoodCoordinates[hostNeighbourhood];
      setSelectedNeighborhoodCoords({
        lat: coords.lat,
        lng: coords.lng
      });
    } else {
      setSelectedNeighborhoodCoords(null);
    }
  }, [hostNeighbourhood]);

  useEffect(() => {
    fetch('/api/maps-api-key')
      .then(response => response.json())
      .then(data => {
        setApiKey(data.apiKey)
        setMapId(data.mapId)
      })
      .catch(error => console.error('Error fetching API key:', error))
  }, [])

  useEffect(() => {
    fetch('/api/server-address')
      .then(response => response.json())
      .then(data => {
        setServerAddress(data.serverAddress);
      })
      .catch(error => console.error('Error fetching server address:', error));
  }, []);

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

    // Host Neighbourhood validation
    if (!hostNeighbourhood) {
      setShowAlert(true);
      setAlertMessage('Please select host neighbourhood');
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // Minimum Nights and Maximum Nights validation
    if (parseInt(minimumNights) > parseInt(maximumNights)) {
      setShowAlert(true);
      setAlertMessage('Minimum Nights should be less than or equal to Maximum Nights');
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
          Host_response_time: hostResponseTime,
          Host_response_rate: hostResponseRate / 100,
          Host_acceptance_rate: hostAcceptanceRate / 100,
          Host_is_superhost: superhost,
          Host_neighbourhood: hostNeighbourhood,
          Host_identity_verified: hostIdentityVerified,
          Property_type: propertyType,
          Room_type: roomType,
          Accommodates: parseInt(accommodates),
          Bathrooms: parseFloat(bathrooms),
          Bedrooms: parseInt(bedrooms),
          Beds: parseInt(bedCount),
          Minimum_nights: parseInt(minimumNights),
          Maximum_nights: parseInt(maximumNights),
          Number_of_reviews_ltm: parseInt(numberOfReviews),
          Number_of_reviews_l30d: parseInt(numberOfReviewsL30d),
          Review_scores_rating: reviewScoresRating,
          Review_scores_accuracy: reviewScoresAccuracy,
          Review_scores_cleanliness: reviewScoresCleanliness,
          Review_scores_checkin: reviewScoresCheckin,
          Review_scores_communication: reviewScoresCommunication,
          Review_scores_location: reviewScoresLocation,
          Review_scores_value: reviewScoresValue,
          Instant_bookable: instantBookable,
          Having_License: havingLicense
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

  // Function to handle number of reviews in last 30 days input
  const handleNumberOfReviewsL30dChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setNumberOfReviewsL30d(value);
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
        <Nav />
        {/* <header className="w-full flex justify-between items-center mb-10">
          <div className="flex flex-col md:flex-row items-center w-full justify-between">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">Airbnb Price Prediction</h1>
            <input
              placeholder="Enter server address..."
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-[36px] flex items-center shadow-sm"
            />
          </div>
        </header> */}
        <Header />
        <p className="text-sm text-gray-500 mb-4">Note: The first request may take longer as the free server wakes up from sleep mode. Subsequent requests will be faster.</p>
        {/* Alert message */}
        {showAlert && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {alertMessage}
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col md:flex-row w-full gap-8 mb-8">
          {/* Input parameters section */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Input Parameters</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Neighbourhood</label>
                  <select
                    value={hostNeighbourhood}
                    onChange={(e) => setHostNeighbourhood(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white shadow-sm"
                  >
                    <option value="">Select host neighbourhood</option>
                    {neighbourhoodOptions.map((neighbourhood) => (
                      <option key={neighbourhood} value={neighbourhood}>{neighbourhood}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={openModal}
                  className="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition duration-150 ease-in-out"
                >
                  Fill Other Parameters
                </button>
              </div>
            </div>
          </div>

          {/* Prediction result section */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Estimated Price</h2>
              <div className="text-center">
                <p className="text-6xl font-bold text-blue-600 mt-8 mb-8">
                  {isLoading ? 'Calculating...' : (price !== null ? `$${price.toFixed(2)}` : '???')}
                </p>
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !hostNeighbourhood || !propertyType || !roomType || !bedCount || !hostResponseTime || !accommodates || !bathrooms || !bedrooms || !minimumNights || !maximumNights || !numberOfReviews || !numberOfReviewsL30d}
                className={`w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition duration-150 ease-in-out ${(isLoading || !hostNeighbourhood || !propertyType || !roomType || !bedCount || !hostResponseTime || !accommodates || !bathrooms || !bedrooms || !minimumNights || !maximumNights || !numberOfReviews || !numberOfReviewsL30d) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Calculating...' : 'Calculate Price'}
              </button>
            </div>
          </div>
        </div>

        {/* Map component */}
        <MapComponent
          apiKey={apiKey}
          mapId={mapId}
          selectedLocation={selectedLocation}
          selectedNeighbourhood={selectedNeighborhoodCoords}
          handleMapClick={handleMapClick}
        />

        {/* Footer */}
        <Footer />

        {/* Modal for additional parameters */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-4 z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Other Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Accommodates</label>
                  <input
                    type="text"
                    value={accommodates}
                    onChange={handleAccommodatesChange}
                    placeholder="Enter number of guests"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bedrooms</label>
                  <input
                    type="text"
                    value={bedrooms}
                    onChange={handleBedroomsChange}
                    placeholder="Enter number of bedrooms"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Number of Beds</label>
                  <input
                    type="text"
                    value={bedCount}
                    onChange={handleBedCountChange}
                    placeholder="Enter number of beds"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bathrooms</label>
                  <input
                    type="text"
                    value={bathrooms}
                    onChange={handleBathroomsChange}
                    placeholder="Enter number of bathrooms"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Minimum Nights</label>
                  <input
                    type="text"
                    value={minimumNights}
                    onChange={handleMinimumNightsChange}
                    placeholder="Enter minimum nights"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Maximum Nights</label>
                  <input
                    type="text"
                    value={maximumNights}
                    onChange={handleMaximumNightsChange}
                    placeholder="Enter maximum nights"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Host Response Time</label>
                  <select
                    value={hostResponseTime}
                    onChange={(e) => setHostResponseTime(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                  >
                    <option value="">Select host response time</option>
                    {hostResponseTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={superhost}
                      onChange={(e) => setSuperhost(e.target.checked)}
                      className="mr-2"
                    />
                    Superhost
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Number of Reviews</label>
                  <input
                    type="text"
                    value={numberOfReviews}
                    onChange={handleNumberOfReviewsChange}
                    placeholder="Enter number of reviews"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Number of Reviews (Last 30 Days)</label>
                  <input
                    type="text"
                    value={numberOfReviewsL30d}
                    onChange={handleNumberOfReviewsL30dChange}
                    placeholder="Enter number of reviews in last 30 days"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={instantBookable}
                      onChange={(e) => setInstantBookable(e.target.checked)}
                      className="mr-2"
                    />
                    Instant Bookable
                  </label>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={havingLicense}
                      onChange={(e) => setHavingLicense(e.target.checked)}
                      className="mr-2"
                    />
                    Having License
                  </label>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                className="w-full mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition duration-150 ease-in-out"
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
