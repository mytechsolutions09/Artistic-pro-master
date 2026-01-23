/**
 * Example: Delhivery CMU API Shipment Creation
 * 
 * This demonstrates the correct format for creating shipments via the CMU API.
 * The Edge Function automatically converts the data to URL-encoded format.
 */

import { DelhiveryService } from './src/services/DelhiveryService';

// Example usage with the DelhiveryService
async function createShipmentExample() {
  const delhiveryService = new DelhiveryService();

  const shipmentData = {
    shipments: [
      {
        name: "Consignee name",
        add: "Huda Market, Haryana",
        pin: "110042",
        city: "Gurugram",
        state: "Haryana",
        country: "India",
        phone: "9999999999",
        order: "Test Order 01",
        payment_mode: "Prepaid",
        return_pin: "",
        return_city: "",
        return_phone: "",
        return_add: "",
        return_state: "",
        return_country: "",
        products_desc: "",
        hsn_code: "",
        cod_amount: "",
        order_date: null,
        total_amount: "",
        seller_add: "",
        seller_name: "",
        seller_inv: "",
        quantity: "",
        waybill: "",
        shipment_width: "100",
        shipment_height: "100",
        weight: "",
        shipping_mode: "Surface",
        address_type: ""
      }
    ],
    pickup_location: {
      name: "warehouse_name"
    }
  };

  try {
    const response = await delhiveryService.createShipment(shipmentData);
    console.log('Shipment created successfully:', response);
  } catch (error) {
    console.error('Error creating shipment:', error);
  }
}

// Direct axios example (for reference - not recommended due to CORS)
// The Edge Function handles this automatically, but here's the format it uses:
/*
import axios from 'axios';

const options = {
  method: 'POST',
  url: 'https://staging-express.delhivery.com/api/cmu/create.json',
  headers: {
    Authorization: 'Token YOUR_API_TOKEN',
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'  // URL-encoded format
  },
  data: 'format=json&data=' + encodeURIComponent(JSON.stringify({
    shipments: [...],
    pickup_location: {...}
  }))
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/

export { createShipmentExample };
