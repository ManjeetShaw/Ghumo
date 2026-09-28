/**
 * Flight Response Normalizer
 * Standardizes raw flight responses into canonical NormalizedFlight payload.
 */

function normalizeFlight(rawFlight, providerId) {
  const basePrice = rawFlight.baseFare || rawFlight.price?.base || rawFlight.cost || 0;
  const taxes = rawFlight.taxAmount || rawFlight.price?.taxes || Math.round(basePrice * 0.12);
  const totalPrice = rawFlight.totalFare || rawFlight.price?.total || (basePrice + taxes);

  return {
    id: rawFlight.id || rawFlight.flightId || `${rawFlight.airlineCode || 'FL'}-${rawFlight.flightNo || '000'}`,
    category: 'FLIGHT',
    providerId: providerId || 'MOCK_FLIGHT_PROVIDER',
    flightNumber: rawFlight.flightNumber || `${rawFlight.airlineCode || '6E'}-${rawFlight.flightNo || '101'}`,
    airline: {
      name: rawFlight.airlineName || rawFlight.airline || 'IndiGo',
      code: rawFlight.airlineCode || '6E',
      logo: rawFlight.airlineLogo || '',
    },
    origin: {
      code: (rawFlight.originCode || rawFlight.origin || 'CCU').toUpperCase(),
      city: rawFlight.originCity || 'Kolkata',
      airport: rawFlight.originAirport || 'Netaji Subhash Chandra Bose International Airport',
    },
    destination: {
      code: (rawFlight.destinationCode || rawFlight.destination || 'DEL').toUpperCase(),
      city: rawFlight.destinationCity || 'Delhi',
      airport: rawFlight.destinationAirport || 'Indira Gandhi International Airport',
    },
    departureTime: new Date(rawFlight.departureTime || rawFlight.depTime || Date.now()).toISOString(),
    arrivalTime: new Date(rawFlight.arrivalTime || rawFlight.arrTime || (Date.now() + 7200000)).toISOString(),
    durationMinutes: rawFlight.durationMinutes || rawFlight.duration || 135,
    stops: rawFlight.stops !== undefined ? rawFlight.stops : 0,
    cabinClass: rawFlight.cabinClass || rawFlight.class || 'Economy',
    seatsAvailable: rawFlight.seatsAvailable || rawFlight.seats || 9,
    price: {
      base: basePrice,
      taxes: taxes,
      total: totalPrice,
      currency: rawFlight.currency || 'INR',
    },
    baggage: {
      cabin: rawFlight.cabinBaggage || '7 kg',
      checkin: rawFlight.checkinBaggage || '15 kg',
    },
    raw: rawFlight, // Preserve raw vendor data for auditing
  };
}

module.exports = {
  normalizeFlight,
};
