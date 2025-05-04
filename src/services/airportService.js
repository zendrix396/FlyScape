// Mock airport data service
// In a real app, this would connect to an actual airport API

const airports = [
  { code: 'DEL', name: 'Delhi', fullName: 'Indira Gandhi International Airport' },
  { code: 'BOM', name: 'Mumbai', fullName: 'Chhatrapati Shivaji International Airport' },
  { code: 'BLR', name: 'Bangalore', fullName: 'Kempegowda International Airport' },
  { code: 'MAA', name: 'Chennai', fullName: 'Chennai International Airport' },
  { code: 'CCU', name: 'Kolkata', fullName: 'Netaji Subhas Chandra Bose International Airport' },
  { code: 'HYD', name: 'Hyderabad', fullName: 'Rajiv Gandhi International Airport' },
  { code: 'AMD', name: 'Ahmedabad', fullName: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'COK', name: 'Cochin', fullName: 'Cochin International Airport' },
  { code: 'PNQ', name: 'Pune', fullName: 'Pune International Airport' },
  { code: 'JAI', name: 'Jaipur', fullName: 'Jaipur International Airport' },
  { code: 'GOI', name: 'Goa', fullName: 'Goa International Airport' },
  { code: 'LKO', name: 'Lucknow', fullName: 'Chaudhary Charan Singh International Airport' },
  { code: 'IXC', name: 'Chandigarh', fullName: 'Chandigarh International Airport' },
  { code: 'PAT', name: 'Patna', fullName: 'Jay Prakash Narayan International Airport' },
  { code: 'BBI', name: 'Bhubaneswar', fullName: 'Biju Patnaik International Airport' }
];

// Search airports by keyword (name, code)
const searchAirports = (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return Promise.resolve([]);
  }
  
  const lowercasedKeyword = keyword.toLowerCase();
  
  const filteredAirports = airports.filter(airport => 
    airport.name.toLowerCase().includes(lowercasedKeyword) || 
    airport.code.toLowerCase().includes(lowercasedKeyword) ||
    airport.fullName.toLowerCase().includes(lowercasedKeyword)
  );
  
  return Promise.resolve(filteredAirports);
};

// Format airport data for display
const formatAirportForDisplay = (airport) => {
  return `${airport.name} (${airport.code})`;
};

// Get airport by code
const getAirportByCode = (code) => {
  return airports.find(airport => airport.code === code);
};

export { searchAirports, formatAirportForDisplay, getAirportByCode }; 