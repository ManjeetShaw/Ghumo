const BaseProvider = require('../base/BaseProvider');
const { normalizeFlight } = require('../normalizers/flightNormalizer');

class MockFlightAdapter extends BaseProvider {
  constructor() {
    super('MOCK_FLIGHT_PROVIDER', 'Mock Flight Aggregator Adapter');
  }

  async search(params = {}) {
    const { origin = 'CCU', destination = 'DEL', date, passengers = 1, cabinClass = 'Economy' } = params;

    const mockFlightsData = [
      {
        flightId: 'FL-INDIGO-6E204',
        airlineName: 'IndiGo',
        airlineCode: '6E',
        flightNo: '204',
        originCode: origin,
        originCity: origin === 'CCU' ? 'Kolkata' : 'Origin City',
        destinationCode: destination,
        destinationCity: destination === 'DEL' ? 'Delhi' : 'Destination City',
        depTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow morning
        arrTime: new Date(Date.now() + 86400000 + 8100000).toISOString(),
        durationMinutes: 135,
        stops: 0,
        baseFare: 3800,
        taxAmount: 450,
        totalFare: 4250,
        currency: 'INR',
        seatsAvailable: 12,
        cabinClass,
      },
      {
        flightId: 'FL-AIRINDIA-AI802',
        airlineName: 'Air India',
        airlineCode: 'AI',
        flightNo: '802',
        originCode: origin,
        originCity: origin === 'CCU' ? 'Kolkata' : 'Origin City',
        destinationCode: destination,
        destinationCity: destination === 'DEL' ? 'Delhi' : 'Destination City',
        depTime: new Date(Date.now() + 86400000 + 14400000).toISOString(),
        arrTime: new Date(Date.now() + 86400000 + 22500000).toISOString(),
        durationMinutes: 135,
        stops: 0,
        baseFare: 4200,
        taxAmount: 500,
        totalFare: 4700,
        currency: 'INR',
        seatsAvailable: 6,
        cabinClass,
      },
      {
        flightId: 'FL-VISTARA-UK747',
        airlineName: 'Vistara',
        airlineCode: 'UK',
        flightNo: '747',
        originCode: origin,
        originCity: origin === 'CCU' ? 'Kolkata' : 'Origin City',
        destinationCode: destination,
        destinationCity: destination === 'DEL' ? 'Delhi' : 'Destination City',
        depTime: new Date(Date.now() + 86400000 + 28800000).toISOString(),
        arrTime: new Date(Date.now() + 86400000 + 36900000).toISOString(),
        durationMinutes: 135,
        stops: 0,
        baseFare: 4900,
        taxAmount: 600,
        totalFare: 5500,
        currency: 'INR',
        seatsAvailable: 4,
        cabinClass,
      },
    ];

    return mockFlightsData.map((item) => normalizeFlight(item, this.providerId));
  }

  async getDetails(flightId) {
    const results = await this.search();
    const found = results.find((f) => f.id === flightId);
    if (!found) {
      throw new Error(`Flight ${flightId} not found`);
    }
    return found;
  }

  async checkAvailability(flightId, params = {}) {
    const flight = await this.getDetails(flightId);
    return {
      available: flight.seatsAvailable > 0,
      seatsLeft: flight.seatsAvailable,
      price: flight.price,
    };
  }

  async createReservation(reservationData) {
    const { flightId, passengers } = reservationData;
    const pnr = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      providerId: this.providerId,
      providerBookingRef: pnr,
      status: 'CONFIRMED',
      ticketIssued: true,
      passengers,
      createdAt: new Date().toISOString(),
    };
  }

  async cancelReservation(providerBookingRef) {
    return {
      success: true,
      providerBookingRef,
      status: 'CANCELLED',
      refundAmount: 3800,
      cancellationFee: 450,
      cancelledAt: new Date().toISOString(),
    };
  }
}

module.exports = MockFlightAdapter;
