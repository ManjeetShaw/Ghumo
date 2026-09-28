const MockFlightAdapter = require('./adapters/MockFlightAdapter');
const MockTrainAdapter = require('./adapters/MockTrainAdapter');
const MockBusAdapter = require('./adapters/MockBusAdapter');
const MockHotelAdapter = require('./adapters/MockHotelAdapter');

class ProviderRegistry {
  constructor() {
    this.adapters = new Map();

    // Register Default Mock Adapters
    const defaultFlight = new MockFlightAdapter();
    const defaultTrain = new MockTrainAdapter();
    const defaultBus = new MockBusAdapter();
    const defaultHotel = new MockHotelAdapter();

    this.adapters.set(defaultFlight.providerId, defaultFlight);
    this.adapters.set(defaultTrain.providerId, defaultTrain);
    this.adapters.set(defaultBus.providerId, defaultBus);
    this.adapters.set(defaultHotel.providerId, defaultHotel);

    // Map category defaults
    this.categoryDefaults = {
      FLIGHT: defaultFlight.providerId,
      TRAIN: defaultTrain.providerId,
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
