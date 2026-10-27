// Indian cities with the airport (IATA) and railway station codes used by the search APIs.
// An empty rail value means there is no practical railhead in the city itself.
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
  { city: 'Dehradun', air: 'DED', rail: 'DDN' }, { city: 'Rishikesh', air: 'DED', rail: 'RKSH' },
  { city: 'Puri', air: 'BBI', rail: 'PURI' }, { city: 'Mysuru', air: 'MYQ', rail: 'MYS' },
  { city: 'Madurai', air: 'IXM', rail: 'MDU' }, { city: 'Coimbatore', air: 'CJB', rail: 'CBE' },
  { city: 'Visakhapatnam', air: 'VTZ', rail: 'VSKP' }, { city: 'Surat', air: 'STV', rail: 'ST' },
  { city: 'Ranchi', air: 'IXR', rail: 'RNC' }, { city: 'Raipur', air: 'RPR', rail: 'R' },
  { city: 'Alappuzha', air: 'COK', rail: 'ALLP' }, { city: 'Darjeeling', air: 'IXB', rail: 'NJP' },
  { city: 'Leh', air: 'IXL', rail: '' }, { city: 'Srinagar', air: 'SXR', rail: '' },
];

// "Kolkata" becomes "CCU" (air) or "HWH" (rail). Anything else is treated as a code already.
export function toCode(text, mode) {
  const t = (text || '').trim();
  const hit = PLACES.find((p) => p.city.toLowerCase() === t.toLowerCase());
  return hit && hit[mode] ? hit[mode] : t.toUpperCase();
}
