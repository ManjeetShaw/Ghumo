/**
 * Base Abstract Provider Interface
 * All Flight, Train, Bus, and Hotel Provider Adapters must extend this class
 */
class BaseProvider {
  constructor(providerId, providerName) {
    if (new.target === BaseProvider) {
      throw new Error('BaseProvider is an abstract class and cannot be instantiated directly.');
    }
    this.providerId = providerId;
    this.providerName = providerName;
  }

  async search(params) {
    throw new Error(`search() method must be implemented by ${this.constructor.name}`);
  }

  async getDetails(id) {
    throw new Error(`getDetails() method must be implemented by ${this.constructor.name}`);
  }

  async checkAvailability(id, params) {
    throw new Error(`checkAvailability() method must be implemented by ${this.constructor.name}`);
  }

  async createReservation(reservationData) {
    throw new Error(`createReservation() method must be implemented by ${this.constructor.name}`);
  }

  async cancelReservation(reservationRef) {
    throw new Error(`cancelReservation() method must be implemented by ${this.constructor.name}`);
  }
}

module.exports = BaseProvider;
