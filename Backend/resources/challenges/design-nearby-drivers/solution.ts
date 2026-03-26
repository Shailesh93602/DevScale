/**
 * Conceptual implementation of a Geospatial Service using Geohashing.
 */

class GeospatialService {
  private driverLocations: Map<string, { lat: number; lon: number; hash: string }> = new Map();
  // Geohash -> Set of Driver IDs
  private grid: Map<string, Set<string>> = new Map();

  // 1. Location Update: O(1)
  public updateLocation(driverId: string, lat: number, lon: number) {
    const oldData = this.driverLocations.get(driverId);
    const newHash = this.computeGeohash(lat, lon, 6); // 6 precision ~= 1.2km grid

    if (oldData && oldData.hash !== newHash) {
      this.grid.get(oldData.hash)?.delete(driverId);
    }

    if (!this.grid.has(newHash)) {
      this.grid.set(newHash, new Set());
    }
    this.grid.get(newHash)!.add(driverId);

    this.driverLocations.set(driverId, { lat, lon, hash: newHash });
  }

  // 2. Querying: O(Grid Coverage)
  public findNearbyDrivers(lat: number, lon: number, radiusKm: number): string[] {
    const centerHash = this.computeGeohash(lat, lon, 6);
    const neighbors = this.getNeighbors(centerHash);
    const targetHashes = [centerHash, ...neighbors];

    const results: string[] = [];
    for (const hash of targetHashes) {
      const driversInCell = this.grid.get(hash);
      if (driversInCell) {
        for (const driverId of driversInCell) {
          const { lat: dLat, lon: dLon } = this.driverLocations.get(driverId)!;
          if (this.calculateDistance(lat, lon, dLat, dLon) <= radiusKm) {
            results.push(driverId);
          }
        }
      }
    }
    return results;
  }

  /**
   * Mock implementation of geohashing logic.
   * In reality, this involves interleaving bits of lat/lon and base32 encoding.
   */
  private computeGeohash(lat: number, lon: number, precision: number): string {
    // Conceptual placeholder
    const latIdx = Math.floor((lat + 90) * Math.pow(10, precision - 2));
    const lonIdx = Math.floor((lon + 180) * Math.pow(10, precision - 2));
    return `${latIdx}:${lonIdx}`;
  }

  private getNeighbors(hash: string): string[] {
    const [latIdx, lonIdx] = hash.split(':').map(Number);
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            neighbors.push(`${latIdx + i}:${lonIdx + j}`);
        }
    }
    return neighbors;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula placeholder
    const R = 6371; // Earth radius in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
