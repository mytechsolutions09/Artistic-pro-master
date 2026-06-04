/**
 * Example: Delhivery E-waybill Update API
 * 
 * This demonstrates how to update e-waybill information using the /api/rest/ewaybill/{waybill}/ endpoint.
 * The Edge Function automatically routes to track.delhivery.com and sends data in JSON format.
 */

import { DelhiveryService } from './src/services/DelhiveryService';

// Example usage with the DelhiveryService
async function updateEWaybillExample() {
  const delhiveryService = new DelhiveryService();

  // Example: Update e-waybill for a shipment
  const waybill = 'XXXXXXXXXXXXX';
  const eWaybillData = [
    {
      dcn: 'pass the invoice number', // Invoice number (DCN)
      ewbn: 'pass the ewb number'     // E-waybill number
    }
  ];

  try {
    const response = await delhiveryService.updateEWaybill(waybill, eWaybillData);
    console.log('E-waybill updated successfully:', response);
  } catch (error) {
    console.error('Error updating e-waybill:', error);
  }

  // Example: Multiple e-waybills for a single shipment
  const multipleEWaybills = [
    {
      dcn: 'INV001',
      ewbn: 'EWB123456789'
    },
    {
      dcn: 'INV002',
      ewbn: 'EWB987654321'
    }
  ];

  try {
    const response = await delhiveryService.updateEWaybill('XXXXXXXXXXXXX', multipleEWaybills);
    console.log('Multiple e-waybills updated:', response);
  } catch (error) {
    console.error('Error updating e-waybills:', error);
  }
}

// Direct axios example (for reference - not recommended due to CORS)
// The Edge Function handles this automatically, but here's the format it uses:
/*
import axios from 'axios';

const options = {
  method: 'PUT',
  url: 'https://track.delhivery.com/api/rest/ewaybill/XXXXXXXXXXXXX/',
  headers: {
    Authorization: 'Token YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  data: {
    data: [
      {
        dcn: 'pass the invoice number',  // Invoice number
        ewbn: 'pass the ewb number'      // E-waybill number
      }
    ]
  }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/

export { updateEWaybillExample };
