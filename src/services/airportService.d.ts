declare module '../services/airportService' {
  export function searchAirports(query: string): Promise<any[]>;
  export function formatAirportForDisplay(airport: any): string;
  export function getAirportByCode(code: string): any;
}

declare module '../services/airportService.js' {
  export * from '../services/airportService';
} 