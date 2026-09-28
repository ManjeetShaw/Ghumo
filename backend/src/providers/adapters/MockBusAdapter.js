const BaseProvider = require('../base/BaseProvider');
const { normalizeBus } = require('../normalizers/busNormalizer');

class MockBusAdapter extends BaseProvider {
  constructor() {
    super('MOCK_BUS_PROVIDER', 'Mock Intercity Bus Partner Adapter');
  }

  async search(params = {}) {
    const { origin = 'Agra', destination = 'Jaipur', date } = params;

    const mockBusesData = [
      {
        busId: 'BUS-ZING-AGR-JAI-1',
        operatorName: 'Zingbus Premium',
        busType: 'Volvo Multi-Axle A/C Sleeper (2+1)',
        originCity: origin,
        boardingPoint: 'Agra ISBT Gate No 2',
        destinationCity: destination,
        dropoffPoint: 'Sindhi Camp Bus Stand Jaipur',
        departureTime: new Date(Date.now() + 86400000 + 36000000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 54000000).toISOString(),
        durationMinutes: 300,
        fare: 750,
        seatsAvailable: 14,
        rating: 4.7,
      },
      {
        busId: 'BUS-INTRCITY-AGR-JAI-2',
        operatorName: 'IntrCity SmartBus',
        busType: 'AC Seater / Sleeper 2+1',
        originCity: origin,
        boardingPoint: 'Kuberpur Toll Plaza Agra',
        destinationCity: destination,
        dropoffPoint: 'Transport Nagar Jaipur',
        departureTime: new Date(Date.now() + 86400000 + 43200000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 61200000).toISOString(),
        durationMinutes: 300,
        fare: 680,
        seatsAvailable: 8,
        rating: 4.5,
      },
    ];

    return mockBusesData.map((item) => normalizeBus(item, this.providerId));
  }

  async getDetails(busId) {
    const results = await this.search();
    const found = results.find((b) => b.id === busId);
    if (!found) {
      throw new Error(`Bus ${busId} not found`);
    }
    return found;
  }

  async checkAvailability(busId, params = {}) {
    const bus = await this.getDetails(busId);
    return {
      available: bus.seatsAvailable > 0,
      seatsLeft: bus.seatsAvailable,
    };
  }

  async createReservation(reservationData) {
    const busTicketRef = `BUS-TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      success: true,
      providerId: this.providerId,
      providerBookingRef: busTicketRef,
      status: 'CONFIRMED',
      ticketIssued: true,
      passengers: reservationData.passengers,
      createdAt: new Date().toISOString(),
    };
  }

  async cancelReservation(providerBookingRef) {
    return {
      success: true,
      providerBookingRef,
      status: 'CANCELLED',
      refundAmount: 600,
      cancellationFee: 80,
      cancelledAt: new Date().toISOString(),
    };
  }
}

module.exports = MockBusAdapter;
