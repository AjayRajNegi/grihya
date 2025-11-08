import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImagesInput from '../components/forms/ImagesInput';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import LocationAutocomplete, { PickedPlace } from '../components/common/LocationAutocomplete';

// Leaflet marker icon fix for Vite (prevents broken default marker icons)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://backend.easylease.services/api';

const ListProperty: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: string;
    for: string;
    price: string;
    location: string;
    bedrooms: string;
    bathrooms: string;
    area: string;
    furnishing: string;
    amenities: string[];
    existingImages?: string[];
    // NEW
    immediatelyAvailable: '' | 'yes' | 'no';
    availableFromDate: string; // YYYY-MM-DD
    readyToMove: '' | 'yes' | 'no';
    possessionDate: string; // YYYY-MM-DD
    preferredTenants: '' | 'family' | 'bachelor' | 'both';
  }>({
    title: '',
    description: '',
    type: '',
    for: 'rent',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    furnishing: '',
    amenities: [],
    existingImages: [],
    // New defaults
    immediatelyAvailable: '',
    availableFromDate: '',
    readyToMove: '',
    possessionDate: '',
    preferredTenants: 'both',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const locInputRef = useRef<HTMLInputElement | null>(null);

  // Map picker
  const [mapOpen, setMapOpen] = useState(false);

  // Preferred Tenants visible only for PG/Flat/House + Rent
  const showPreferredTenants =
    (formData.type === 'pg' || formData.type === 'flat' || formData.type === 'house') &&
    formData.for === 'rent';

  // Google Places selection
  const [pickedPlace, setPickedPlace] = useState<PickedPlace | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null); // bias suggestions

  // Prevent page scroll when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
    document.body.style.overflow = '';
    return () => { };
  }, [isAuthenticated]);

  // Get user coords to bias autocomplete
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Load property details when editing
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchProperty = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setSubmitError('Your session has expired. Please sign in again.');
          navigate(`/account?show=login&redirect=${encodeURIComponent(location.pathname + location.search)}`);
          return;
        }

        const res = await fetch(`${API_URL}/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          if (res.status === 401) {
            setSubmitError('Your session has expired. Please sign in again.');
            navigate(`/account?show=login&redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
          }
          setLoadError(errorData?.message || 'Unable to load property details.');
          return;
        }

        const data = await res.json();

        // Map boolean-ish values to yes/no for UI
        const toYesNo = (v: any): '' | 'yes' | 'no' => {
          if (typeof v === 'undefined' || v === null || v === '') return '';
          const s = String(v).toLowerCase();
          return (v === true || v === 1 || s === '1' || s === 'true' || s === 'yes') ? 'yes' : 'no';
        };

        setFormData({
          title: data.title || '',
          description: data.description || '',
          type: data.type || '',
          for: data.for || 'rent',
          price: data.price ? String(data.price) : '',
          location: data.display_label || data.location || '',
          bedrooms: data.bedrooms ? String(data.bedrooms) : '',
          bathrooms: data.bathrooms ? String(data.bathrooms) : '',
          area: data.area ? String(data.area) : '',
          furnishing: data.furnishing || '',
          amenities: data.amenities || [],
          existingImages: Array.isArray(data.images) ? data.images : [],

          // New
          immediatelyAvailable: toYesNo(data.available_immediately),
          availableFromDate: data.available_from_date || '',
          readyToMove: toYesNo(data.ready_to_move),
          possessionDate: data.possession_date || '',
          preferredTenants: data.preferred_tenants || 'both',
        });
        setImageFiles([]);

        // Hydrate pickedPlace if present
        if ((data.lat && data.lng) || data.display_label || data.formatted_address) {
          const comps = data.location_components || {};
          setPickedPlace({
            label: data.display_label || data.location || '',
            formatted: data.formatted_address || data.location || '',
            lat: Number(data.lat ?? 0),
            lng: Number(data.lng ?? 0),
            postalCode: comps?.postalCode || undefined,
            city: comps?.locality || undefined,
            area: comps?.sublocality || undefined,
            placeId: data.place_id || '',
            route: comps?.route || undefined,
            sublocality: comps?.sublocality || undefined,
            locality: comps?.locality || undefined,
            admin1: comps?.admin1 || undefined,
            admin2: comps?.admin2 || undefined,
          });
        }
      } catch (err: any) {
        setLoadError(err.message || 'Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, isAuthenticated, navigate, location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'for') {
      // Clear the other mode's fields when switching between rent/sale
      if (value === 'rent') {
        setFormData((prev) => ({
          ...prev,
          for: 'rent',
          readyToMove: '',
          possessionDate: '',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          for: 'sale',
          immediatelyAvailable: '',
          availableFromDate: '',
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Please enter a property title.';
    if (!formData.description.trim()) newErrors.description = 'Please enter a description.';
    if (!formData.type) newErrors.type = 'Please select a property type.';
    if (!formData.for) newErrors.for = 'Please select whether the property is for rent or sale.';
    if (!formData.price) newErrors.price = 'Please enter a price.';
    else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number.';
    }
    if (formData.for === 'rent' && !formData.immediatelyAvailable) {
      newErrors.immediatelyAvailable = 'Please choose Yes or No.';
    }
    if (formData.for === 'sale' && !formData.readyToMove) {
      newErrors.readyToMove = 'Please choose Yes or No.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Please enter a location.';
    }
    if (formData.bedrooms && (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0)) {
      newErrors.bedrooms = 'Bedrooms must be a positive number.';
    }
    if (formData.bathrooms && (isNaN(Number(formData.bathrooms)) || Number(formData.bathrooms) < 0)) {
      newErrors.bathrooms = 'Bathrooms must be a positive number.';
    }
    if (formData.area && (isNaN(Number(formData.area)) || Number(formData.area) < 0)) {
      newErrors.area = 'Area must be a positive number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (files: File[], existingImages: string[], error?: string) => {
    setImageError(error || '');
    setImageFiles(files);
    setFormData((prev) => ({ ...prev, existingImages }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setImageError('');

    if (!isAuthenticated) {
      const currentUrl = location.pathname + location.search;
      navigate(`/account?show=login&redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (!validateForm()) return;

    const maxSizeMB = 15;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif',
      'image/heic', 'image/heif', 'image/gif', 'image/bmp', 'image/tiff',
    ];

    for (const file of imageFiles) {
      if (file.size > maxSizeBytes) {
        setImageError(`Each image must be smaller than ${maxSizeMB} MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        setImageError('Images must be in JPEG, PNG, WEBP, AVIF, HEIC, GIF, BMP, or TIFF format.');
        return;
      }
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setSubmitError('Your session has expired. Please sign in again.');
      navigate(`/account?show=login&redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    try {
      setSubmitting(true);

      const form = new FormData();
      // Required
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());
      form.append('type', formData.type);
      form.append('for', formData.for);
      form.append('price', formData.price.trim());
      form.append('location', formData.location.trim());

      // Optional
      if (formData.bedrooms.trim()) form.append('bedrooms', String(Number(formData.bedrooms.trim())));
      if (formData.bathrooms.trim()) form.append('bathrooms', String(Number(formData.bathrooms.trim())));
      if (formData.area.trim()) form.append('area', String(Number(formData.area.trim())));
      if (formData.furnishing) form.append('furnishing', formData.furnishing);

      // Amenities
      (formData.amenities || []).forEach((amenity, index) => {
        form.append(`amenities[${index}]`, amenity);
      });

      // Existing images
      (formData.existingImages || []).forEach((url, index) => {
        form.append(`existingImages[${index}]`, url);
      });

      // New image files
      imageFiles.forEach((file, index) => {
        form.append(`images[${index}]`, file);
      });

      // Availability / Readiness
      if (formData.for === 'rent') {
        if (formData.immediatelyAvailable) {
          form.append('available_immediately', formData.immediatelyAvailable === 'yes' ? '1' : '0');
        }
        if (formData.immediatelyAvailable === 'no' && formData.availableFromDate) {
          form.append('available_from_date', formData.availableFromDate); // YYYY-MM-DD
        }
      }
      if (formData.for === 'sale') {
        if (formData.readyToMove) {
          form.append('ready_to_move', formData.readyToMove === 'yes' ? '1' : '0');
        }
        if (formData.readyToMove === 'no' && formData.possessionDate) {
          form.append('possession_date', formData.possessionDate); // YYYY-MM-DD
        }
      }
      if (formData.preferredTenants) {
        form.append('preferred_tenants', formData.preferredTenants);
      }

      // Canonical geo fields — send each field once; only lat+lng together
      const label = pickedPlace?.label || formData.location.trim();
      if (label) form.append('display_label', label);
      if (pickedPlace?.placeId) form.append('place_id', pickedPlace.placeId);

      if (
        typeof pickedPlace?.lat === 'number' &&
        typeof pickedPlace?.lng === 'number' &&
        !Number.isNaN(pickedPlace.lat) &&
        !Number.isNaN(pickedPlace.lng)
      ) {
        form.append('lat', String(pickedPlace.lat));
        form.append('lng', String(pickedPlace.lng));
      }

      if (pickedPlace?.postalCode) form.append('postal_code', pickedPlace.postalCode);
      if (pickedPlace?.city) form.append('city', pickedPlace.city);
      if (pickedPlace?.formatted) form.append('formatted_address', pickedPlace.formatted);

      if (pickedPlace) {
        const components = {
          route: pickedPlace.route || '',
          sublocality: pickedPlace.sublocality || '',
          locality: pickedPlace.locality || pickedPlace.city || '',
          admin1: pickedPlace.admin1 || '',
          admin2: pickedPlace.admin2 || '',
          postalCode: pickedPlace.postalCode || '',
        };
        form.append('location_components', JSON.stringify(components));
      }

      const url = isEditing ? `${API_URL}/properties/${id}` : `${API_URL}/properties`;
      const method = 'POST';
      if (isEditing) form.append('_method', 'PUT');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const raw = await res.clone().text();
        const data = (() => { try { return JSON.parse(raw); } catch { return null; } })();

        if (res.status === 401) {
          setSubmitError('Your session has expired. Please sign in again.');
          navigate(`/account?show=login&redirect=${encodeURIComponent(location.pathname + location.search)}`);
          return;
        }
        if (res.status === 403) {
          setSubmitError('Only owners or brokers can list properties.');
          return;
        }
        if (res.status === 429) {
          setSubmitError('You’ve tried too many times. Please wait a minute and try again.');
          return;
        }
        if (res.status === 422 && data?.errors) {
          const serverErrors = data.errors as Record<string, string[]>;
          const nextErrors: Record<string, string> = {};
          let nextImageError = '';

          const mapToLocation = new Set([
            'lat', 'lng', 'display_label', 'formatted_address', 'place_id',
            'location_components', 'postal_code', 'city'
          ]);

          const fieldMap: Record<string, string> = {
            available_immediately: 'immediatelyAvailable',
            available_from_date: 'availableFromDate',
            ready_to_move: 'readyToMove',
            possession_date: 'possessionDate',
            preferred_tenants: 'preferredTenants',
          };

          Object.entries(serverErrors).forEach(([key, msgs]) => {
            const msg = msgs?.[0] || 'Invalid value.';
            if (key.startsWith('images')) {
              nextImageError = nextImageError || msg;
            } else if (mapToLocation.has(key)) {
              nextErrors.location = nextErrors.location || msg;
            } else if (fieldMap[key]) {
              nextErrors[fieldMap[key]] = msg;
            } else {
              nextErrors[key] = msg;
            }
          });

          setErrors(nextErrors);
          setImageError(nextImageError);
          const hasFieldErrors = Object.keys(nextErrors).length > 0 || !!nextImageError;
          setSubmitError(hasFieldErrors ? '' : (data?.message || 'Please check your inputs.'));
          return;
        }

        setSubmitError(data?.message || `Unable to ${isEditing ? 'update' : 'submit'} your property.`);
        return;
      }

      await res.json().catch(() => null);
      setFormSubmitted(true);
      setTimeout(() => navigate('/account'), 1500);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setSubmitError('The request took too long. Please check your connection and try again.');
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setSubmitError('Unable to connect to the server. Please check your internet and try again.');
      } else {
        setSubmitError(err.message || `Unable to ${isEditing ? 'update' : 'submit'} your property. Please try again.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || loading;
  const currentUrl = location.pathname + location.search;

  if (formSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Property Updated Successfully!' : 'Property Listed Successfully!'}
          </h2>
          <p className="text-gray-600 mb-6">Your property has been submitted for review.</p>
          <p className="text-gray-600">You will be redirected shortly…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
              title="Back"
            >
              <span className="text-2xl md:text-3xl font-extrabold leading-none">
                <img src="/less_than_icon.png" alt="Back-Icon" />
              </span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Property' : 'List Your Property'}
            </h1>
          </div>

          {loadError && (
            <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              {loadError}
            </div>
          )}
          {submitError && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}
          {imageError && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {imageError}
            </div>
          )}

          <div className={`bg-white rounded-lg shadow-md p-6 md:p-8 ${isBusy ? 'opacity-95' : ''}`}>
            {loading && <p className="text-gray-600 mb-4">Loading property details...</p>}

            <form onSubmit={handleSubmit} aria-busy={isBusy}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Property Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        disabled={isBusy}
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                        placeholder="e.g. Spacious 2BHK Apartment in Koramangala"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        disabled={isBusy}
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                        placeholder="Describe your property, key features, nearby facilities, etc."
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Property Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          disabled={isBusy}
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                        >
                          <option value="">Select Type</option>
                          <option value="pg">PG Accommodation</option>
                          <option value="flat">Apartment/Flat</option>
                          <option value="house">Independent House/Villa</option>
                          <option value="commercial">Commercial Property</option>
                          <option value="land">Plot/Land</option>
                        </select>
                        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Listing For <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              disabled={isBusy}
                              type="radio"
                              name="for"
                              value="rent"
                              checked={formData.for === 'rent'}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">Rent</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              disabled={isBusy}
                              type="radio"
                              name="for"
                              value="sale"
                              checked={formData.for === 'sale'}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">Sale</span>
                          </label>
                        </div>
                        {errors.for && <p className="mt-1 text-sm text-red-600">{errors.for}</p>}
                      </div>
                    </div>

                    {/* Availability/Readiness + Preferred Tenants */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Rent: Immediately available? */}
                      {formData.for === 'rent' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Immediately available? <span className="text-red-500">*</span>
                          </label>
                          <select
                            disabled={isBusy}
                            name="immediatelyAvailable"
                            value={formData.immediatelyAvailable}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.immediatelyAvailable ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                          >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                          {errors.immediatelyAvailable && <p className="mt-1 text-sm text-red-600">{errors.immediatelyAvailable}</p>}

                          {formData.immediatelyAvailable === 'no' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available from (optional)
                              </label>
                              <input
                                disabled={isBusy}
                                type="date"
                                name="availableFromDate"
                                value={formData.availableFromDate}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${errors.availableFromDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                              />
                              {errors.availableFromDate && <p className="mt-1 text-sm text-red-600">{errors.availableFromDate}</p>}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Sale: Ready to move?
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ready to move?
                          </label>
                          <select
                            disabled={isBusy}
                            name="readyToMove"
                            value={formData.readyToMove}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.readyToMove ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                          >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                          {errors.readyToMove && <p className="mt-1 text-sm text-red-600">{errors.readyToMove}</p>}

                          {formData.readyToMove === 'no' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Possession from (optional)
                              </label>
                              <input
                                disabled={isBusy}
                                type="date"
                                name="possessionDate"
                                value={formData.possessionDate}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${errors.possessionDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                              />
                              {errors.possessionDate && <p className="mt-1 text-sm text-red-600">{errors.possessionDate}</p>}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Preferred Tenants (only for PG/Flat/House + Rent) */}
                      {showPreferredTenants && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred tenants
                          </label>
                          <select
                            disabled={isBusy}
                            name="preferredTenants"
                            value={formData.preferredTenants}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.preferredTenants ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                          >
                            <option value="family">Family</option>
                            <option value="bachelor">Bachelor</option>
                            <option value="both">Both (Family and Bachelor)</option>
                          </select>
                          {errors.preferredTenants && <p className="mt-1 text-sm text-red-600">{errors.preferredTenants}</p>}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          disabled={isBusy}
                          type="number"
                          step="1"
                          min="0"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                          placeholder={formData.for === 'rent' ? 'Monthly rent amount' : 'Selling price'}
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                      </div>

                      {/* Location with Autocomplete + Map Button */}
                      <div className="relative">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <LocationAutocomplete
                            value={formData.location}
                            onChange={(v) => {
                              setFormData((prev) => ({ ...prev, location: v }));
                              setPickedPlace(null);
                              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                            }}
                            onPick={(place) => {
                              setFormData((prev) => ({ ...prev, location: place.label }));
                              setPickedPlace(place);
                              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                            }}
                            initialCoords={coords}
                            country="IN"
                            disabled={isBusy}
                            error={errors.location}
                            placeholder="Search address or place"
                          />

                          {/* Location icon button to open map picker */}
                          <button
                            type="button"
                            onClick={() => setMapOpen(true)}
                            title="Pick on map"
                            className="absolute right-2 pt-1 md:top-2 rounded bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2AB09C]"
                            aria-label="Pick location on map"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2AB09C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Type an address or use the map picker to pin the exact location
                          {pickedPlace?.postalCode ? ` · PIN ${pickedPlace.postalCode}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                      <input
                        disabled={isBusy}
                        type="number"
                        min="0"
                        id="bedrooms"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.bedrooms ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                      />
                      {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>}
                    </div>
                    <div>
                      <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                      <input
                        disabled={isBusy}
                        type="number"
                        min="0"
                        id="bathrooms"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                      />
                      {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>}
                    </div>
                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Area (sq.ft)</label>
                      <input
                        disabled={isBusy}
                        type="number"
                        min="0"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.area ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`}
                      />
                      {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="furnishing" className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                    <select
                      disabled={isBusy}
                      id="furnishing"
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]"
                    >
                      <option value="">Select Furnishing</option>
                      <option value="furnished">Fully Furnished</option>
                      <option value="semifurnished">Semi-Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {['WiFi', 'Parking', 'Lift', 'TV', 'AC', 'Gym', 'Swimming Pool', 'Laundry', 'Security', 'Cafeteria', 'Kitchen', 'Geyser', 'Fridge', 'RO'].map((amenity) => (
                      <label key={amenity} className="inline-flex items-center">
                        <input
                          disabled={isBusy}
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => {
                            setFormData((prev) => {
                              const amenities = [...prev.amenities];
                              if (amenities.includes(amenity)) return { ...prev, amenities: amenities.filter((a) => a !== amenity) };
                              return { ...prev, amenities: [...amenities, amenity] };
                            });
                            if (errors.amenities) setErrors((prev) => ({ ...prev, amenities: '' }));
                            if (submitError) setSubmitError('');
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="ml-2 text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                  {errors.amenities && <p className="mt-1 text-sm text-red-600">{errors.amenities}</p>}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Images (max 15 MB each)
                  </h2>
                  <ImagesInput
                    files={imageFiles}
                    existingImages={formData.existingImages}
                    onChange={(files, existing, err) => {
                      setImageError(err || '');
                      setImageFiles(files);
                      setFormData((prev) => ({ ...prev, existingImages: existing }));
                      if (submitError) setSubmitError('');
                    }}
                    maxSizeMB={15}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Note: Some image formats (e.g., HEIC, TIFF) may not show previews but are still valid for upload.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/account')}
                    className="px-6 py-3 rounded-md border text-gray-700 hover:bg-gray-50"
                    disabled={isBusy}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`text-white px-6 py-3 rounded-md font-medium ${submitting ? 'bg-[#2AB09C]/70 cursor-not-allowed' : 'bg-[#2AB09C] hover:bg-transparent hover:text-[#2AB09C]'} transition-colors focus:outline-none focus:ring-2 focus:ring-[#2AB09C] focus:ring-offset-2`}
                  >
                    {submitting ? 'Submitting…' : isEditing ? 'Update Property' : 'Submit Property'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Picker modal (right before auth-gate) */}
      <MapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialCenter={
          pickedPlace
            ? { lat: pickedPlace.lat, lng: pickedPlace.lng }
            : coords || { lat: 28.6139, lng: 77.2090 } // default New Delhi
        }
        initialPlace={pickedPlace}
        onSelect={(place) => {
          setPickedPlace(place);
          setFormData((prev) => ({
            ...prev,
            location: place.label || place.formatted || `${place.lat}, ${place.lng}`,
          }));
          setMapOpen(false);
          if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
        }}
      />

      {!isAuthenticated && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 id="auth-gate-title" className="text-lg font-semibold text-gray-900">
                Login or Sign up to {isEditing ? 'edit' : 'list'} your property
              </h3>
              <p className="mt-1 text-sm text-gray-600">You need to be logged in to continue.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/account?show=login&redirect=${encodeURIComponent(currentUrl)}`)}
                  className="inline-flex justify-center rounded-md bg-[#2AB09C] px-4 py-2.5 text-white hover:bg-[#229882] focus:outline-none focus:ring-2 focus:ring-[#2AB09C] focus:ring-offset-2"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/account?show=signup&redirect=${encodeURIComponent(currentUrl)}`)}
                  className="inline-flex justify-center rounded-md border border-[#2AB09C] px-4 py-2.5 text-[#2AB09C] hover:bg-[#E6F7F3] focus:outline-none focus:ring-2 focus:ring-[#2AB09C] focus:ring-offset-2"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24"
    viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

/* =========================
   Map Picker Modal + helpers
   ========================= */

type MapPickerModalProps = {
  open: boolean;
  onClose: () => void;
  initialCenter: { lat: number; lng: number };
  initialPlace: PickedPlace | null;
  onSelect: (place: PickedPlace) => void;
};

type NominatimResult = {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, any>;
};

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  open,
  onClose,
  initialCenter,
  initialPlace,
  onSelect,
}) => {
  const [center, setCenter] = useState<{ lat: number; lng: number }>(initialCenter);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialPlace ? { lat: initialPlace.lat, lng: initialPlace.lng } : null
  );
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>('');
  const [picked, setPicked] = useState<PickedPlace | null>(initialPlace || null);

  // Input value and suggestions
  const [query, setQuery] = useState<string>(initialPlace?.label || '');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // For outside-click to close dropdown
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setCenter(initialCenter);
      setMarker(initialPlace ? { lat: initialPlace.lat, lng: initialPlace.lng } : null);
      setPicked(initialPlace || null);
      setQuery(initialPlace?.label || '');
      setError('');
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }, [open, initialCenter, initialPlace]);

  // Debounced forward search for suggestions
  useEffect(() => {
    if (!open) return;

    const term = query.trim();
    if (term.length < 3) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        // Add &countrycodes=in to restrict to India
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(
          term
        )}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Search failed');
        const arr = (await res.json()) as NominatimResult[];
        setSuggestions(Array.isArray(arr) ? arr : []);
        setActiveIndex(arr?.length ? 0 : -1);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setSuggestions([]);
          setActiveIndex(-1);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [open, query]);

  // Keyboard nav for suggestions
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!suggestions.length) {
        if (e.key === 'Enter') {
          e.preventDefault();
          forwardGeocode(query); // fallback to explicit search
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const chosen = suggestions[activeIndex] || suggestions[0];
        if (chosen) chooseSuggestion(chosen);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, suggestions, activeIndex, query]);

  // Close suggestions on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const reverseGeocode = async (lat: number, lng: number): Promise<PickedPlace | null> => {
    try {
      setWorking(true);
      setError('');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!res.ok) throw new Error('Reverse geocoding failed');
      const j = await res.json();
      const addr = j?.address || {};
      const display = j?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      return {
        label: display,
        formatted: display,
        lat,
        lng,
        postalCode: addr.postcode || undefined,
        city: addr.city || addr.town || addr.village || addr.county || undefined,
        area: addr.suburb || addr.neighbourhood || addr.city_district || undefined,
        placeId: '',
        route: addr.road || undefined,
        sublocality: addr.suburb || addr.neighbourhood || addr.city_district || undefined,
        locality: addr.city || addr.town || addr.village || undefined,
        admin1: addr.state || undefined,
        admin2: addr.county || undefined,
      };
    } catch (e: any) {
      setError(e.message || 'Unable to fetch address for this location.');
      return null;
    } finally {
      setWorking(false);
    }
  };

  // Explicit search button action (if user presses Search)
  const forwardGeocode = async (q: string) => {
    const term = q?.trim();
    if (!term) {
      setError('Please type a location to search.');
      return;
    }
    try {
      setWorking(true);
      setError('');
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=in&q=${encodeURIComponent(
        term
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const arr = (await res.json()) as NominatimResult[];
      const hit = arr?.[0];
      if (!hit) {
        setError('No matching location found. Try another search.');
        return;
      }
      chooseSuggestion(hit);
    } catch (e: any) {
      setError(e.message || 'Unable to search this location.');
    } finally {
      setWorking(false);
    }
  };

  const chooseSuggestion = (s: NominatimResult) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const addr = s.address || {};
    const display = s.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    const place: PickedPlace = {
      label: display,
      formatted: display,
      lat,
      lng,
      postalCode: addr.postcode || undefined,
      city: addr.city || addr.town || addr.village || addr.county || undefined,
      area: addr.suburb || addr.neighbourhood || addr.city_district || undefined,
      placeId: '',
      route: addr.road || undefined,
      sublocality: addr.suburb || addr.neighbourhood || addr.city_district || undefined,
      locality: addr.city || addr.town || addr.village || undefined,
      admin1: addr.state || undefined,
      admin2: addr.county || undefined,
    };

    setPicked(place);
    setMarker({ lat, lng });
    setCenter({ lat, lng });
    setQuery(display);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const onMapClick = async (lat: number, lng: number) => {
    setMarker({ lat, lng });
    setCenter({ lat, lng });
    const place = await reverseGeocode(lat, lng);
    if (place) {
      setPicked(place);
      setQuery(place.label || '');
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const confirm = () => {
    if (picked) {
      onSelect(picked);
    } else if (marker) {
      onSelect({
        label: `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`,
        formatted: `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`,
        lat: marker.lat,
        lng: marker.lng,
        placeId: '',
      } as PickedPlace);
    } else {
      setError('Please pick a location on the map or search above.');
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl overflow-visible relative bottom-[6%]">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">Pick exact location</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Search row: autocomplete + our suggestions + search button */}
            <div className="grid grid-cols-[1fr,auto] gap-2">
              {/* High z-index so it sits above Leaflet controls */}
              <div className="relative z-[2000]" ref={inputWrapRef}>
                <LocationAutocomplete
                  value={query}
                  onChange={(v) => setQuery(v)}
                  onPick={(place) => {
                    setPicked(place);
                    setMarker({ lat: place.lat, lng: place.lng });
                    setCenter({ lat: place.lat, lng: place.lng });
                    setQuery(place.label || place.formatted || '');
                    setSuggestions([]);
                    setActiveIndex(-1);
                  }}
                  initialCoords={center}
                  country="IN"
                  disabled={working}
                  placeholder="Search address or place"
                />

                {/* Our suggestions dropdown (must be above Leaflet’s control z-index) */}
                {suggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 mt-1 max-h-64 overflow-auto rounded-md border bg-white shadow-lg z-[2100]">
                    {suggestions.map((s, idx) => {
                      const lat = parseFloat(s.lat);
                      const lng = parseFloat(s.lon);
                      const display = s.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                      const active = idx === activeIndex;
                      return (
                        <li
                          key={s.place_id || `${lat}-${lng}-${idx}`}
                          className={`cursor-pointer px-2 py-1.5 text-sm ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => chooseSuggestion(s)}
                          title={display}
                        >
                          {display}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={() => forwardGeocode(query)}
                disabled={working}
                className="px-3 rounded-md bg-[#2AB09C] text-white hover:bg-[#229882] disabled:opacity-60"
                title="Search"
              >
                Search
              </button>
            </div>

            <div className="rounded overflow-hidden border">
              <MapContainer
                center={[center.lat, center.lng]}
                zoom={15}
                style={{ height: 320, width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Ensure map sizes correctly after modal opens + re-center on changes */}
                <MapAutoResize center={center} />
                <MapClickCatcher onClick={(lat, lng) => onMapClick(lat, lng)} />
                {marker && <Marker position={[marker.lat, marker.lng]} />}
              </MapContainer>
            </div>

            {picked?.formatted && (
              <div className="text-sm text-gray-700">
                Selected: <span className="font-medium">{picked.formatted}</span>
              </div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          <div className="flex justify-end gap-2 border-t px-4 py-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={working}
              className="px-4 py-2 rounded-md bg-[#2AB09C] text-white hover:bg-[#229882] disabled:opacity-60"
            >
              Use this location
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const MapAutoResize: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    // Let the modal finish animating before recalculating size
    const t = setTimeout(() => {
      map.invalidateSize();
      map.setView([center.lat, center.lng], map.getZoom() ?? 15);
    }, 60);
    return () => clearTimeout(t);
  }, [map, center.lat, center.lng]);
  return null;
};

const MapClickCatcher: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default ListProperty;