/**
 * Train Response Normalizer
 * Standardizes raw rail responses into canonical NormalizedTrain payload.
 */

function normalizeTrain(rawTrain, providerId) {
  const normalizedClasses = (rawTrain.classes || rawTrain.coaches || []).map((c) => ({
    classCode: c.code || c.classCode || '3A',
    className: c.name || c.className || 'AC 3 Tier',
    fare: c.fare || c.price || 0,
    seatsAvailable: c.seatsAvailable || c.available || 0,
    status: c.status || (c.seatsAvailable > 0 ? 'AVAILABLE' : 'WL'),
  }));

  return {
    id: rawTrain.id || rawTrain.trainNo || `${rawTrain.number || '12301'}`,
    category: 'TRAIN',
    providerId: providerId || 'MOCK_TRAIN_PROVIDER',
    trainNumber: rawTrain.trainNumber || rawTrain.number || '12301',
    trainName: rawTrain.trainName || rawTrain.name || 'Howrah Rajdhani Express',
    origin: {
      code: (rawTrain.originCode || rawFlightOrigin(rawTrain) || 'HWH').toUpperCase(),
      stationName: rawTrain.originStation || 'Howrah Junction',
    },
    destination: {
      code: (rawTrain.destinationCode || rawFlightDest(rawTrain) || 'NDLS').toUpperCase(),
      stationName: rawTrain.destinationStation || 'New Delhi Railway Station',
    },
    departureTime: new Date(rawTrain.departureTime || Date.now()).toISOString(),
    arrivalTime: new Date(rawTrain.arrivalTime || (Date.now() + 61200000)).toISOString(),
    durationMinutes: rawTrain.durationMinutes || 1020,
    classes: normalizedClasses.length > 0 ? normalizedClasses : [
      { classCode: '1A', className: 'AC 1st Class', fare: 4500, seatsAvailable: 5, status: 'AVAILABLE' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 2800, seatsAvailable: 14, status: 'AVAILABLE' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1950, seatsAvailable: 42, status: 'AVAILABLE' },
      { classCode: 'SL', className: 'Sleeper', fare: 750, seatsAvailable: 0, status: 'WL-12' },
    ],
    raw: rawTrain,
  };
}

function rawFlightOrigin(r) {
  return r.from || r.origin;
}

function rawFlightDest(r) {
  return r.to || r.destination;
}

module.exports = {
  normalizeTrain,
};
