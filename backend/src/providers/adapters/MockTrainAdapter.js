const BaseProvider = require('../base/BaseProvider');
const { normalizeTrain } = require('../normalizers/trainNormalizer');

class MockTrainAdapter extends BaseProvider {
  constructor() {
    super('MOCK_TRAIN_PROVIDER', 'Mock Railway Partner Adapter');
  }

  async search(params = {}) {
    const { origin = 'DEL', destination = 'AGC', date } = params;

    const mockTrainsData = [
      {
        number: '12002',
        name: 'New Delhi - Bhopal Shatabdi Express',
        originCode: origin === 'DEL' ? 'NDLS' : origin,
        originStation: 'New Delhi Railway Station',
        destinationCode: destination === 'AGC' ? 'AGC' : destination,
        destinationStation: 'Agra Cantt',
        departureTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 14000000).toISOString(),
        durationMinutes: 115,
        classes: [
          { code: 'EC', name: 'Executive Chair Car', fare: 1450, seatsAvailable: 12, status: 'AVAILABLE' },
          { code: 'CC', name: 'AC Chair Car', fare: 785, seatsAvailable: 34, status: 'AVAILABLE' },
        ],
      },
      {
        number: '20172',
        name: 'Vande Bharat Express',
        originCode: origin === 'DEL' ? 'NDLS' : origin,
        originStation: 'New Delhi Railway Station',
        destinationCode: destination === 'AGC' ? 'AGC' : destination,
        destinationStation: 'Agra Cantt',
        departureTime: new Date(Date.now() + 86400000 + 18000000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 24000000).toISOString(),
        durationMinutes: 100,
        classes: [
          { code: 'EC', name: 'Executive Chair Car', fare: 1750, seatsAvailable: 8, status: 'AVAILABLE' },
          { code: 'CC', name: 'AC Chair Car', fare: 950, seatsAvailable: 22, status: 'AVAILABLE' },
        ],
      },
    ];

    return mockTrainsData.map((item) => normalizeTrain(item, this.providerId));
  }

  async getDetails(trainNumber) {
    const results = await this.search();
    const found = results.find((t) => t.trainNumber === trainNumber || t.id === trainNumber);
    if (!found) {
      throw new Error(`Train ${trainNumber} not found`);
    }
    return found;
  }

  async checkAvailability(trainNumber, params = {}) {
    const train = await this.getDetails(trainNumber);
    return {
      available: true,
      classes: train.classes,
    };
  }

  async createReservation(reservationData) {
    const pnr = `IRCTC-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return {
      success: true,
      providerId: this.providerId,
      providerBookingRef: pnr,
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
      refundAmount: 650,
      cancellationFee: 135,
      cancelledAt: new Date().toISOString(),
    };
  }
}

module.exports = MockTrainAdapter;
