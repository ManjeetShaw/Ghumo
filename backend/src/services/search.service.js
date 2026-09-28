const providerRegistry = require('../providers/ProviderRegistry');
const pricingService = require('./pricing.service');

class SearchService {
  async searchFlights(params = {}) {
    const { origin, destination, date, passengers, cabinClass, maxPrice, sortBy = 'price_asc' } = params;
    const adapter = providerRegistry.getAdapterByCategory('FLIGHT');

    let flights = await adapter.search({ origin, destination, date, passengers, cabinClass });

    // Filter by max price if specified
    if (maxPrice) {
      flights = flights.filter((f) => f.price.total <= Number(maxPrice));
    }

    // Sort flights
    flights = this.sortResults(flights, sortBy, (f) => f.price.total);
    return flights;
  }

  async searchTrains(params = {}) {
    const { origin, destination, date, classCode, maxPrice, sortBy = 'price_asc' } = params;
    const adapter = providerRegistry.getAdapterByCategory('TRAIN');

    let trains = await adapter.search({ origin, destination, date });

    if (classCode) {
      trains = trains.filter((t) =>
        t.classes.some((c) => c.classCode.toUpperCase() === classCode.toUpperCase())
      );
    }

    if (maxPrice) {
      trains = trains.filter((t) =>
        t.classes.some((c) => c.fare <= Number(maxPrice))
      );
    }

    trains = this.sortResults(trains, sortBy, (t) => t.classes[0]?.fare || 0);
    return trains;
  }

  async searchBuses(params = {}) {
    const { origin, destination, date, maxPrice, sortBy = 'price_asc' } = params;
    const adapter = providerRegistry.getAdapterByCategory('BUS');

    let buses = await adapter.search({ origin, destination, date });

    if (maxPrice) {
      buses = buses.filter((b) => b.fare <= Number(maxPrice));
    }

    buses = this.sortResults(buses, sortBy, (b) => b.fare);
    return buses;
  }

  async searchHotels(params = {}) {
    const { city, checkIn, checkOut, minRating, maxPrice, sortBy = 'price_asc' } = params;
    const adapter = providerRegistry.getAdapterByCategory('HOTEL');

    let hotels = await adapter.search({ city, checkIn, checkOut });

    if (minRating) {
      hotels = hotels.filter((h) => h.rating >= Number(minRating));
    }

    if (maxPrice) {
      hotels = hotels.filter((h) =>
        h.roomTypes.some((r) => r.farePerNight <= Number(maxPrice))
      );
    }

    hotels = this.sortResults(hotels, sortBy, (h) => h.roomTypes[0]?.farePerNight || 0);
    return hotels;
  }

  async searchAll(params = {}) {
    const { origin = 'CCU', destination = 'DEL', date, city } = params;

    const [flights, trains, buses, hotels] = await Promise.all([
      this.searchFlights({ origin, destination, date }),
      this.searchTrains({ origin, destination, date }),
      this.searchBuses({ origin, destination, date }),
      this.searchHotels({ city: city || destination }),
    ]);

    return {
      query: { origin, destination, date, city: city || destination },
      summary: {
        totalFlights: flights.length,
        totalTrains: trains.length,
        totalBuses: buses.length,
        totalHotels: hotels.length,
      },
      results: {
        flights,
        trains,
        buses,
        hotels,
      },
    };
  }

  sortResults(items, sortBy, priceExtractor) {
    const list = [...items];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => priceExtractor(a) - priceExtractor(b));
      case 'price_desc':
        return list.sort((a, b) => priceExtractor(b) - priceExtractor(a));
      case 'duration_asc':
        return list.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
      case 'rating_desc':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return list;
    }
  }
}

module.exports = new SearchService();
