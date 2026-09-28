/**
 * Bus Response Normalizer
 * Standardizes raw intercity bus responses into canonical NormalizedBus payload.
 */

function normalizeBus(rawBus, providerId) {
  return {
    id: rawBus.id || rawBus.busId || `BUS-${rawBus.operatorCode || 'ZING'}-${Math.floor(Math.random() * 1000)}`,
    category: 'BUS',
    providerId: providerId || 'MOCK_BUS_PROVIDER',
    operatorName: rawBus.operatorName || rawBus.operator || 'Zingbus Premium',
    busType: rawBus.busType || 'Volvo Multi-Axle AC Sleeper (2+1)',
    origin: {
      city: rawBus.originCity || rawBus.origin || 'Delhi',
      boardingPoint: rawBus.boardingPoint || 'Kashmere Gate ISBT',
    },
    destination: {
      city: rawBus.destinationCity || rawBus.destination || 'Agra',
      dropoffPoint: rawBus.dropoffPoint || 'Kuberpur Toll Plaza',
    },
    departureTime: new Date(rawBus.departureTime || Date.now()).toISOString(),
    arrivalTime: new Date(rawBus.arrivalTime || (Date.now() + 14400000)).toISOString(),
    durationMinutes: rawBus.durationMinutes || 240,
    fare: rawBus.fare || rawBus.price || 699,
    currency: rawBus.currency || 'INR',
    seatsAvailable: rawBus.seatsAvailable || 18,
    rating: rawBus.rating || 4.6,
    amenities: rawBus.amenities || ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Live Tracking'],
    raw: rawBus,
  };
}

module.exports = {
  normalizeBus,
};
