
import mongoose from 'mongoose';
import Booking from '../src/models/booking.model';
import DriverProfile from '../src/models/driver_profile.model';
import Report from '../src/models/report.model';

// Mock the model usage without connecting to DB
async function run() {
    console.log("--- BOOKING ---");
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

    const bookingJson = booking.toJSON() as any;
    if (bookingJson.pickupLocation) {
        console.log("Booking JSON Result:", JSON.stringify(bookingJson.pickupLocation.coordinates, null, 2));
    }


    console.log("\n--- DRIVER PROFILE ---");
    const driver = new DriverProfile({
        user: new mongoose.Types.ObjectId(),
        licenseNumber: "D123",
        licenseExpiry: new Date(),
        tricyclePlateNumber: "ABC 123",
        documents: [],
        isOnline: true,
        currentLocation: {
            type: "Point",
            coordinates: [123.0, 15.0]
        }
    });
    const driverJson = driver.toJSON() as any;
    if (driverJson.currentLocation) {
        console.log("Driver JSON Result:", JSON.stringify(driverJson.currentLocation.coordinates, null, 2));
    }


    console.log("\n--- REPORT ---");
    const report = new Report({
        reporter: new mongoose.Types.ObjectId(),
        type: 'complaint',
        category: 'rude',
        location: {
            type: "Point",
            coordinates: [124.0, 16.0]
        }
    });
    const reportJson = report.toJSON() as any;
    if (reportJson.location) {
        console.log("Report JSON Result:", JSON.stringify(reportJson.location.coordinates, null, 2));
    }
}

run().catch(console.error);
