# Design a Geospatial Index (Nearby Drivers)

In this challenge, you will design a system that efficiently finds the top $K$ drivers within a certain radius of a given latitude and longitude. This is a core component of ride-hailing services like Uber or Lyft.

### The Problem
Given millions of drivers whose positions are constantly updating, how do you handle:
1.  **Fast Updates**: Thousands of location updates per second.
2.  **Fast Queries**: Finding "nearby" drivers in less than 50ms.
3.  **Scalability**: Handling millions of drivers across the globe.

### Requirements
- Implement a `updateLocation(driverId: string, lat: number, lon: number)` function.
- Implement a `findNearbyDrivers(lat: number, lon: number, radius: number): string[]` function.

### Key Concepts to Explore
- **Geohashing**: Converting 2D coordinates into a 1D string where proximity in the string usually means proximity in space.
- **Quadtrees**: A tree data structure in which each internal node has exactly four children, used to partition a two-dimensional space.
- **Google S2 Geometry**: A library for spherical geometry that uses Hilbert curves.

### Example
**Input:**
`updateLocation("D1", 37.7749, -122.4194)` (San Francisco)
`findNearbyDrivers(37.7750, -122.4195, 1.0)`
**Output:**
`["D1"]`
