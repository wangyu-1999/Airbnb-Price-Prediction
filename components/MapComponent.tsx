"use client";
import React from 'react';
import { APIProvider, Map, AdvancedMarker, MapMouseEvent } from '@vis.gl/react-google-maps';

interface MapComponentProps {
    apiKey: string;
    mapId: string;
    selectedLocation: google.maps.LatLngLiteral | null;
    selectedNeighbourhood: google.maps.LatLngLiteral | null;
    handleMapClick: (e: MapMouseEvent) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
    apiKey,
    mapId,
    selectedLocation,
    selectedNeighbourhood,
    handleMapClick,
}) => {
    return (
        <div className="w-full h-[500px] mb-8">
            {apiKey ? (
                <APIProvider
                    apiKey={apiKey}
                    language='en'
                    onLoad={() => console.log('Google Maps API loaded.')}
                >
                    <Map
                        mapId={mapId}
                        defaultZoom={11}
                        defaultCenter={{ lat: 42.3601, lng: -71.0589 }}
                        onClick={handleMapClick}
                    >
                        {/* {selectedLocation && (
                            <AdvancedMarker position={selectedLocation} />
                        )} */}
                        {selectedNeighbourhood && (
                            <AdvancedMarker position={selectedNeighbourhood} />
                        )}
                    </Map>
                </APIProvider>
            ) : (
                <div className="w-full h-[500px] mb-8 flex items-center justify-center bg-gray-100">
                    <p className="text-xl text-gray-600">Loading map...</p>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
