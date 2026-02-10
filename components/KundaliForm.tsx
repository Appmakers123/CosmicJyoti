import React, { useState, useRef, useEffect } from 'react';
import { KundaliFormData, Language } from '../types';
import { useTranslation } from '../utils/translations';
import { getGlobalProfile } from '../utils/profileStorageService';
import {
  isValidTime,
  isValidLocationFormat,
  getDatePresets,
  loadKundaliDraft,
  saveKundaliDraft,
  clearKundaliDraft,
} from '../utils/kundaliFormUtils';
import AdBanner from './AdBanner';

interface KundaliFormProps {
  onSubmit: (data: KundaliFormData, options?: { saveToProfile?: boolean; consentToShare?: boolean }) => void;
  isLoading: boolean;
  language: Language;
  savedCharts?: KundaliFormData[];
  onLoadChart?: (data: KundaliFormData) => void;
  onDeleteChart?: (id: string) => void;
  onGetDaily?: (data: KundaliFormData) => void;
}

const COMMON_CITIES = [
  "New Delhi, India", "Mumbai, India", "Bangalore, India", "Chennai, India", "Kolkata, India",
  "Hyderabad, India", "Pune, India", "Ahmedabad, India", "Jaipur, India", "Lucknow, India",
  "Patna, India", "Indore, India", "Bhopal, India", "Chandigarh, India", "Varanasi, India",
  "New York, USA", "Los Angeles, USA", "London, UK", "Manchester, UK", "Toronto, Canada",
  "Vancouver, Canada", "Dubai, UAE", "Singapore", "Sydney, Australia", "Melbourne, Australia",
  "Lagos, Nigeria", "Nairobi, Kenya", "Johannesburg, South Africa", "Cairo, Egypt",
  "Tokyo, Japan", "Hong Kong, China", "Paris, France", "Berlin, Germany",
  "Amsterdam, Netherlands", "Madrid, Spain", "Rome, Italy", "Moscow, Russia", "São Paulo, Brazil",
  "Mexico City, Mexico", "Buenos Aires, Argentina", "Dhaka, Bangladesh", "Karachi, Pakistan",
  "Colombo, Sri Lanka", "Kathmandu, Nepal"
];

