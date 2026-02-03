
import mongoose from 'mongoose';
import Booking from '../src/models/booking.model';

// Mock the Booking model usage without connecting to DB
async function run() {
    const mockPickup = {
        address: "Test Pickup",
        coordinates: [121.0, 14.5] // [lng, lat]
    };
    const mockDropoff = {
        address: "Test Dropoff",
        coordinates: [121.1, 14.6] // [lng, lat]
    };

    const booking = new Booking({
        user: new mongoose.Types.ObjectId(),
        pickupLocation: mockPickup,
        dropoffLocation: mockDropoff,
        fare: 50,
        distance: 5,
        paymentMethod: 'cash',
        status: 'pending'
    });

    const json = booking.toJSON();
    console.log("Booking JSON Reulst:");
    console.log(JSON.stringify(json, null, 2));

    // Check type of coordinates
    console.log("\nType Checks:");
    console.log("pickupLocation.coordinates is Array?", Array.isArray(json.pickupLocation.coordinates));
    // @ts-ignore
    console.log("pickupLocation.coordinates.lat?", json.pickupLocation.coordinates.lat);
}

run().catch(console.error);
