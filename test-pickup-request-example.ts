/**
 * Example: Delhivery Pickup Request API
 * 
 * This demonstrates how to request a pickup using the /fm/request/new/ endpoint.
 * The Edge Function automatically routes to staging-express.delhivery.com and sends data in JSON format.
 * 
 * NOTE: The DelhiveryService transforms the user-friendly interface to the API format:
 * - pickup_location → warehouse_name
 * - expected_package_count → quantity
 */

import { DelhiveryService } from './src/services/DelhiveryService';

// Example usage with the DelhiveryService
async function requestPickupExample() {
  const delhiveryService = new DelhiveryService();

  // Example: Request a pickup
  const pickupRequest = {
    pickup_time: '11:00:00',
    pickup_date: '2023-12-29',
    pickup_location: 'warehouse_name', // This will be transformed to 'warehouse_name' in API call
    expected_package_count: 1 // This will be transformed to 'quantity' in API call
  };

  try {
    const response = await delhiveryService.requestPickup(pickupRequest);
    console.log('Pickup requested successfully:', response);
  } catch (error) {
    console.error('Error requesting pickup:', error);
  }

  // Example: Request pickup with time in HH:MM format (will be converted to HH:MM:SS)
  const pickupRequest2 = {
    pickup_time: '14:30', // Will be converted to '14:30:00'
    pickup_date: '2023-12-30',
    pickup_location: 'warehouse_name',
    expected_package_count: 5
  };

  try {
    const response = await delhiveryService.requestPickup(pickupRequest2);
    console.log('Pickup requested:', response);
  } catch (error) {
    console.error('Error requesting pickup:', error);
  }
}

// Direct axios example (for reference - not recommended due to CORS)
// NOTE: The actual API format uses 'warehouse_name' and 'quantity', not 'pickup_location' and 'expected_package_count'
// The DelhiveryService handles this transformation automatically
/*
import axios from 'axios';

// Actual API format (what gets sent to Delhivery):
const options = {
  method: 'POST',
  url: 'https://staging-express.delhivery.com/fm/request/new/',
  headers: {
    Authorization: 'Token YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  data: {
    pickup_time: '11:00:00',
    pickup_date: '2023-12-29',
    warehouse_name: 'warehouse_name',  // API expects 'warehouse_name', not 'pickup_location'
    quantity: 1  // API expects 'quantity', not 'expected_package_count'
  }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/

export { requestPickupExample };