const KundaliForm: React.FC<KundaliFormProps> = ({ 
    onSubmit, 
    isLoading, 
    language, 
    savedCharts = [], 
    onLoadChart,
    onDeleteChart,
    onGetDaily
}) => {
  const t = useTranslation(language);
  const defaultLocation = 'Mumbai, India';
  const [formData, setFormData] = useState<KundaliFormData>({
    name: '',
    date: '',
    time: '12:00',
    location: defaultLocation,
    gender: undefined,
    lat: undefined,
    lon: undefined,
    tzone: undefined,
    seconds: undefined,
    observationPoint: 'topocentric',
    ayanamsha: 'lahiri',
    language: 'en'
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Form caching state
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [consentToShare, setConsentToShare] = useState(false);
  const [use24Hour, setUse24Hour] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const lastSaveRef = useRef<string>('');
  
  // Restore draft or profile on mount (run once)
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    
    const profile = getGlobalProfile();
    const draft = loadKundaliDraft();
    const hasProfile = profile?.self && (profile.self.name || profile.self.date || profile.self.location);
    const hasDraft = draft && (draft.name || draft.date || draft.time || draft.location);
    
    if (hasProfile && hasDraft) {
      const overwrite = window.confirm(
        language === 'hi' ? 'प्रोफ़ाइल डेटा से सहेजा गया ड्राफ्ट ओवरराइट करें?' : 'Overwrite saved draft with profile data?'
      );
      if (overwrite) {
        setFormData(prev => ({
          ...prev,
          name: profile!.self!.name || prev.name,
          date: profile!.self!.date || prev.date,
          time: profile!.self!.time || '12:00',
          location: profile!.self!.location || defaultLocation,
          gender: profile!.self!.gender ?? prev.gender,
          lat: profile!.self!.lat ?? prev.lat,
          lon: profile!.self!.lon ?? prev.lon,
          tzone: profile!.self!.tzone ?? prev.tzone,
        }));
        clearKundaliDraft();
      } else {
        setFormData(prev => ({ ...prev, ...draft, location: draft.location || defaultLocation }));
      }
    } else if (hasDraft) {
      const restore = window.confirm(
        language === 'hi' ? 'सहेजा गया ड्राफ्ट पुनर्स्थापित करें?' : 'Restore saved draft?'
      );
      if (restore) {
        setFormData(prev => ({ ...prev, ...draft, location: draft.location || defaultLocation }));
      }
    } else if (hasProfile) {
      setFormData(prev => ({
        ...prev,
        name: profile!.self!.name || prev.name,
        date: profile!.self!.date || prev.date,
        time: profile!.self!.time || '12:00',
        location: profile!.self!.location || defaultLocation,
        gender: profile!.self!.gender ?? prev.gender,
        lat: profile!.self!.lat ?? prev.lat,
        lon: profile!.self!.lon ?? prev.lon,
        tzone: profile!.self!.tzone ?? prev.tzone,
      }));
    }
  }, [language]);
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    const hasData = !!(formData.name || formData.date || formData.time || (formData.location && formData.location.trim()));
    if (!hasData) return;
    
    const timer = setInterval(() => {
      const payload = { name: formData.name, date: formData.date, time: formData.time, location: formData.location };
      const key = JSON.stringify(payload);
      if (key !== lastSaveRef.current) {
        lastSaveRef.current = key;
        saveKundaliDraft(payload);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [formData.name, formData.date, formData.time, formData.location]);
  
  // Save form to cache when submitted
  const saveToCache = (data: KundaliFormData) => {
    try {
      const cachedForms = localStorage.getItem('cosmicjyoti_cached_forms');
      let forms: KundaliFormData[] = cachedForms ? JSON.parse(cachedForms) : [];
      
      // Add new form (limit to last 10)
      forms.push(data);
      if (forms.length > 10) forms = forms.slice(-10);
      
      localStorage.setItem('cosmicjyoti_cached_forms', JSON.stringify(forms));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };
  
  // Get name suggestions after first letter typed
  const getNameSuggestions = (input: string) => {
    if (input.length < 1) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }
    
    try {
      const cachedForms = localStorage.getItem('cosmicjyoti_cached_forms');
      if (cachedForms) {
        const forms: KundaliFormData[] = JSON.parse(cachedForms);
        // Filter names that start with input (case insensitive)
        const matching = forms
          .map(f => f.name)
          .filter(name => name && name.toLowerCase().startsWith(input.toLowerCase()))
          .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
          .slice(0, 3); // Max 3 suggestions
        
        if (matching.length > 0) {
          setNameSuggestions(matching);
          setShowNameSuggestions(true);
        } else {
          setShowNameSuggestions(false);
        }
      }
    } catch (error) {
      console.error('Error getting name suggestions:', error);
    }
  };

  // Geocode location using Google Places Autocomplete API for suggestions
  const geocodeLocation = async (location: string) => {
    if (!location || location.length < 1) {
      setLocationSuggestions([]);
      return;
    }

    setIsGeocoding(true);
    try {
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
      
      if (!GOOGLE_API_KEY) {
        console.warn("Google API key not found, using common cities");
        const filtered = COMMON_CITIES.filter(city => 
          city.toLowerCase().includes(location.toLowerCase())
        );
        setLocationSuggestions(filtered);
        setIsGeocoding(false);
        return;
      }
      
      // Use Google Geocoding API with region bias for India
      const encodedLocation = encodeURIComponent(location);
      // Add region=in to bias results towards India, and components=country:in to prioritize Indian locations
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&region=in&components=country:in&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(geocodeUrl);

      if (response.ok) {
        const data = await response.json();
        console.log("Google Geocoding response:", data);
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          // Process results to get better formatted addresses
          const suggestions = data.results.slice(0, 8).map((r: any) => {
            // Extract address components for better formatting
            const components = r.address_components || [];
            let city = '';
            let state = '';
            let country = '';
            
            // Find city, state, and country from address components
            components.forEach((comp: any) => {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                city = comp.long_name;
              } else if (comp.types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              } else if (comp.types.includes('country')) {
                country = comp.long_name;
              }
            });
            
            // Prefer formatted_address, but create a better format if we have components
            if (city && state && country) {
              return `${city}, ${state}, ${country}`;
            } else if (city && state) {
              return `${city}, ${state}, India`;
            } else {
              // Fallback to formatted_address
              return r.formatted_address;
            }
          });
          
          // Remove duplicates and set suggestions
          const uniqueSuggestions: string[] = Array.from(new Set(suggestions)) as string[];
          setLocationSuggestions(uniqueSuggestions);
        } else if (data.status === 'ZERO_RESULTS') {
          // Try without region restriction for international locations
          const fallbackUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${GOOGLE_API_KEY}`;
          const fallbackResponse = await fetch(fallbackUrl);
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.status === 'OK' && fallbackData.results && fallbackData.results.length > 0) {
              const fallbackSuggestions = fallbackData.results.slice(0, 5).map((r: any) => r.formatted_address);
              setLocationSuggestions(fallbackSuggestions);
            } else {
              // Show common cities that match
              const filtered = COMMON_CITIES.filter(city => 
                city.toLowerCase().includes(location.toLowerCase())
              );
              setLocationSuggestions(filtered);
            }
          } else {
            // Show common cities that match
            const filtered = COMMON_CITIES.filter(city => 
              city.toLowerCase().includes(location.toLowerCase())
            );
            setLocationSuggestions(filtered);
          }
        } else {
          // Other status, try without region restriction
          const fallbackUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${GOOGLE_API_KEY}`;
          const fallbackResponse = await fetch(fallbackUrl);
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.status === 'OK' && fallbackData.results && fallbackData.results.length > 0) {
              const fallbackSuggestions = fallbackData.results.slice(0, 5).map((r: any) => r.formatted_address);
              setLocationSuggestions(fallbackSuggestions);
            } else {
              const filtered = COMMON_CITIES.filter(city => 
                city.toLowerCase().includes(location.toLowerCase())
              );
              setLocationSuggestions(filtered);
            }
          } else {
            const filtered = COMMON_CITIES.filter(city => 
              city.toLowerCase().includes(location.toLowerCase())
            );
            setLocationSuggestions(filtered);
          }
        }
      } else {
        // Fallback to common cities
        const filtered = COMMON_CITIES.filter(city => 
          city.toLowerCase().includes(location.toLowerCase())
        );
        setLocationSuggestions(filtered);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Fallback to common cities
      const filtered = COMMON_CITIES.filter(city => 
        city.toLowerCase().includes(location.toLowerCase())
      );
      setLocationSuggestions(filtered);
    } finally {
      setIsGeocoding(false);
    }
  };
  
  // Validate coordinates
  const isValidCoordinate = (value: number | undefined): boolean => {
    if (value === undefined || value === null) return false;
    if (isNaN(value)) return false;
    return value >= -180 && value <= 180;
  };

  // Geocode selected location to get coordinates
  const geocodeSelectedLocation = async (location: string): Promise<KundaliFormData | null> => {
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      console.warn("Invalid location string");
      return null;
    }

    // Check if location is already coordinates (lat, lon format)
    const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (isValidCoordinate(lat) && isValidCoordinate(lon)) {
        const timezone = Math.round((lon / 15) * 2) / 2;
        const updatedFormData: KundaliFormData = {
          ...formData,
          lat: lat,
          lon: lon,
          tzone: timezone.toString(),
          location: location
        };
        setFormData(updatedFormData);
        return updatedFormData;
      }
    }

    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
    if (!GOOGLE_API_KEY) {
      console.warn("Google API key not found, cannot geocode location");
      // Calculate timezone from location name if possible (fallback)
      const timezone = 5.5; // Default IST
      return null;
    }
    
    try {
      const encodedLocation = encodeURIComponent(location.substring(0, 200)); // Limit length
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${GOOGLE_API_KEY}`;
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(geocodeUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results && Array.isArray(data.results) && data.results.length > 0) {
          const result = data.results[0];
          const location_data = result.geometry?.location;
          
          if (!location_data || typeof location_data.lat !== 'number' || typeof location_data.lng !== 'number') {
            console.warn("Invalid location data from geocoding");
            return null;
          }
          
          const lat = location_data.lat;
          const lon = location_data.lng;
          
          // Validate coordinates
          if (!isValidCoordinate(lat) || !isValidCoordinate(lon)) {
            console.warn("Invalid coordinates from geocoding:", lat, lon);
            return null;
          }
          
          // Get timezone using Google Time Zone API
          let timezone = 5.5; // Default
          try {
            const timestamp = Math.floor(Date.now() / 1000);
            const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`;
            const tzController = new AbortController();
            const tzTimeoutId = setTimeout(() => tzController.abort(), 5000); // 5 second timeout
            
            const tzResponse = await fetch(timezoneUrl, { signal: tzController.signal });
            clearTimeout(tzTimeoutId);
            
            if (tzResponse.ok) {
              const tzData = await tzResponse.json();
              if (tzData.status === 'OK' && typeof tzData.rawOffset === 'number') {
                // Convert rawOffset (seconds) to hours
                timezone = tzData.rawOffset / 3600;
                // Validate timezone range
                if (isNaN(timezone) || timezone < -12 || timezone > 14) {
                  timezone = Math.round((lon / 15) * 2) / 2;
                }
              }
            }
          } catch (tzError) {
            console.warn("Timezone API failed, calculating from longitude:", tzError);
            // Fallback: calculate timezone from longitude
            timezone = Math.round((lon / 15) * 2) / 2;
          }
          
          // Return updated form data
          const updatedFormData: KundaliFormData = {
            ...formData,
            lat: lat,
            lon: lon,
            tzone: timezone.toString(),
            location: (result.formatted_address && typeof result.formatted_address === 'string') ? result.formatted_address : location
          };
          
          // Update form data state
          setFormData(updatedFormData);
          
          return updatedFormData;
        } else if (data.status === 'ZERO_RESULTS') {
          console.warn("No results found for location:", location);
          return null;
        } else if (data.status === 'OVER_QUERY_LIMIT') {
          console.warn("Geocoding API quota exceeded");
          return null;
        }
      } else {
        console.warn("Geocoding API request failed:", response.status, response.statusText);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn("Geocoding request timed out");
      } else {
        console.error("Geocoding selected location error:", error);
      }
    }
    return null;
  };

  const saveDraftOnBlur = () => {
    const hasData = formData.name || formData.date || formData.time || (formData.location && formData.location.trim());
    if (hasData) saveKundaliDraft({ name: formData.name, date: formData.date, time: formData.time, location: formData.location });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTimeError(null);
    setLocationError(null);
    if (name === 'time') {
      if (value && !isValidTime(value)) setTimeError(language === 'hi' ? 'समय HH:MM प्रारूप में होना चाहिए' : 'Time must be in HH:MM format');
    }
    if (name === 'location') {
        setFormData(prev => ({ ...prev, location: value, lat: undefined, lon: undefined, tzone: undefined }));
        if (value.trim() && !isValidLocationFormat(value)) setLocationError(t.locationFormatError || 'Use City, Country format');
        else setLocationError(null);
        if (value.length > 0) setShowSuggestions(true);
        if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
        if (value.length >= 1) {
          geocodeTimeoutRef.current = setTimeout(() => geocodeLocation(value), 300);
        } else setLocationSuggestions([]);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectCity = async (city: string) => {
    setLocationError(null);
    setFormData(prev => ({ ...prev, location: city, lat: undefined, lon: undefined, tzone: undefined }));
    setShowSuggestions(false);
    saveKundaliDraft({ name: formData.name, date: formData.date, time: formData.time, location: city });
    await geocodeSelectedLocation(city);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        alert(language === 'hi' ? "आपके ब्राउज़र में जियोलोकेशन समर्थित नहीं है" : "Geolocation is not supported by your browser");
        return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            // Try multiple geocoding providers for better accuracy
            let locationName = '';
            let timezone = 5.5; // Default IST
            
            // First try: Open-Meteo (free, no API key needed)
            try {
                const openMeteoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=${language === 'hi' ? 'hi' : 'en'}&format=json`);
                const openMeteoData = await openMeteoResponse.json();
                
                if (openMeteoData.results && openMeteoData.results.length > 0) {
                    const place = openMeteoData.results[0];
                    locationName = `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}${place.country ? ', ' + place.country : ''}`;
                    // Get timezone from Open-Meteo timezone API
                    try {
                        const tzController = new AbortController();
                        const tzTimeout = setTimeout(() => tzController.abort(), 5000);
                        const tzResponse = await fetch(
                          `https://api.open-meteo.com/v1/timezone?latitude=${latitude}&longitude=${longitude}`,
                          { signal: tzController.signal }
                        );
                        clearTimeout(tzTimeout);
                        
                        if (tzResponse.ok) {
                          const tzData = await tzResponse.json();
                          if (tzData && typeof tzData.utc_offset_seconds === 'number') {
                            timezone = tzData.utc_offset_seconds / 3600;
                            // Validate timezone range
                            if (isNaN(timezone) || timezone < -12 || timezone > 14) {
                              timezone = Math.round((longitude / 15) * 2) / 2;
                            }
                          }
                        }
                    } catch (tzError) {
                        // Calculate from longitude as fallback
                        timezone = Math.round((longitude / 15) * 2) / 2;
                    }
                }
            } catch (openMeteoError) {
                console.warn("Open-Meteo geocoding failed:", openMeteoError);
            }
            
            // Fallback: Try Google Geocoding if available and Open-Meteo failed
            if (!locationName) {
                const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
                if (GOOGLE_API_KEY) {
                    try {
                        const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=${language === 'hi' ? 'hi' : 'en'}`);
                        const googleData = await googleResponse.json();
                        
                        if (googleData.status === 'OK' && googleData.results && googleData.results.length > 0) {
                            locationName = googleData.results[0].formatted_address;
                            // Get timezone from Google
                            try {
                                const timestamp = Math.floor(Date.now() / 1000);
                                const tzResponse = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`);
                                const tzData = await tzResponse.json();
                                if (tzData.status === 'OK' && tzData.rawOffset !== undefined) {
                                    timezone = tzData.rawOffset / 3600;
                                }
                            } catch (tzError) {
                                timezone = Math.round((longitude / 15) * 2) / 2;
                            }
                        }
                    } catch (googleError) {
                        console.warn("Google geocoding failed:", googleError);
                    }
                }
            }
            
            // Final fallback: Use coordinates if no name found
            if (!locationName) {
                locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                timezone = Math.round((longitude / 15) * 2) / 2;
            }
            
            setFormData(prev => ({
                ...prev,
                location: locationName,
                lat: latitude,
                lon: longitude,
                tzone: timezone.toString()
            }));
        } catch (error) {
            console.error("Reverse geocoding failed", error);
            // Still set lat/lon even if name lookup fails
            const fallbackTimezone = Math.round((longitude / 15) * 2) / 2;
            setFormData(prev => ({
                ...prev,
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                lat: latitude,
                lon: longitude,
                tzone: fallbackTimezone.toString()
            }));
        } finally {
            setIsDetecting(false);
        }
    }, (error) => {
        console.error("Geolocation error", error);
        let errorMessage = language === 'hi' 
          ? "आपका स्थान प्राप्त करने में असमर्थ।" 
          : "Unable to retrieve your location.";
        
        // Provide specific error messages
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = language === 'hi' 
            ? "स्थान की अनुमति अस्वीकार की गई। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।"
            : "Location permission denied. Please enable location access in browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = language === 'hi' 
            ? "स्थान जानकारी उपलब्ध नहीं है।"
            : "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = language === 'hi' 
            ? "स्थान अनुरोध समय सीमा से अधिक हो गया।"
            : "Location request timed out.";
        }
        
        alert(errorMessage);
        setIsDetecting(false);
    }, { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 60000 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.date || !formData.time || !formData.location?.trim()) {
      alert(language === 'hi' ? "कृपया सभी आवश्यक फ़ील्ड भरें" : "Please fill in all required fields");
      return;
    }
    if (!isValidTime(formData.time)) {
      setTimeError(language === 'hi' ? 'समय HH:MM प्रारूप में होना चाहिए' : 'Time must be in HH:MM format');
      return;
    }
    if (!formData.lat && !isValidLocationFormat(formData.location)) {
      setLocationError(t.locationFormatError || (language === 'hi' ? 'शहर, देश प्रारूप प्रयोग करें' : 'Use City, Country format'));
      return;
    }
    const dateObj = new Date(formData.date);
    if (isNaN(dateObj.getTime())) {
      alert(language === 'hi' ? "कृपया मान्य जन्म तिथि दर्ज करें" : "Please enter a valid date of birth");
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) {
      alert(language === 'hi' ? "जन्म तिथि भविष्य में नहीं हो सकती" : "Date of birth cannot be in the future");
      return;
    }
    saveToCache(formData);
    clearKundaliDraft();
    if (isLoading) return;
    let dataToSubmit = formData;
    if (!formData.lat || !formData.lon) {
      try {
        console.log("Geocoding location before submission:", formData.location);
        const geocodedData = await geocodeSelectedLocation(formData.location);
        if (geocodedData) {
          dataToSubmit = geocodedData;
          console.log("Geocoding successful, coordinates:", geocodedData.lat, geocodedData.lon);
        } else {
          console.warn("Geocoding failed, submitting without coordinates - backend will handle it");
        }
      } catch (error) {
        console.error("Failed to geocode location:", error);
        // Still submit even if geocoding fails - backend can handle it
      }
    } else {
      console.log("Using existing coordinates:", formData.lat, formData.lon);
    }
    
    console.log("Submitting kundali form with data:", {
      name: dataToSubmit.name,
      location: dataToSubmit.location,
      lat: dataToSubmit.lat,
      lon: dataToSubmit.lon,
      date: dataToSubmit.date,
      time: dataToSubmit.time
    });
    
    onSubmit(dataToSubmit, { saveToProfile, consentToShare });
  };

  const filteredCities = COMMON_CITIES.filter(city => 
    city.toLowerCase().includes(formData.location.toLowerCase()) && 
    formData.location.length > 0 && 
    city !== formData.location
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-fade-in flex flex-col md:flex-row gap-8 items-stretch">
      
      {/* Saved Charts Section - Only visible if there are charts */}
      {savedCharts.length > 0 && (
          <div className="w-full md:w-1/3 space-y-4 shrink-0">
              <h3 className="text-xl font-serif text-amber-200 pl-2">Saved Profiles</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedCharts.map((chart) => (
                      <div key={chart.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-amber-500/50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h4 className="font-bold text-slate-200">{t.vedicHoroscopeFor} {chart.name}</h4>
                                  <p className="text-xs text-slate-500">{chart.date} • {chart.location}</p>
                              </div>
                              <button 
                                onClick={() => onDeleteChart && chart.id && onDeleteChart(chart.id)}
                                className="text-slate-600 hover:text-red-400 p-1"
                              >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                          </div>
                          <div className="flex gap-2 mt-3">
                              <button 
                                onClick={() => onLoadChart && onLoadChart(chart)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded text-slate-200 transition-colors"
                              >
                                  View Chart
                              </button>
                              <button 
                                onClick={() => onGetDaily && onGetDaily(chart)}
                                className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 text-xs py-2 rounded transition-colors"
                              >
                                  Daily Forecast
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main Form */}
      <div className={`w-full min-w-0 ${savedCharts.length > 0 ? 'md:w-2/3' : 'md:w-full max-w-xl md:mx-auto'}`}>
        <div className="bg-slate-800/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Loading overlay to prevent perceived freeze */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl" aria-live="polite">
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-12 h-12 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-amber-200 font-medium">{t.loadingButton}</p>
                </div>
              </div>
            )}
            {/* Background Mandala Effect */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif text-amber-100 mb-2">{t.formTitle}</h2>
              <p className="text-slate-400 text-sm">{t.formSubtitle}</p>
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                <p className="text-emerald-200/90 text-xs sm:text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5" aria-hidden="true">💡</span>
                  <span>{t.saveDetailsHint || (language === 'hi' ? 'आपकी जानकारी स्वतः सहेजी जाती है। प्रोफ़ाइल में सेव करें—दोबारा लिखने की ज़रूरत नहीं।' : 'Your details are auto-saved. Save to profile to use across Kundali, Compatibility & more.')}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2 relative">
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 font-bold">{t.fullName}</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                    handleChange(e);
                    getNameSuggestions(e.target.value);
                }}
                onFocus={() => {
                    if (formData.name.length >= 1) {
                        getNameSuggestions(formData.name);
                    }
                }}
                onBlur={() => {
                    saveDraftOnBlur();
                    setTimeout(() => setShowNameSuggestions(false), 200);
                }}
                placeholder={language === 'hi' ? "उदाहरण: अदिति राव" : "e.g. Aditi Rao"}
                className="w-full min-h-[48px] bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                required
                />
                {/* Name Suggestions Dropdown */}
                {showNameSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-amber-500/30 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        {nameSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, name: suggestion }));
                                    setShowNameSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-amber-500/20 transition-colors border-b border-slate-700/50 last:border-b-0"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 font-bold">
                  {language === 'hi' ? 'लिंग' : 'Gender'}
                </label>
                <div className="flex gap-3 flex-wrap">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={() => setFormData(prev => ({ ...prev, gender: g }))}
                        className="w-4 h-4 rounded-full border-amber-500/50 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-slate-300 text-sm group-hover:text-amber-200 transition-colors">
                        {language === 'hi'
                          ? g === 'male' ? 'पुरुष' : g === 'female' ? 'महिला' : 'अन्य'
                          : g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                      </span>
                    </label>
                  ))}
                </div>
            </div>

            {/* Date of Birth - calendar with presets */}
            <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 font-bold">{t.dob} / {t.tob}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {getDatePresets().map(({ key, value }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setFormData(prev => ({ ...prev, date: value })); saveDraftOnBlur(); }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/80 hover:bg-amber-500/20 border border-slate-600 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 transition-all"
                    >
                      {key === 'today' ? t.datePresetToday : key === '1yr' ? t.datePreset1yr : key === '5yr' ? t.datePreset5yr : key === '10yr' ? t.datePreset10yr : t.datePreset20yr}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        onBlur={saveDraftOnBlur}
                        placeholder={t.dobPlaceholder || (language === 'hi' ? 'जन्म तिथि (वर्ष-महीना-दिन)' : 'Date of birth (YYYY-MM-DD)')}
                        className="w-full min-h-[48px] bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all [color-scheme:dark] cursor-pointer"
                        required
                    />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          onBlur={saveDraftOnBlur}
                          step="1"
                          className={`flex-1 min-h-[48px] bg-slate-900/50 border rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all [color-scheme:dark] ${timeError ? 'border-red-500/50' : 'border-slate-600'}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setUse24Hour(!use24Hour)}
                          className="min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg bg-slate-700/80 border border-slate-600 text-xs text-slate-400 hover:text-amber-200 transition-all"
                          title={language === 'hi' ? '12/24 घंटे प्रारूप' : '12/24 hour format'}
                        >
                          {use24Hour ? '24h' : '12h'}
                        </button>
                      </div>
                      {timeError && <p className="text-xs text-red-400">{timeError}</p>}
                    </div>
                </div>
                <p className="text-xs text-slate-500 -mt-2">{t.dobPlaceholder || (language === 'hi' ? 'जन्म तिथि (वर्ष-महीना-दिन)' : 'Date of birth (YYYY-MM-DD)')}</p>
            </div>
            
         

            <div className="space-y-2 relative">
                <label className="block text-xs uppercase tracking-wider text-amber-500/80 font-bold flex justify-between items-center gap-2">
                    <span>{t.pob}</span>
                    {formData.lat && <span className="text-emerald-400 text-[10px] bg-emerald-900/30 px-2 rounded-full border border-emerald-500/30 shrink-0">GPS Active</span>}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onFocus={() => {
                            setLocationError(null);
                            if (formData.location.length >= 1) {
                                setShowSuggestions(true);
                                geocodeLocation(formData.location);
                            }
                        }}
                        onBlur={() => {
                            saveDraftOnBlur();
                            if (formData.location.trim() && !isValidLocationFormat(formData.location) && !formData.lat) {
                                setLocationError(t.locationFormatError || (language === 'hi' ? 'शहर, देश प्रारूप प्रयोग करें' : 'Use City, Country format'));
                            }
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder={t.pobPlaceholder}
                        className={`w-full min-h-[48px] bg-slate-900/50 border rounded-lg px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${locationError ? 'border-red-500/50' : formData.lat ? 'border-emerald-500/50' : 'border-slate-600'}`}
                        autoComplete="off"
                        required
                    />
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors touch-manipulation"
                        title="Detect precise location"
                        disabled={isDetecting}
                        aria-label={language === 'hi' ? 'स्थान पता करें' : 'Detect location'}
                    >
                        {isDetecting ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className={`text-xs mt-1.5 ${locationError ? 'text-red-400' : 'text-amber-500/70'}`}>
                  {locationError || t.locationOrEnterHint || (language === 'hi' ? 'सूची से चुनें या कोई भी शहर, देश टाइप करें (शहर, देश)' : 'Pick from list or type City, Country')}
                </p>
                {(showSuggestions && (locationSuggestions.length > 0 || filteredCities.length > 0 || isGeocoding || formData.location.trim().length >= 2)) && (
                <ul className="absolute z-50 w-full bg-slate-800/95 backdrop-blur-sm border border-amber-500/30 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-2xl animate-fade-in">
                    {isGeocoding && locationSuggestions.length === 0 && filteredCities.length === 0 && (
                        <li className="px-4 py-3 text-center text-slate-400 text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Searching locations...</span>
                            </div>
                        </li>
                    )}
                    {formData.location.trim().length >= 2 && ![...locationSuggestions, ...filteredCities].some(c => c.trim().toLowerCase() === formData.location.trim().toLowerCase()) && (
                        <li
                            onClick={() => { selectCity(formData.location.trim()); setShowSuggestions(false); }}
                            className="px-4 py-3 hover:bg-amber-500/10 cursor-pointer text-sm border-b border-slate-700/50 flex items-center gap-3 group bg-amber-500/5"
                        >
                            <span className="text-amber-400 font-medium">✓</span>
                            <span className="text-slate-200">{language === 'hi' ? "इसी के रूप में उपयोग करें" : "Use as entered"}: <span className="text-amber-200 font-semibold truncate">{formData.location.trim()}</span></span>
                        </li>
                    )}
                    {(locationSuggestions.length > 0 ? locationSuggestions : filteredCities).map((city, idx) => {
                      // Parse the address to show city prominently with state and country
                      const parts = city.split(', ');
                      const mainCity = parts[0];
                      const locationDetails = parts.slice(1).join(', ');
                      
                      return (
                        <li 
                            key={idx} 
                            onClick={() => selectCity(city)}
                            className="px-4 py-3 hover:bg-amber-500/10 cursor-pointer text-slate-200 text-sm border-b border-slate-700/50 last:border-b-0 transition-colors flex items-start gap-3 group"
                        >
                            <svg className="w-4 h-4 text-amber-500/60 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
                                    {mainCity}
                                </div>
                                {locationDetails && (
                                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                                        {locationDetails}
                                    </div>
                                )}
                            </div>
                        </li>
                      );
                    })}
                </ul>
                )}
            </div>

            <label className="flex items-center gap-3 mt-6 cursor-pointer group p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="w-5 h-5 rounded border-amber-500/50 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
              />
              <div>
                <span className="text-slate-200 text-sm font-medium group-hover:text-amber-200 transition-colors block">
                  {language === 'hi' ? 'मेरे प्रोफ़ाइल में सेव करें' : 'Save to my profile'}
                </span>
                <span className="text-slate-500 text-xs mt-0.5 block">
                  {t.saveDetailsHintShort || (language === 'hi' ? 'एक बार सेव करें, हर जगह उपयोग करें।' : 'Save once, use everywhere.')}
                </span>
              </div>
            </label>
            {saveToProfile && (
              <label className="flex items-center gap-3 mt-3 cursor-pointer group p-4 rounded-xl bg-slate-800/40 border border-slate-600/50 hover:border-slate-500/60 transition-colors">
                <input
                  type="checkbox"
                  checked={consentToShare}
                  onChange={(e) => setConsentToShare(e.target.checked)}
                  className="w-5 h-5 rounded border-amber-500/50 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
                />
                <div>
                  <span className="text-slate-300 text-sm font-medium group-hover:text-slate-200 transition-colors block">
                    {language === 'hi' ? 'मैं अपनी जानकारी साझा करने के लिए सहमत हूं' : 'I consent to save my details to our records'}
                  </span>
                  <span className="text-slate-500 text-xs mt-0.5 block">
                    {language === 'hi' ? 'आपकी जानकारी सुरक्षित रूप से सहेजी जाएगी।' : 'Your details will be saved securely.'}
                  </span>
                </div>
              </label>
            )}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
                {isLoading ? t.loadingButton : t.submitButton}
            </button>
            </form>
        </div>
      </div>
      <AdBanner variant="display" className="mt-8 w-full max-w-xl" />
    </div>
  );
};

export default KundaliForm;