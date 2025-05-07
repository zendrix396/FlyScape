declare module '../utils/airportUtil' {
  export function getAirportName(code: string | null | undefined): string;
  export function formatAirportForDisplay(code: string | null | undefined): string;
  export function extractAirportCode(displayFormat: string | null | undefined): string;
  
  const airportUtil: {
    getAirportName: typeof getAirportName;
    formatAirportForDisplay: typeof formatAirportForDisplay;
    extractAirportCode: typeof extractAirportCode;
  };
  
  export default airportUtil;
}

declare module '../utils/airportUtil.js' {
  export * from '../utils/airportUtil';
  export { default } from '../utils/airportUtil';
} 