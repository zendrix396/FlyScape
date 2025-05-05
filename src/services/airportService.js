// Mock airport data service
// In a real app, this would connect to an actual airport API

const airports = [
  // India - Major Cities
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
  { code: 'BBI', name: 'Bhubaneswar', fullName: 'Biju Patnaik International Airport' },
  
  // India - Additional Cities
  { code: 'IXZ', name: 'Port Blair', fullName: 'Veer Savarkar International Airport' },
  { code: 'ATQ', name: 'Amritsar', fullName: 'Sri Guru Ram Dass Jee International Airport' },
  { code: 'IXB', name: 'Bagdogra', fullName: 'Bagdogra Airport' },
  { code: 'VNS', name: 'Varanasi', fullName: 'Lal Bahadur Shastri International Airport' },
  { code: 'SXR', name: 'Srinagar', fullName: 'Sheikh ul-Alam International Airport' },
  { code: 'IXR', name: 'Ranchi', fullName: 'Birsa Munda Airport' },
  { code: 'GAU', name: 'Guwahati', fullName: 'Lokpriya Gopinath Bordoloi International Airport' },
  { code: 'RPR', name: 'Raipur', fullName: 'Swami Vivekananda Airport' },
  { code: 'NDC', name: 'Nanded', fullName: 'Shri Guru Gobind Singh Ji Airport' },
  { code: 'IDR', name: 'Indore', fullName: 'Devi Ahilyabai Holkar Airport' },
  
  // International - Asia
  { code: 'SIN', name: 'Singapore', fullName: 'Singapore Changi Airport' },
  { code: 'BKK', name: 'Bangkok', fullName: 'Suvarnabhumi Airport' },
  { code: 'KUL', name: 'Kuala Lumpur', fullName: 'Kuala Lumpur International Airport' },
  { code: 'HKG', name: 'Hong Kong', fullName: 'Hong Kong International Airport' },
  { code: 'DXB', name: 'Dubai', fullName: 'Dubai International Airport' },
  { code: 'AUH', name: 'Abu Dhabi', fullName: 'Abu Dhabi International Airport' },
  { code: 'DOH', name: 'Doha', fullName: 'Hamad International Airport' },
  
  // International - Europe
  { code: 'LHR', name: 'London', fullName: 'London Heathrow Airport' },
  { code: 'CDG', name: 'Paris', fullName: 'Charles de Gaulle Airport' },
  { code: 'FRA', name: 'Frankfurt', fullName: 'Frankfurt Airport' },
  { code: 'AMS', name: 'Amsterdam', fullName: 'Amsterdam Airport Schiphol' },
  { code: 'MAD', name: 'Madrid', fullName: 'Adolfo Suárez Madrid–Barajas Airport' },
  { code: 'FCO', name: 'Rome', fullName: 'Leonardo da Vinci–Fiumicino Airport' },
  { code: 'ZRH', name: 'Zurich', fullName: 'Zurich Airport' },
  
  // International - North America
  { code: 'JFK', name: 'New York', fullName: 'John F. Kennedy International Airport' },
  { code: 'LAX', name: 'Los Angeles', fullName: 'Los Angeles International Airport' },
  { code: 'ORD', name: 'Chicago', fullName: 'O\'Hare International Airport' },
  { code: 'YYZ', name: 'Toronto', fullName: 'Toronto Pearson International Airport' },
  { code: 'SFO', name: 'San Francisco', fullName: 'San Francisco International Airport' },
  
  // International - Australia & Pacific
  { code: 'SYD', name: 'Sydney', fullName: 'Sydney Airport' },
  { code: 'MEL', name: 'Melbourne', fullName: 'Melbourne Airport' },
  { code: 'AKL', name: 'Auckland', fullName: 'Auckland Airport' }
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