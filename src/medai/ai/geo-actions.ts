'use server';

export interface CareFacility {
    id: string;
    name: string;
    type: 'government_hospital' | 'private_clinic' | 'diagnostic_center';
    distance_km: number;
    travel_time_min: number;
    address: string;
    contact: string;
    rating: number;
    is_24_7: boolean;
    cost_tier: 'free' | 'low_cost' | 'private';
}

export async function findNearbyCare(latitude: number, longitude: number): Promise<CareFacility[]> {
    // In a real production app, this would be a PostGIS query
    // For this high-fidelity prototype/hackathon, we return mocked but realistic facility data

    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate DB latency

    return [
        {
            id: 'fac-001',
            name: 'Government Area Hospital',
            type: 'government_hospital',
            distance_km: 2.3,
            travel_time_min: 12,
            address: 'King Koti Road, Hyderabad',
            contact: '040-24600173',
            rating: 4.2,
            is_24_7: true,
            cost_tier: 'free',
        },
        {
            id: 'fac-002',
            name: 'Apollo Medical Centre',
            type: 'private_clinic',
            distance_km: 1.8,
            travel_time_min: 8,
            address: 'Jubilee Hills, Hyderabad',
            contact: '040-23607777',
            rating: 4.8,
            is_24_7: false,
            cost_tier: 'private',
        },
        {
            id: 'fac-003',
            name: 'Vijaya Diagnostic Center',
            type: 'diagnostic_center',
            distance_km: 3.1,
            travel_time_min: 15,
            address: 'Banjara Hills, Hyderabad',
            contact: '040-23420411',
            rating: 4.5,
            is_24_7: false,
            cost_tier: 'low_cost',
        },
    ];
}
