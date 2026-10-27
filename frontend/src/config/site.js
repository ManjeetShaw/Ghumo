// Single place for brand and legal details. Fill the empty strings before launch.
// The Privacy Policy and Terms pages read from here, and they show a visible
// notice for every contact field that is still empty.
export const SITE = {
  name: 'Ghumo',
  tagline: 'Flights, trains, buses and hotels across India',
  legalName: '',            // Registered name of the company or proprietor
  registeredAddress: '',    // Registered office address
  supportEmail: '',         // Customer support address
  grievanceOfficerName: '', // Required for Indian e-commerce and data protection compliance
  grievanceOfficerEmail: '',
  jurisdictionCity: '',     // City whose courts have jurisdiction, for example the registered office city
  legalLastUpdated: '24 October 2026',
};

export const STORAGE_KEYS = {
  token: 'ghumo_auth_token',
  role: 'ghumo_user_role',
};
