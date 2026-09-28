const providerRegistry = require('../src/providers/ProviderRegistry');
const { normalizeFlight } = require('../src/providers/normalizers/flightNormalizer');
const { normalizeTrain } = require('../src/providers/normalizers/trainNormalizer');
const { normalizeBus } = require('../src/providers/normalizers/busNormalizer');
const { normalizeHotel } = require('../src/providers/normalizers/hotelNormalizer');

describe('Provider Engine & Response Normalizer Suite', () => {
  describe('Provider Registry', () => {
    it('should retrieve default adapters for all categories', () => {
      const flightAdapter = providerRegistry.getAdapterByCategory('FLIGHT');
      const trainAdapter = providerRegistry.getAdapterByCategory('TRAIN');
      const busAdapter = providerRegistry.getAdapterByCategory('BUS');
      const hotelAdapter = providerRegistry.getAdapterByCategory('HOTEL');

      expect(flightAdapter.providerId).toBe('MOCK_FLIGHT_PROVIDER');
      expect(trainAdapter.providerId).toBe('MOCK_TRAIN_PROVIDER');
      expect(busAdapter.providerId).toBe('MOCK_BUS_PROVIDER');
      expect(hotelAdapter.providerId).toBe('MOCK_HOTEL_PROVIDER');
    });

    it('should throw error when requesting unregistered provider ID', () => {
      expect(() => providerRegistry.getAdapter('UNREGISTERED_PROVIDER')).toThrow();
    });
  });

  describe('Flight Provider & Normalizer', () => {
    const flightAdapter = providerRegistry.getAdapter('MOCK_FLIGHT_PROVIDER');

    it('should search flights and return normalized flight objects', async () => {
      const flights = await flightAdapter.search({ origin: 'CCU', destination: 'DEL' });

      expect(Array.isArray(flights)).toBe(true);
      expect(flights.length).toBeGreaterThan(0);

      const firstFlight = flights[0];
      expect(firstFlight.category).toBe('FLIGHT');
      expect(firstFlight.origin.code).toBe('CCU');
      expect(firstFlight.destination.code).toBe('DEL');
      expect(firstFlight.price).toHaveProperty('base');
      expect(firstFlight.price).toHaveProperty('taxes');
      expect(firstFlight.price).toHaveProperty('total');
      expect(firstFlight.price.total).toBe(firstFlight.price.base + firstFlight.price.taxes);
    });

    it('should process flight reservation and return valid PNR', async () => {
      const reservation = await flightAdapter.createReservation({
        flightId: 'FL-INDIGO-6E204',
        passengers: [{ name: 'Manjeet Shaw', age: 28, gender: 'M' }],
      });

      expect(reservation.success).toBe(true);
      expect(reservation.status).toBe('CONFIRMED');
      expect(reservation.providerBookingRef).toMatch(/^PNR-/);
    });
  });

  describe('Train Provider & Normalizer', () => {
    const trainAdapter = providerRegistry.getAdapter('MOCK_TRAIN_PROVIDER');

    it('should search trains and return normalized rail objects', async () => {
      const trains = await trainAdapter.search({ origin: 'NDLS', destination: 'AGC' });

      expect(Array.isArray(trains)).toBe(true);
      expect(trains.length).toBeGreaterThan(0);

      const firstTrain = trains[0];
      expect(firstTrain.category).toBe('TRAIN');
      expect(firstTrain.trainNumber).toBeDefined();
      expect(Array.isArray(firstTrain.classes)).toBe(true);
      expect(firstTrain.classes[0]).toHaveProperty('classCode');
      expect(firstTrain.classes[0]).toHaveProperty('fare');
    });

    it('should process rail reservation and return IRCTC PNR', async () => {
      const reservation = await trainAdapter.createReservation({
        trainNumber: '12002',
        classCode: 'CC',
        passengers: [{ name: 'Manjeet Shaw', age: 28 }],
      });

      expect(reservation.success).toBe(true);
      expect(reservation.providerBookingRef).toMatch(/^IRCTC-/);
    });
  });

  describe('Bus Provider & Normalizer', () => {
    const busAdapter = providerRegistry.getAdapter('MOCK_BUS_PROVIDER');

    it('should search buses and return normalized bus objects', async () => {
      const buses = await busAdapter.search({ origin: 'Agra', destination: 'Jaipur' });

      expect(Array.isArray(buses)).toBe(true);
      expect(buses.length).toBeGreaterThan(0);

      const firstBus = buses[0];
      expect(firstBus.category).toBe('BUS');
      expect(firstBus.operatorName).toBeDefined();
      expect(firstBus.fare).toBeGreaterThan(0);
    });
  });

  describe('Hotel Provider & Normalizer', () => {
    const hotelAdapter = providerRegistry.getAdapter('MOCK_HOTEL_PROVIDER');

    it('should search hotels and return normalized hotel objects', async () => {
      const hotels = await hotelAdapter.search({ city: 'Delhi' });

      expect(Array.isArray(hotels)).toBe(true);
      expect(hotels.length).toBeGreaterThan(0);

      const firstHotel = hotels[0];
      expect(firstHotel.category).toBe('HOTEL');
      expect(firstHotel.location.city).toBe('Delhi');
      expect(Array.isArray(firstHotel.roomTypes)).toBe(true);
      expect(firstHotel.roomTypes[0]).toHaveProperty('farePerNight');
    });
  });

  describe('Response Normalizer Edge Cases', () => {
    it('should handle unformatted raw JSON gracefully and supply sensible defaults', () => {
      const rawUnformatted = {
        airline: 'SpiceJet',
        origin: 'BOM',
        destination: 'BLR',
        cost: 3200,
      };

      const normalized = normalizeFlight(rawUnformatted, 'TEST_PROVIDER');
      expect(normalized.airline.name).toBe('SpiceJet');
      expect(normalized.origin.code).toBe('BOM');
      expect(normalized.destination.code).toBe('BLR');
      expect(normalized.price.base).toBe(3200);
      expect(normalized.price.total).toBe(3200 + Math.round(3200 * 0.12));
    });
  });
});
