const MockFlightAdapter = require('./adapters/MockFlightAdapter');
const MockTrainAdapter = require('./adapters/MockTrainAdapter');
const MockBusAdapter = require('./adapters/MockBusAdapter');
const MockHotelAdapter = require('./adapters/MockHotelAdapter');
const RailRadarTrainAdapter = require('./adapters/RailRadarTrainAdapter');
const AviationStackFlightAdapter = require('./adapters/AviationStackFlightAdapter');
const config = require('../config');

class ProviderRegistry {
  constructor() {
    this.adapters = new Map();

    // Register Default Mock Adapters
    const mockFlight = new MockFlightAdapter();
    const aviationStackFlight = new AviationStackFlightAdapter();
    const mockTrain = new MockTrainAdapter();
    const railRadarTrain = new RailRadarTrainAdapter();
    const defaultBus = new MockBusAdapter();
    const defaultHotel = new MockHotelAdapter();

    this.adapters.set(mockFlight.providerId, mockFlight);
    this.adapters.set(aviationStackFlight.providerId, aviationStackFlight);
    this.adapters.set(mockTrain.providerId, mockTrain);
    this.adapters.set(railRadarTrain.providerId, railRadarTrain);
    this.adapters.set(defaultBus.providerId, defaultBus);
    this.adapters.set(defaultHotel.providerId, defaultHotel);

    // Train/Flight: use the real provider once its API key is set,
    // otherwise keep using the sample adapter. Each real adapter also
    // falls back to sample data internally if a live call or quota fails.
    const defaultTrainId = config.railRadar.apiKey ? railRadarTrain.providerId : mockTrain.providerId;
    const defaultFlightId = config.aviationStack.apiKey ? aviationStackFlight.providerId : mockFlight.providerId;

    // Map category defaults
    this.categoryDefaults = {
      FLIGHT: defaultFlightId,
      TRAIN: defaultTrainId,
      BUS: defaultBus.providerId,
      HOTEL: defaultHotel.providerId,
    };
  }

  getAdapter(providerId) {
    if (this.adapters.has(providerId)) {
      return this.adapters.get(providerId);
    }
    throw new Error(`Provider adapter for '${providerId}' is not registered`);
  }

  getAdapterByCategory(category) {
    const defaultProviderId = this.categoryDefaults[category?.toUpperCase()];
    if (!defaultProviderId) {
      throw new Error(`No default provider configured for category '${category}'`);
    }
    return this.getAdapter(defaultProviderId);
  }

  registerAdapter(adapter) {
    if (!adapter.providerId) {
      throw new Error('Adapter must specify a valid providerId');
    }
    this.adapters.set(adapter.providerId, adapter);
  }
}

module.exports = new ProviderRegistry();