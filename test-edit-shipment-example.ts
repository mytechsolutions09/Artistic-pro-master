/**
 * Example: Delhivery Edit Shipment API
 * 
 * This demonstrates how to edit shipment details using the /api/p/edit endpoint.
 * The Edge Function automatically sends the data in JSON format.
 */

import { DelhiveryService } from './src/services/DelhiveryService';

// Example usage with the DelhiveryService
async function editShipmentExample() {
  const delhiveryService = new DelhiveryService();

  // Example 1: Edit shipment payment details
  const editRequest = {
    waybill: '843xxxxxxxxx',
    pt: 'COD', // Payment Type: 'COD' or 'Pre-paid'
    cod: 100, // COD amount (required if pt is 'COD')
    shipment_height: 40,
    weight: 100
  };

  try {
    const response = await delhiveryService.editShipment(editRequest);
    console.log('Shipment edited successfully:', response);
  } catch (error) {
    console.error('Error editing shipment:', error);
  }

  // Example 2: Cancel a shipment
  try {
    const cancelResponse = await delhiveryService.cancelShipmentViaEdit('6945XXXXXXXX');
    console.log('Shipment cancelled:', cancelResponse);
  } catch (error) {
    console.error('Error cancelling shipment:', error);
  }

  // Example 2b: Cancel using editShipment directly
  try {
    const cancelResponse = await delhiveryService.editShipment({
      waybill: '6945XXXXXXXX',
      cancellation: 'true' // API expects string 'true'
    });
    console.log('Shipment cancelled via edit:', cancelResponse);
  } catch (error) {
    console.error('Error cancelling shipment:', error);
  }

  // Example 3: Change payment mode from COD to Pre-paid
  const changePaymentRequest = {
    waybill: '843xxxxxxxxx',
    pt: 'Pre-paid',
    // cod is not needed for Pre-paid
    weight: 100
  };

  try {
    const response = await delhiveryService.editShipment(changePaymentRequest);
    console.log('Payment mode changed:', response);
  } catch (error) {
    console.error('Error changing payment mode:', error);
  }
}

// Direct axios example (for reference - not recommended due to CORS)
// The Edge Function handles this automatically, but here's the format it uses:
/*
import axios from 'axios';

const options = {
  method: 'POST',
  url: 'https://staging-express.delhivery.com/api/p/edit',
  headers: {
    Authorization: 'Token YOUR_API_TOKEN',
    Accept: 'application/json',
    'Content-Type': 'application/json'  // JSON format (not URL-encoded)
  },
  data: {
    waybill: '6945XXXXXXXX',
    cancellation: 'true'  // String 'true' for cancellation
  }
  // OR for editing other fields:
  // data: {
  //   waybill: '843xxxxxxxxx',
  //   pt: 'COD', // or 'Pre-paid'
  //   cod: 100,  // Required if pt is 'COD'
  //   shipment_height: 40,
  //   weight: 100
  // }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/

export { editShipmentExample };
