/**
 * Hotel Response Normalizer
 * Standardizes raw accommodation responses into canonical NormalizedHotel payload.
 */

function normalizeHotel(rawHotel, providerId) {
  const normalizedRooms = (rawHotel.rooms || rawHotel.roomTypes || []).map((r) => ({
    roomId: r.id || r.roomId || `ROOM-${Math.floor(Math.random() * 1000)}`,
    name: r.name || r.roomName || 'Deluxe King Room',
    farePerNight: r.farePerNight || r.price || r.rate || 3500,
    currency: r.currency || 'INR',
    maxOccupancy: r.maxOccupancy || r.capacity || 2,
    amenities: r.amenities || ['King Bed', 'AC', 'Free WiFi', 'Breakfast Included'],
    availableRooms: r.availableRooms !== undefined ? r.availableRooms : 3,
  }));

  return {
    id: rawHotel.id || rawHotel.hotelId || `HTL-${Math.floor(Math.random() * 10000)}`,
    category: 'HOTEL',
    providerId: providerId || 'MOCK_HOTEL_PROVIDER',
    name: rawHotel.name || rawHotel.hotelName || 'The Taj Mahal Palace',
    location: {
      address: rawHotel.address || 'Apollo Bunder, Colaba',
      city: rawHotel.city || 'Mumbai',
      country: rawHotel.country || 'India',
      coordinates: {
        lat: rawHotel.lat || rawHotel.latitude || 18.9217,
        lng: rawHotel.lng || rawHotel.longitude || 72.8332,
      },
    },
    rating: rawHotel.rating || rawHotel.starRating || 4.8,
    reviewsCount: rawHotel.reviewsCount || 1240,
    amenities: rawHotel.amenities || ['Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Free Parking', 'Airport Shuttle'],
    roomTypes: normalizedRooms.length > 0 ? normalizedRooms : [
      {
        roomId: 'RM-DELUXE',
        name: 'Deluxe City View Room',
        farePerNight: 5500,
        currency: 'INR',
        maxOccupancy: 2,
        amenities: ['King Bed', 'City View', 'Free WiFi'],
        availableRooms: 5,
      },
      {
        roomId: 'RM-SUITE',
        name: 'Executive Sea View Suite',
        farePerNight: 12500,
        currency: 'INR',
        maxOccupancy: 3,
        amenities: ['King Bed', 'Sea View', 'Lounge Access', 'Breakfast Included'],
        availableRooms: 2,
      },
    ],
    images: rawHotel.images || ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    raw: rawHotel,
  };
}

module.exports = {
  normalizeHotel,
};
