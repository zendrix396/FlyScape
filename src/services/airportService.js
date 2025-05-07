// Mock airport data service
// In a real app, this would connect to an actual airport API

const airports = [
  // India - Major Cities
  { code: 'DEL', name: 'Delhi', fullName: 'Indira Gandhi International Airport', city: 'Delhi' },
  { code: 'BOM', name: 'Mumbai', fullName: 'Chhatrapati Shivaji International Airport', city: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore', fullName: 'Kempegowda International Airport', city: 'Bangalore' },
  { code: 'MAA', name: 'Chennai', fullName: 'Chennai International Airport', city: 'Chennai' },
  { code: 'CCU', name: 'Kolkata', fullName: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata' },
  { code: 'HYD', name: 'Hyderabad', fullName: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
  { code: 'AMD', name: 'Ahmedabad', fullName: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad' },
  { code: 'COK', name: 'Cochin', fullName: 'Cochin International Airport', city: 'Kochi' },
  { code: 'PNQ', name: 'Pune', fullName: 'Pune International Airport', city: 'Pune' },
  { code: 'JAI', name: 'Jaipur', fullName: 'Jaipur International Airport', city: 'Jaipur' },
  { code: 'GOI', name: 'Goa', fullName: 'Goa International Airport', city: 'Goa' },
  { code: 'LKO', name: 'Lucknow', fullName: 'Chaudhary Charan Singh International Airport', city: 'Lucknow' },
  { code: 'IXC', name: 'Chandigarh', fullName: 'Chandigarh International Airport', city: 'Chandigarh' },
  { code: 'PAT', name: 'Patna', fullName: 'Jay Prakash Narayan International Airport', city: 'Patna' },
  { code: 'BBI', name: 'Bhubaneswar', fullName: 'Biju Patnaik International Airport', city: 'Bhubaneswar' },
  
  // India - Additional Cities
  { code: 'IXZ', name: 'Port Blair', fullName: 'Veer Savarkar International Airport', city: 'Port Blair' },
  { code: 'ATQ', name: 'Amritsar', fullName: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar' },
  { code: 'IXB', name: 'Bagdogra', fullName: 'Bagdogra Airport', city: 'Siliguri' },
  { code: 'VNS', name: 'Varanasi', fullName: 'Lal Bahadur Shastri International Airport', city: 'Varanasi' },
  { code: 'SXR', name: 'Srinagar', fullName: 'Sheikh ul-Alam International Airport', city: 'Srinagar' },
  { code: 'IXR', name: 'Ranchi', fullName: 'Birsa Munda Airport', city: 'Ranchi' },
  { code: 'GAU', name: 'Guwahati', fullName: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati' },
  { code: 'RPR', name: 'Raipur', fullName: 'Swami Vivekananda Airport', city: 'Raipur' },
  { code: 'NDC', name: 'Nanded', fullName: 'Shri Guru Gobind Singh Ji Airport', city: 'Nanded' },
  { code: 'IDR', name: 'Indore', fullName: 'Devi Ahilyabai Holkar Airport', city: 'Indore' },
  
  // International - Asia
  { code: 'SIN', name: 'Singapore', fullName: 'Singapore Changi Airport', city: 'Singapore' },
  { code: 'BKK', name: 'Bangkok', fullName: 'Suvarnabhumi Airport', city: 'Bangkok' },
  { code: 'KUL', name: 'Kuala Lumpur', fullName: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur' },
  { code: 'HKG', name: 'Hong Kong', fullName: 'Hong Kong International Airport', city: 'Hong Kong' },
  { code: 'DXB', name: 'Dubai', fullName: 'Dubai International Airport', city: 'Dubai' },
  { code: 'AUH', name: 'Abu Dhabi', fullName: 'Abu Dhabi International Airport', city: 'Abu Dhabi' },
  { code: 'DOH', name: 'Doha', fullName: 'Hamad International Airport', city: 'Doha' },
  
  // International - Europe
  { code: 'LHR', name: 'London', fullName: 'London Heathrow Airport', city: 'London' },
  { code: 'CDG', name: 'Paris', fullName: 'Charles de Gaulle Airport', city: 'Paris' },
  { code: 'FRA', name: 'Frankfurt', fullName: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'AMS', name: 'Amsterdam', fullName: 'Amsterdam Airport Schiphol', city: 'Amsterdam' },
  { code: 'MAD', name: 'Madrid', fullName: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid' },
  { code: 'FCO', name: 'Rome', fullName: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome' },
  { code: 'ZRH', name: 'Zurich', fullName: 'Zurich Airport', city: 'Zurich' },
  
  // International - North America
  { code: 'JFK', name: 'New York', fullName: 'John F. Kennedy International Airport', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles', fullName: 'Los Angeles International Airport', city: 'Los Angeles' },
  { code: 'ORD', name: 'Chicago', fullName: 'O\'Hare International Airport', city: 'Chicago' },
  { code: 'YYZ', name: 'Toronto', fullName: 'Toronto Pearson International Airport', city: 'Toronto' },
  { code: 'SFO', name: 'San Francisco', fullName: 'San Francisco International Airport', city: 'San Francisco' },
  
  // International - Australia & Pacific
  { code: 'SYD', name: 'Sydney', fullName: 'Sydney Airport', city: 'Sydney' },
  { code: 'MEL', name: 'Melbourne', fullName: 'Melbourne Airport', city: 'Melbourne' },
  { code: 'AKL', name: 'Auckland', fullName: 'Auckland Airport', city: 'Auckland' }
];

// Popular airports to show by default
const popularAirports = [
  'DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'GOI', 'DXB', 'SIN', 'LHR', 'JFK', 'BKK'
];

// Search airports by keyword (name, code)
const searchAirports = (keyword) => {
  // If empty keyword, return popular airports as suggestions
  if (!keyword || keyword.trim() === '') {
    const popularResults = popularAirports
      .map(code => airports.find(airport => airport.code === code))
      .filter(Boolean);
    
    return Promise.resolve(popularResults);
  }
  
  const lowercasedKeyword = keyword.toLowerCase();
  
  // Even for very short keywords like "mu", "de" - we should return results
  const filteredAirports = airports.filter(airport => 
    airport.name.toLowerCase().includes(lowercasedKeyword) || 
    airport.code.toLowerCase().includes(lowercasedKeyword) ||
    airport.city.toLowerCase().includes(lowercasedKeyword) ||
    airport.fullName.toLowerCase().includes(lowercasedKeyword)
  );
  
  // Even if no exact match, return some suggestions for short inputs
  if (filteredAirports.length === 0 && keyword.length <= 2) {
    return Promise.resolve(popularAirports
      .map(code => airports.find(airport => airport.code === code))
      .filter(Boolean)
      .slice(0, 5));
  }
  
  return Promise.resolve(filteredAirports);
};

// Format airport data for display
const formatAirportForDisplay = (code) => {
  const airport = airports.find(a => a.code === code);
  if (airport) {
    return `${airport.city || airport.name} (${airport.code})`;
  }
  return `${code}`;
};

// Get airport by code
const getAirportByCode = (code) => {
  return airports.find(airport => airport.code === code);
};

export { searchAirports, formatAirportForDisplay, getAirportByCode, airports }; 