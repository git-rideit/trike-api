import FareConfig from '../models/fare_config.model';

const BARANGAY_DISTANCES: { [key: string]: number } = {
    'Adia Bitaog': 24,
    'Anonangin': 31,
    'Bagong Buhay': 0.8,
    'Bamban': 6.8,
    'Bantad': 20,
    'Batong Dalig': 6.5,
    'Biga': 15,
    'Binambang': 12,
    'Buensuceso': 4.7,
    'Bungahan': 12,
    'Butaguin': 3.2,
    'Calumangin': 0.75,
    'Camohaguin': 8.5,
    'Casasahan Ibaba': 22,
    'Casasahan Ilaya': 27,
    'Cawayan': 21,
    'Gayagayaan': 22,
    'Gitnang Barrio': 11,
    'Hardinan': 8.7,
    'Inaclagan': 7.9,
    'Inagbuhan Ilaya': 5.9,
    'Hagakhakin': 10,
    'Labnig': 7.4,
    'Laguna': 12,
    'Lagyo': 1.9,
    'Mabini': 1.2,
    'Mabunga': 15,
    'Malabtog': 7.8,
    'Manlayaan': 4.1,
    'Marcelo H. del Pilar': 12,
    'Mataas na Bundok': 9.8,
    'Maunlad': 0.4,
    'Pagsabangan': 14,
    'Panikihan': 5.1,
    'Peñafrancia': 0.95,
    'Pipisik': 0.5,
    'Progreso': 3.7,
    'Rizal': 0.5,
    'Rosario': 3.0,
    'San Agustin': 7.4,
    'San Diego (Población)': 0.22,
    'San Diego (Bukid)': 16,
    'San Isidro Kanluran': 19,
    'San Isidro Silangan': 9.8,
    'San Juan de Jesus': 5.3,
    'San Vicente': 13,
    'Sastre': 6.4,
    'Tabing Dagat': 0.22,
    'Tumayan': 13,
    'Villa Arcaya': 6.8,
    'Villa Bota': 4.6,
    'Villa Fuerte': 15,
    'Villa Mendoza': 12,
    'Villa Nava': 1.4,
    'Villa Padua': 6.3,
    'Villa Perez': 9.5,
    'Villa Principe': 7.7,
    'Villa Tañada': 18,
    'Villa Victoria': 12
};

export class FareService {
    static getDistance(barangay1: string, barangay2: string): number {
        // Normalize names (simple trimming and lowercase check could be added for robustness)
        const dist1 = this.findDistance(barangay1);
        const dist2 = this.findDistance(barangay2);

        if (dist1 === undefined || dist2 === undefined) {
            // Default or throw? Let's return a default safe distance or 0 if unknown
            // For now, if unknown, maybe assume town center (0)?
            // Better to handle gracefully.
            return 0; // Or handle error
        }

        // Simple calculation: absolute difference. 
        // Logic: All distances are from Poblacion (0).
        // If traveling from Brgy A to Brgy B, user might go via Poblacion.
        // Or if they are on same route. 
        // Without a graph, ABS(A-B) is optmistic (same radial line). A+B is pessimistic (via center).
        // Given 'trike', usually specialized trips. Let's start with ABS but maybe MAX(A, B) is safer base?
        // Let's stick to prompt: "distance in km = rate * distance". 
        // We'll use absolute difference for now assuming radial highway.
        return Math.abs(dist1 - dist2);
    }

    private static findDistance(name: string): number | undefined {
        // Direct match
        if (BARANGAY_DISTANCES[name]) return BARANGAY_DISTANCES[name];

        // Partial match? (e.g. "San Diego" matching "San Diego (Población)")
        const key = Object.keys(BARANGAY_DISTANCES).find(k => k.includes(name) || name.includes(k));
        return key ? BARANGAY_DISTANCES[key] : undefined;
    }

    static async calculateFare(pickup: string, dropoff: string): Promise<{ fare: number, distance: number }> {
        // Get config from DB or valid defaults
        const config = await FareConfig.findOne().sort({ createdAt: -1 });
        const baseFare = config ? config.baseFare : 12;
        const ratePerKm = config ? config.ratePerKm : 2;

        const distance = this.getDistance(pickup, dropoff);

        // Formula: Base + (Dist * Rate)
        // Usually Base covers the first few km? 
        // Prompt says: fare = base_fare + (distance_in_km * rate_per_km)
        // This implies Base is a fix starting fee, and every km is added.

        const fare = baseFare + (distance * ratePerKm);

        return {
            fare: Math.ceil(fare), // Round up to nearest peso
            distance
        };
    }
}
