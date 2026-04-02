import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering when position changes externally
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng, true);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng(), true);
        },
      }}
    />
  );
};

const LocationPicker = ({ lat, lng, onChange }) => {
  const [position, setPosition] = useState(
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  );

  const [mapCenter, setMapCenter] = useState(
    lat && lng ? [Number(lat), Number(lng)] : [12.9716, 77.5946] // Default to Bangalore if no location
  );

  useEffect(() => {
    if (lat && lng) {
      const newPos = { lat: Number(lat), lng: Number(lng) };
      setPosition(newPos);
      setMapCenter([Number(lat), Number(lng)]);
    }
  }, [lat, lng]);

  const handlePositionChange = useCallback(async (newPos, fetchAddress = false) => {
    setPosition(newPos);
    
    let address = null;
    if (fetchAddress) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`
        );
        const data = await response.json();
        if (data && data.display_name) {
          address = data.display_name;
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    }

    onChange({
      latitude: newPos.lat.toFixed(6),
      longitude: newPos.lng.toFixed(6),
      address: address
    });
  }, [onChange]);

  const handleSetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          
          handlePositionChange(newPos, true);
          setMapCenter([newPos.lat, newPos.lng]);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not get your current location. Please check your browser permissions.");
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-black text-slate-700 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-600" />
          Select Location on Map
        </label>
        <button
          type="button"
          onClick={handleSetCurrentLocation}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl transition-colors border border-emerald-100"
        >
          <Navigation size={14} />
          Use Current Location
        </button>
      </div>

      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner group relative">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={mapCenter} />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100 shadow-sm pointer-events-none">
          Click or drag marker to set location
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
