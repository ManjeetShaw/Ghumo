/**
 * Foxico AI Travel Super-App - Centralized API Service
 *
 * Talks ONLY to the real backend (Backend_Codebase) under /api — there is no
 * bundled mock server or demo data on the frontend anymore. This file also
 * acts as the single translation layer between the backend's canonical
 * response shapes (nested provider-normalized objects, Mongoose documents)
 * and the flatter shapes the existing pages were built against, so page
 * components don't need to be rewritten one by one.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('foxico_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function generateIdempotencyKey() {
  return 'idemp-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now();
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    // Backend unreachable (not running / wrong VITE_API_URL / CORS). Surface
    // this clearly instead of silently falling back to fake data.
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: `Could not reach the backend at ${API_BASE_URL}${endpoint}. Is it running?`
      }
    };
  }

  const data = await response.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response' }
  }));

  // Backend errors come back as {success:false, error}; only throw for bodies we can't interpret.
  if (!response.ok && data.success === undefined && !data.error) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* Normalizers: backend canonical shape -> shape the UI expects        */
/* ------------------------------------------------------------------ */

function durationLabel(minutes) {
  if (minutes === undefined || minutes === null) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

// The backend's provider adapters only return a seat *count*, not a seat
// map. Real GDS/PSS seat maps are a whole feature the mock providers don't
// model yet, so we deterministically synthesize a plausible map from the
// available-seats count purely for the seat-picker UI. This is clearly
// synthetic, not vendor data — swap this out once a provider that returns
// real seat maps is wired in.
function seedHash(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

function synthesizeFlightSeatLayout(seatsAvailable, basePrice, seed) {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  const hash = seedHash(seed);
  const seats = [];
  let i = 0;
  for (let row = 1; row <= 6; row++) {
    for (const col of cols) {
      const pseudoRandom = ((hash + i * 17) % 100) / 100;
      const occupied = pseudoRandom > Math.min(0.9, (seatsAvailable || 9) / 24);
      seats.push({
        number: `${row}${col}`,
        status: occupied ? 'occupied' : 'available',
        price: basePrice
      });
      i++;
    }
  }
  return seats;
}

function synthesizeBerths(seatsAvailable, seed) {
  const types = ['Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'];
  const hash = seedHash(seed);
  const berths = [];
  for (let i = 0; i < 12; i++) {
    const pseudoRandom = ((hash + i * 23) % 100) / 100;
    const occupied = pseudoRandom > Math.min(0.9, (seatsAvailable || 20) / 40);
    berths.push({
      number: `${Math.floor(i / 3) + 1}${['A', 'B', 'C'][i % 3]}`,
      type: types[i % types.length],
      status: occupied ? 'occupied' : 'available'
    });
  }
  return berths;
}

function synthesizeBusSeats(seatsAvailable, fare, seed) {
  const types = ['Single Sleeper (Window)', 'Double Sleeper', 'Aisle Seater'];
  const hash = seedHash(seed);
  const seats = [];
  for (let i = 0; i < 10; i++) {
    const pseudoRandom = ((hash + i * 13) % 100) / 100;
    const occupied = pseudoRandom > Math.min(0.9, (seatsAvailable || 15) / 20);
    seats.push({
      seat: `${i % 2 === 0 ? 'L' : 'U'}${Math.floor(i / 2) + 1}`,
      type: types[i % types.length],
      status: occupied ? 'occupied' : 'available',
      price: fare
    });
  }
  return seats;
}

function normalizeFlight(f) {
  return {
    id: f.id,
    category: 'FLIGHT',
    providerId: f.providerId,
    airline: f.airline?.name,
    airlineCode: f.airline?.code,
    flightNumber: f.flightNumber,
    origin: f.origin?.code,
    originCity: f.origin?.city,
    originAirport: f.origin?.airport,
    destination: f.destination?.code,
    destinationCity: f.destination?.city,
    destinationAirport: f.destination?.airport,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    duration: durationLabel(f.durationMinutes),
    durationMinutes: f.durationMinutes,
    stops: f.stops,
    cabinClass: f.cabinClass,
    availableSeats: f.seatsAvailable,
    baggageAllowance: f.baggage ? `${f.baggage.checkin} check-in, ${f.baggage.cabin} cabin` : '',
    price: {
      baseFare: f.price?.base,
      tax: f.price?.taxes,
      total: f.price?.total,
      currency: f.price?.currency || 'INR'
    },
    seatLayout: synthesizeFlightSeatLayout(f.seatsAvailable, f.price?.total, f.id)
  };
}

function normalizeTrain(t) {
  return {
    id: t.id,
    category: 'TRAIN',
    providerId: t.providerId,
    trainNumber: t.trainNumber,
    trainName: t.trainName,
    origin: t.origin?.code,
    originCity: t.origin?.stationName,
    destination: t.destination?.code,
    destinationCity: t.destination?.stationName,
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    duration: durationLabel(t.durationMinutes),
    durationMinutes: t.durationMinutes,
    classes: (t.classes || []).map((c) => ({
      code: c.classCode,
      name: c.className,
      fare: c.fare,
      availableBerths: c.seatsAvailable,
      status: c.status
    })),
    berths: synthesizeBerths(t.classes?.[0]?.seatsAvailable, t.id)
  };
}

function normalizeBus(b) {
  return {
    id: b.id,
    category: 'BUS',
    providerId: b.providerId,
    operator: b.operatorName,
    busType: b.busType,
    origin: b.origin?.city,
    originCity: b.origin?.city,
    destination: b.destination?.city,
    destinationCity: b.destination?.city,
    departureTime: b.departureTime,
    arrivalTime: b.arrivalTime,
    duration: durationLabel(b.durationMinutes),
    durationMinutes: b.durationMinutes,
    rating: b.rating,
    fare: b.fare,
    seatsAvailable: b.seatsAvailable,
    boardingPoints: b.origin?.boardingPoint ? [b.origin.boardingPoint] : [],
    droppingPoints: b.destination?.dropoffPoint ? [b.destination.dropoffPoint] : [],
    seatMatrix: synthesizeBusSeats(b.seatsAvailable, b.fare, b.id)
  };
}

function normalizeHotel(h) {
  const cheapestRoom = (h.roomTypes || []).slice().sort((a, b) => a.farePerNight - b.farePerNight)[0];
  return {
    id: h.id,
    category: 'HOTEL',
    providerId: h.providerId,
    name: h.name,
    city: h.location?.city,
    country: h.location?.country,
    address: h.location?.address,
    starRating: Math.round(h.rating || 4),
    guestRating: h.rating,
    reviewsCount: h.reviewsCount,
    pricePerNight: cheapestRoom?.farePerNight,
    currency: cheapestRoom?.currency || 'INR',
    roomType: cheapestRoom?.name,
    roomTypes: h.roomTypes,
    amenities: h.amenities,
    image: h.images?.[0]
  };
}

function normalizePricingQuote(q) {
  return {
    category: q.category,
    baseFare: q.baseFare,
    gstTax: q.taxes,
    platformFee: q.serviceFee,
    discount: q.discountAmount,
    promoCode: q.appliedCoupon,
    finalAmount: q.totalAmount,
    currency: q.currency
  };
}

function normalizeBooking(b) {
  if (!b) return b;
  return {
    _id: b._id,
    bookingReference: b.bookingReference,
    user: b.userId,
    tripId: b.tripId,
    category: b.category,
    status: b.status,
    providerId: b.providerId,
    providerBookingRef: b.providerBookingRef,
    vendorItemId: b.details?.id || '',
    itemDetails: b.details,
    passengers: b.passengers,
    pricing: b.pricing
      ? {
          baseFare: b.pricing.baseFare,
          tax: b.pricing.taxes,
          platformFee: b.pricing.serviceFee,
          discount: b.pricing.discountAmount,
          totalAmount: b.pricing.totalAmount,
          currency: b.pricing.currency
        }
      : null,
    cancellationReason: b.cancellationReason,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  };
}

/* ------------------------------------------------------------------ */
/* Public API surface (unchanged signatures - pages don't need edits)  */
/* ------------------------------------------------------------------ */

export const authApi = {
  async register({ name, email, password, phone }) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
  },

  async login({ email, password }) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async me() {
    return request('/auth/me');
  },

  async updateProfile(updates) {
    return request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
};

export const searchApi = {
  async searchFlights(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/flights/search${query ? `?${query}` : ''}`);
    if (res.success && res.data) return { ...res, data: (res.data.flights || []).map(normalizeFlight) };
    return res;
  },

  async searchTrains(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/trains/search${query ? `?${query}` : ''}`);
    if (res.success && res.data) return { ...res, data: (res.data.trains || []).map(normalizeTrain) };
    return res;
  },

  async searchBuses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/buses/search${query ? `?${query}` : ''}`);
    if (res.success && res.data) return { ...res, data: (res.data.buses || []).map(normalizeBus) };
    return res;
  },

  async searchHotels(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/hotels/search${query ? `?${query}` : ''}`);
    if (res.success && res.data) return { ...res, data: (res.data.hotels || []).map(normalizeHotel) };
    return res;
  },

  async searchAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/search/all${query ? `?${query}` : ''}`);
    if (res.success && res.data) {
      const r = res.data.results || {};
      return {
        ...res,
        data: {
          flights: (r.flights || []).map(normalizeFlight),
          trains: (r.trains || []).map(normalizeTrain),
          buses: (r.buses || []).map(normalizeBus),
          hotels: (r.hotels || []).map(normalizeHotel)
        }
      };
    }
    return res;
  },

  async getPriceQuote({ category, baseFare, passengers = 1, promoCode = '' }) {
    const res = await request('/pricing/quote', {
      method: 'POST',
      body: JSON.stringify({
        category,
        baseFare: Number(baseFare) * Math.max(1, Number(passengers) || 1),
        couponCode: promoCode || undefined
      })
    });
    if (res.success && res.data?.quote) {
      return { ...res, data: normalizePricingQuote({ ...res.data.quote, category }) };
    }
    return res;
  }
};

export const bookingApi = {
  async createBooking(bookingPayload) {
    const { category, vendorItemId, itemDetails, passengers, tripId, promoCode } = bookingPayload;
    const providerId =
      itemDetails?.providerId ||
      {
        FLIGHT: 'MOCK_FLIGHT_PROVIDER',
        TRAIN: 'MOCK_TRAIN_PROVIDER',
        BUS: 'MOCK_BUS_PROVIDER',
        HOTEL: 'MOCK_HOTEL_PROVIDER'
      }[category] ||
      'MOCK_FLIGHT_PROVIDER';

    const res = await request('/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
      body: JSON.stringify({
        category,
        providerId,
        details: {
          ...itemDetails,
          id: itemDetails?.id || vendorItemId,
          // Backend prices from details.price.base (see booking.service.js)
          price: { base: bookingPayload.pricing?.baseFare }
        },
        passengers,
        tripId,
        couponCode: promoCode || undefined
      })
    });
    if (res.success && res.data?.booking) return { ...res, data: normalizeBooking(res.data.booking) };
    return res;
  },

  async getBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/bookings${query ? `?${query}` : ''}`);
    if (res.success && res.data) {
      return {
        ...res,
        data: (res.data.bookings || []).map(normalizeBooking),
        pagination: res.data.pagination
      };
    }
    return res;
  },

  async getBookingById(id) {
    const res = await request(`/bookings/${id}`);
    if (res.success && res.data?.booking) return { ...res, data: normalizeBooking(res.data.booking) };
    return res;
  },

  async confirmBooking(id, paymentDetails = {}) {
    const res = await request(`/bookings/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ paymentDetails })
    });
    if (res.success && res.data?.booking) return { ...res, data: normalizeBooking(res.data.booking) };
    return res;
  },

  async cancelBooking(id, reason = '') {
    const res = await request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    if (res.success && res.data?.booking) return { ...res, data: normalizeBooking(res.data.booking) };
    return res;
  }
};

export const paymentApi = {
  async createOrder({ bookingId }) {
    const res = await request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    });
    if (res.success && res.data?.order) return { ...res, data: res.data.order };
    return res;
  },

  async verify({ gatewayOrderId, gatewayPaymentId, signature }) {
    return request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ gatewayOrderId, gatewayPaymentId, signature })
    });
  }
};

function normalizeTrip(t) {
  if (!t) return t;
  return { ...t };
}

export const tripApi = {
  async getTrips() {
    const res = await request('/trips');
    if (res.success && res.data) return { ...res, data: (res.data.trips || []).map(normalizeTrip) };
    return res;
  },

  async createTrip(tripData) {
    const res = await request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
    if (res.success && res.data?.trip) return { ...res, data: normalizeTrip(res.data.trip) };
    return res;
  },

  async addItineraryItem(tripId, itemData) {
    const res = await request(`/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
    // Backend returns the whole updated trip; pages consuming this call
    // only want the newly-added item, so hand back the last itinerary entry.
    if (res.success && res.data?.trip) {
      const itin = res.data.trip.itinerary || [];
      return { ...res, data: itin[itin.length - 1] || null, trip: normalizeTrip(res.data.trip) };
    }
    return res;
  },

  async deleteItineraryItem(tripId, itemId) {
    return request(`/trips/${tripId}/itinerary/${itemId}`, {
      method: 'DELETE'
    });
  }
};

