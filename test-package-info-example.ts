/**
 * Example: Delhivery Package Information API
 * 
 * This demonstrates how to get package information using the /api/v1/packages/json/ endpoint.
 * The Edge Function automatically routes to staging-express.delhivery.com and sends query params.
 */

import { DelhiveryService } from './src/services/DelhiveryService';

// Example usage with the DelhiveryService
async function getPackageInfoExample() {
  const delhiveryService = new DelhiveryService();

  // Example 1: Get package info with waybill only
  try {
    const response = await delhiveryService.getPackageInfo({
      waybill: '1122345678722',
      ref_ids: '' // Empty string is optional
    });
    console.log('Package info:', response);
  } catch (error) {
    console.error('Error getting package info:', error);
  }

  // Example 2: Get package info with waybill and ref_ids
  try {
    const response = await delhiveryService.getPackageInfo({
      waybill: '1122345678722',
      ref_ids: 'REF123456' // Optional reference IDs
    });
    console.log('Package info with ref_ids:', response);
  } catch (error) {
    console.error('Error getting package info:', error);
  }

  // Example 3: Get package info with waybill only (ref_ids omitted)
  try {
    const response = await delhiveryService.getPackageInfo({
      waybill: '1122345678722'
      // ref_ids is optional, can be omitted
    });
    console.log('Package info (waybill only):', response);
  } catch (error) {
    console.error('Error getting package info:', error);
  }
}

// Direct axios example (for reference - not recommended due to CORS)
// The Edge Function handles this automatically, but here's the format it uses:
/*
import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://staging-express.delhivery.com/api/v1/packages/json/',
  params: {
    waybill: '1122345678722',
    ref_ids: '' // Empty string or reference IDs
  },
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Token YOUR_API_TOKEN'
  }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/

export { getPackageInfoExample };
