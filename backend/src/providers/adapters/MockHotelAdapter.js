const BaseProvider = require('../base/BaseProvider');
const { normalizeHotel } = require('../normalizers/hotelNormalizer');

class MockHotelAdapter extends BaseProvider {
  constructor() {
    super('MOCK_HOTEL_PROVIDER', 'Mock Hotel Bedbank Adapter');
  }

  async search(params = {}) {
    const { city = 'Delhi', checkIn, checkOut, guests = 2 } = params;

    const mockHotelsData = [
      {
        hotelId: 'HTL-DEL-001',
        hotelName: 'The Leela Palace New Delhi',
        address: 'Diplomatic Enclave, Chanakyapuri',
        city: city,
        country: 'India',
        rating: 4.9,
        reviewsCount: 3420,
        amenities: ['Infiniti Pool', 'Luxury Spa', 'Fine Dining', 'Butler Service', 'Free High-Speed WiFi'],
        rooms: [
          {
            roomId: 'RM-LEELA-DELUXE',
            roomName: 'Grand Deluxe Room',
            farePerNight: 16500,
            currency: 'INR',
            maxOccupancy: 2,
            availableRooms: 4,
          },
          {
            roomId: 'RM-LEELA-SUITE',
            roomName: 'Royal Suite with Balcony',
            farePerNight: 35000,
            currency: 'INR',
            maxOccupancy: 3,
            availableRooms: 1,
          },
        ],
      },
      {
        hotelId: 'HTL-DEL-002',
        hotelName: 'Radisson Blu Plaza Delhi Airport',
        address: 'National Highway 8, Mahipalpur',
        city: city,
        country: 'India',
        rating: 4.5,
        reviewsCount: 1850,
        amenities: ['Outdoor Pool', '24h Fitness Center', 'Airport Shuttle', 'Free Breakfast'],
        rooms: [
          {
            roomId: 'RM-RAD-SUPERIOR',
            roomName: 'Superior Room',
            farePerNight: 6800,
            currency: 'INR',
            maxOccupancy: 2,
            availableRooms: 8,
          },
        ],
      },
    ];

    return mockHotelsData.map((item) => normalizeHotel(item, this.providerId));
  }

  async getDetails(hotelId) {
    const results = await this.search();
    const found = results.find((h) => h.id === hotelId);
    if (!found) {
      throw new Error(`Hotel ${hotelId} not found`);
    }
    return found;
  }

  async checkAvailability(hotelId, params = {}) {
    const hotel = await this.getDetails(hotelId);
    return {
      available: true,
      roomTypes: hotel.roomTypes,
    };
  }

  async createReservation(reservationData) {
    const voucherRef = `HTL-VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerId: this.providerId,
      providerBookingRef: voucherRef,
      status: 'CONFIRMED',
      voucherIssued: true,
      passengers: reservationData.passengers,
      createdAt: new Date().toISOString(),
    };
  }

  async cancelReservation(providerBookingRef) {
    return {
      success: true,
      providerBookingRef,
      status: 'CANCELLED',
      refundAmount: 6800,
      cancellationFee: 0,
      cancelledAt: new Date().toISOString(),
    };
  }
}

module.exports = MockHotelAdapter;