export const notificationApi = {
  async getNotifications() {
    return request('/notifications');
  },

  async markAsRead(id) {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }
};

export const aiApi = {
  async travelSearch(prompt) {
    const res = await request('/ai/travel-search', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    if (res.success && res.data) {
      const r = res.data.results || {};
      return {
        ...res,
        data: {
          prompt: res.data.prompt,
          intent: res.data.intent,
          intentSource: res.data.intentSource,
          results: {
            flights: (r.flights || []).map(normalizeFlight),
            trains: (r.trains || []).map(normalizeTrain),
            buses: (r.buses || []).map(normalizeBus),
            hotels: (r.hotels || []).map(normalizeHotel)
          }
        }
      };
    }
    return res;
  },

  async generateItinerary({ destination, days, budget, title }) {
    const res = await request('/ai/itinerary', {
      method: 'POST',
      body: JSON.stringify({ destination, days, budget, title })
    });
    if (res.success && res.data) {
      const d = res.data;
      return {
        ...res,
        data: {
          _id: d.trip?._id,
          title: d.trip?.title || title,
          destination: d.destination,
          daysCount: d.daysCount,
          budgetLimit: d.budgetLimit,
          budget: d.trip?.budget || { totalBudget: d.budgetLimit, spent: 0, currency: 'INR' },
          estimatedTotal: d.estimatedTotal,
          dailyPlans: (d.days || []).map((day) => ({
            day: day.day,
            title: day.title,
            estimatedCost: day.estimatedCost,
            activities: (day.activities || []).map((act) => ({
              time: act.time,
              activity: act.title,
              cost: act.estimatedCost,
              notes: act.notes,
              type: act.type
            }))
          })),
          trip: d.trip ? normalizeTrip(d.trip) : null,
          alreadySaved: !!d.trip
        }
      };
    }
    return res;
  }
};

export const healthApi = {
  async getHealth() {
    return request('/health');
  }
};
