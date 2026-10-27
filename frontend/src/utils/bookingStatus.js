// Backend booking statuses, shown with plain labels.
export const STATUS_LABELS = {
  INITIATED: 'Awaiting payment',
  PAYMENT_PENDING: 'Awaiting payment',
  PAYMENT_SUCCESS: 'Payment received',
  BOOKING_PENDING: 'Confirming with provider',
  CONFIRMED: 'Confirmed',
  TICKET_ISSUED: 'Ticket issued',
  FAILED: 'Failed',
  CANCELLATION_PENDING: 'Cancelling',
  CANCELLED: 'Cancelled',
  REFUND_PENDING: 'Cancelled, refund pending',
  REFUNDED: 'Refunded',
};

export const STATUS_GROUPS = {
  active: ['PAYMENT_SUCCESS', 'BOOKING_PENDING', 'CONFIRMED', 'TICKET_ISSUED'],
  unpaid: ['INITIATED', 'PAYMENT_PENDING'],
  cancelled: ['CANCELLATION_PENDING', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'],
  failed: ['FAILED'],
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || '';
}

export function isUnpaid(status) {
  return STATUS_GROUPS.unpaid.includes(status);
}

export function isCancelled(status) {
  return STATUS_GROUPS.cancelled.includes(status);
}

export function canCancel(status) {
  return status === 'CONFIRMED' || status === 'TICKET_ISSUED';
}

export function statusTone(status) {
  if (STATUS_GROUPS.active.includes(status)) return 'bg-secondary-container text-secondary';
  if (STATUS_GROUPS.unpaid.includes(status)) return 'bg-surface-variant text-tertiary';
  return 'bg-error/20 text-error';
}

// A short title and route line for any booking category.
export function describeBooking(b) {
  const d = b?.itemDetails || {};
  switch (b?.category) {
    case 'TRAIN':
      return { title: [d.trainName, d.trainNumber && `(${d.trainNumber})`].filter(Boolean).join(' '), route: `${d.originCity || d.origin || ''} to ${d.destinationCity || d.destination || ''}`, icon: 'train' };
    case 'BUS':
      return { title: d.operator || 'Bus', route: `${d.originCity || d.origin || ''} to ${d.destinationCity || d.destination || ''}`, icon: 'directions_bus' };
    case 'HOTEL':
      return { title: d.name || 'Hotel', route: [d.city, d.durationNights && `${d.durationNights} night${d.durationNights > 1 ? 's' : ''}`].filter(Boolean).join(', '), icon: 'hotel' };
    default:
      return { title: [d.airline, d.flightNumber].filter(Boolean).join(' ') || 'Flight', route: `${d.originCity || d.origin || ''} to ${d.destinationCity || d.destination || ''}`, icon: 'flight' };
  }
}
