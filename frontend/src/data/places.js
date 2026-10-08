export const PLACES = [
  { city: 'Kolkata', air: 'CCU', rail: 'HWH' }, { city: 'Delhi', air: 'DEL', rail: 'NDLS' },
  { city: 'Mumbai', air: 'BOM', rail: 'CSMT' }, { city: 'Bengaluru', air: 'BLR', rail: 'SBC' },
  { city: 'Chennai', air: 'MAA', rail: 'MAS' }, { city: 'Hyderabad', air: 'HYD', rail: 'SC' },
  { city: 'Pune', air: 'PNQ', rail: 'PUNE' }, { city: 'Ahmedabad', air: 'AMD', rail: 'ADI' },
  { city: 'Jaipur', air: 'JAI', rail: 'JP' }, { city: 'Lucknow', air: 'LKO', rail: 'LJN' },
  { city: 'Patna', air: 'PAT', rail: 'PNBE' }, { city: 'Guwahati', air: 'GAU', rail: 'GHY' },
  { city: 'Kochi', air: 'COK', rail: 'ERS' }, { city: 'Thiruvananthapuram', air: 'TRV', rail: 'TVC' },
  { city: 'Goa', air: 'GOI', rail: 'MAO' }, { city: 'Varanasi', air: 'VNS', rail: 'BSB' },
  { city: 'Agra', air: 'AGR', rail: 'AGC' }, { city: 'Bhubaneswar', air: 'BBI', rail: 'BBS' },
  { city: 'Chandigarh', air: 'IXC', rail: 'CDG' }, { city: 'Bhopal', air: 'BHO', rail: 'BPL' },
  { city: 'Nagpur', air: 'NAG', rail: 'NGP' }, { city: 'Indore', air: 'IDR', rail: 'INDB' },
  { city: 'Amritsar', air: 'ATQ', rail: 'ASR' }, { city: 'Udaipur', air: 'UDR', rail: 'UDZ' },
];

// "Kolkata" -> "CCU" (air) or "HWH" (rail). Anything else is treated as a code already.
export function toCode(text, mode) {
  const t = (text || '').trim();
  const hit = PLACES.find((p) => p.city.toLowerCase() === t.toLowerCase());
  return hit && hit[mode] ? hit[mode] : t.toUpperCase();
}