import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MapPin, Navigation, Clock, X, Loader2, Map as MapIcon, Search } from 'lucide-react';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center, isNavigating }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      if (isNavigating) {
        map.panTo(center); // Smoothly follow in navigation mode
      } else {
        map.flyTo(center, map.getZoom());
      }
    }
  }, [center, map, isNavigating]);
  return null;
};

const FitBounds = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      const bounds = L.latLngBounds([start.lat, start.lng], [end.lat, end.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const RouteMapModal = ({ 
  isOpen, 
  onClose, 
  startLocation, // { lat, lng, address, name }
  endLocation,   // { lat, lng, address, name }
  title = "Route to Destination"
}) => {
  const [startPos, setStartPos] = useState(startLocation);
  const [endPos, setEndPos] = useState(endLocation);
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [selectionMode, setSelectionMode] = useState('default'); // 'default', 'current', 'manual'
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const watchIdRef = useRef(null);

  const fetchRoute = useCallback(async (start, end) => {
    if (!start || !end) return;
    setIsLoadingRoute(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_OSRM_BASE_URL || 'https://router.project-osrm.org';
      const url = `${baseUrl}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData({
          geometry: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Leaflet uses [lat, lng]
          distance: (route.distance / 1000).toFixed(2),
          duration: Math.ceil(route.duration / 60),
        });
      } else {
        setError("Could not find a route between these locations.");
      }
    } catch (err) {
      console.error("Routing error:", err);
      setError("Failed to fetch route data.");
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRoute(startPos, endPos);
    }
  }, [isOpen, startPos, endPos, fetchRoute]);

  // Cleanup on close
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startNavigation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setIsNavigating(true);
    setSelectionMode('current');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newStart = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "My Live Location",
          address: "Tracking moving coordinates..."
        };
        setStartPos(newStart);
      },
      (err) => {
        console.error("Navigation error:", err);
        setIsNavigating(false);
        setError("Location tracking lost.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );
  };

  const stopNavigation = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsNavigating(false);
  };

  const handleUseCurrentLocation = () => {
    if (isNavigating) return; // Don't interrupt live navigation
    setSelectionMode('current');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newStart = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "My Current Location",
            address: "Detected via GPS"
          };
          setStartPos(newStart);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Could not get your location. Please check permissions.");
          setSelectionMode('default');
          setStartPos(startLocation);
        }
      );
    }
  };

  const handleResetToDefault = () => {
    stopNavigation();
    setSelectionMode('default');
    setStartPos(startLocation);
  };

  const handleMapClick = async (latlng) => {
    if (selectionMode !== 'manual' || isNavigating) return;
    
    const newStart = {
      lat: latlng.lat,
      lng: latlng.lng,
      name: "Selected Point",
      address: "Fetching address..."
    };
    setStartPos(newStart);

    // Reverse geocode
    try {
      const baseUrl = import.meta.env.VITE_NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
      const response = await fetch(
        `${baseUrl}/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setStartPos(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
        
        {/* Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50 bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MapIcon size={24} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-11">Route Intelligence powered by OSRM</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          
          {/* Map Side */}
          <div className="flex-grow h-full relative group">
            <MapContainer
              center={[startPos.lat, startPos.lng]}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              />
              <Marker position={[startPos.lat, startPos.lng]}>
                 <MapPin color="#10b981" /> {/* Emerald */}
              </Marker>
              <Marker position={[endPos.lat, endPos.lng]}>
                 <MapPin color="#ef4444" /> {/* Red */}
              </Marker>
              {routeData && (
                <Polyline 
                  positions={routeData.geometry} 
                  color="#10b981" 
                  weight={5} 
                  opacity={0.7}
                  dashArray="10, 10"
                />
              )}
              {!isNavigating && <FitBounds start={startPos} end={endPos} />}
              {isNavigating && <ChangeView center={[startPos.lat, startPos.lng]} isNavigating={isNavigating} />}
              <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>

            {isLoadingRoute && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
                 <div className="bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3">
                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                    <span className="font-black text-slate-800 italic uppercase text-xs tracking-widest">Calculating Route...</span>
                 </div>
              </div>
            )}
            
            {selectionMode === 'manual' && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 animate-bounce">
                  Click on map to set start point
               </div>
            )}
          </div>

          {/* Stats & Controls Side */}
          <div className="w-full lg:w-[400px] border-l border-slate-50 flex flex-col bg-slate-50/30 overflow-y-auto">
            
            {/* Route Stats Card */}
            <div className="p-8">
               <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                     <div className="flex flex-col gap-1 text-center flex-1 border-r border-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</span>
                        <span className="text-3xl font-black text-slate-900 italic tracking-tighter">
                           {routeData ? `${routeData.distance} km` : '--'}
                        </span>
                     </div>
                     <div className="flex flex-col gap-1 text-center flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                        <div className="flex items-center justify-center gap-2">
                           <Clock className="text-emerald-500" size={20} />
                           <span className="text-3xl font-black text-slate-900 italic tracking-tighter">
                              {routeData ? `${routeData.duration} min` : '--'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 pt-1">
                           <div className="w-4 h-4 rounded-full border-4 border-emerald-500 bg-white" />
                           <div className="w-0.5 flex-grow border-l-2 border-dashed border-slate-200 my-1" />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Starting From</span>
                           <span className="font-black text-slate-800 text-sm italic uppercase tracking-tight leading-tight">{startPos.name}</span>
                           <span className="text-[10px] text-slate-400 font-medium leading-relaxed">{startPos.address}</span>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 pt-1">
                           <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-200" />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Destination</span>
                           <span className="font-black text-slate-800 text-sm italic uppercase tracking-tight leading-tight">{endPos.name}</span>
                           <span className="text-[10px] text-slate-400 font-medium leading-relaxed">{endPos.address}</span>
                        </div>
                     </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                       {error}
                    </div>
                  )}
               </div>

               {/* Controls */}
               <div className="mt-8 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Adjust Launch Point</h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                     <button 
                        onClick={handleResetToDefault}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectionMode === 'default' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-200'}`}
                     >
                        <div className={`p-2 rounded-xl scale-75 ${selectionMode === 'default' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                           <MapIcon size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="font-black text-xs uppercase italic tracking-wider">Default Location</span>
                           <span className={`text-[9px] font-bold ${selectionMode === 'default' ? 'text-emerald-100' : 'text-slate-400'}`}>Use stored database address</span>
                        </div>
                     </button>

                     <button 
                        onClick={handleUseCurrentLocation}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectionMode === 'current' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-200'}`}
                     >
                        <div className={`p-2 rounded-xl scale-75 ${selectionMode === 'current' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                           <Navigation size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="font-black text-xs uppercase italic tracking-wider">Current Location</span>
                           <span className={`text-[9px] font-bold ${selectionMode === 'current' ? 'text-emerald-100' : 'text-slate-400'}`}>Calculate from your GPS point</span>
                        </div>
                     </button>

                      <button 
                         onClick={() => {
                            if (isNavigating) {
                               stopNavigation();
                            } else {
                               setSelectionMode('manual');
                            }
                         }}
                         className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectionMode === 'manual' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-200'} ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         <div className={`p-2 rounded-xl scale-75 ${selectionMode === 'manual' ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                            <Search size={20} />
                         </div>
                         <div className="flex flex-col items-start">
                            <span className="font-black text-xs uppercase italic tracking-wider">Manual Pick</span>
                            <span className={`text-[9px] font-bold ${selectionMode === 'manual' ? 'text-emerald-100' : 'text-slate-400'}`}>Click anywhere on the map</span>
                         </div>
                      </button>
                   </div>
                   
                   {/* Start/Stop Navigation Button */}
                   {selectionMode === 'current' && (
                       <button
                         onClick={isNavigating ? stopNavigation : startNavigation}
                         className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${isNavigating ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
                       >
                         {isNavigating ? (
                             <>
                               <X size={20} />
                               Stop Navigation
                             </>
                         ) : (
                             <>
                               <Navigation size={20} className="animate-pulse" />
                               Start Navigation
                             </>
                         )}
                       </button>
                   )}
                </div>
            </div>

            <div className="mt-auto p-8 border-t border-slate-50 bg-white/50">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center leading-relaxed">
                  Traffic conditions are estimates based on standard driving speeds. Always prioritize safety.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMapModal;
