// Offline Fish Database Service
// Provides access to 1050+ Indian fish species data without internet

export interface FishSpecies {
  id: number;
  name: string;
  scientific_name: string;
  common_names: string[];
  family: string;
  habitat: "Freshwater" | "Marine" | "Brackish";
  native_regions: string[];
  max_length_cm: number;
  max_weight_kg: number;
  max_age_years: number;
  diet: string;
  conservation_status: string;
  commercial_importance: string;
  description: string;
  image_url: string;
}

export interface FishDatabase {
  species: FishSpecies[];
  stats: {
    total: number;
    byHabitat: Record<string, number>;
    byFamily: Record<string, number>;
  };
}

class FishDatabaseService {
  private database: FishSpecies[] | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {}

  /**
   * Initialize the database (lazy loads from bundled JSON)
   */
  async initialize(): Promise<void> {
    // Return existing initialization promise if already loading
    if (this.initPromise) {
      return this.initPromise;
    }

    // Already initialized
    if (this.initialized && this.database) {
      return Promise.resolve();
    }

    // Create and cache the initialization promise
    this.initPromise = this._loadDatabase();
    return this.initPromise;
  }

  private async _loadDatabase(): Promise<void> {
    try {
      console.log("🐟 Loading fish database...");
      const startTime = Date.now();

      // Lazy load the JSON file
      const fishDatabase = require("@/assets/fish_database.json");

      this.database = fishDatabase as FishSpecies[];
      this.initialized = true;

      const loadTime = Date.now() - startTime;
      console.log(
        `✅ Fish database loaded: ${this.database.length} species (${loadTime}ms)`
      );
    } catch (error) {
      console.error("❌ Error loading fish database:", error);
      this.initialized = false;
      this.database = null;
      this.initPromise = null;
      throw new Error("Failed to load fish database");
    }
  }

  /**
   * Ensure database is loaded before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.database) {
      await this.initialize();
    }
  }

  /**
   * Get all fish species
   */
  getAllSpecies(): FishSpecies[] {
    if (!this.database) return [];
    return this.database;
  }

  /**
   * Get fish by ID
   */
  getSpeciesById(id: number): FishSpecies | undefined {
    if (!this.database) return undefined;
    return this.database.find((fish) => fish.id === id);
  }

  /**
   * Search fish by name (fuzzy search)
   */
  searchByName(query: string): FishSpecies[] {
    if (!this.database) return [];

    if (!query || query.trim().length === 0) {
      return this.database;
    }

    const searchTerm = query.toLowerCase().trim();

    return this.database.filter((fish) => {
      // Search in name
      if (fish.name.toLowerCase().includes(searchTerm)) return true;

      // Search in scientific name
      if (fish.scientific_name.toLowerCase().includes(searchTerm)) return true;

      // Search in common names
      if (
        fish.common_names.some((name) =>
          name.toLowerCase().includes(searchTerm)
        )
      )
        return true;

      // Search in family
      if (fish.family.toLowerCase().includes(searchTerm)) return true;

      return false;
    });
  }

  /**
   * Filter by habitat
   */
  filterByHabitat(
    habitat: "Freshwater" | "Marine" | "Brackish"
  ): FishSpecies[] {
    if (!this.database) return [];
    return this.database.filter((fish) => fish.habitat === habitat);
  }

  /**
   * Filter by region
   */
  filterByRegion(region: string): FishSpecies[] {
    if (!this.database) return [];
    const searchRegion = region.toLowerCase();
    return this.database.filter((fish) =>
      fish.native_regions.some((r) => r.toLowerCase().includes(searchRegion))
    );
  }

  /**
   * Filter by family
   */
  filterByFamily(family: string): FishSpecies[] {
    if (!this.database) return [];
    return this.database.filter(
      (fish) => fish.family.toLowerCase() === family.toLowerCase()
    );
  }

  /**
   * Get fish by conservation status
   */
  filterByConservationStatus(status: string): FishSpecies[] {
    if (!this.database) return [];
    return this.database.filter((fish) =>
      fish.conservation_status.toLowerCase().includes(status.toLowerCase())
    );
  }

  /**
   * Get all unique habitats
   */
  getHabitats(): string[] {
    if (!this.database) return [];
    return Array.from(new Set(this.database.map((f) => f.habitat)));
  }

  /**
   * Get all unique regions
   */
  getRegions(): string[] {
    if (!this.database) return [];
    const allRegions = this.database.flatMap((f) => f.native_regions);
    return Array.from(new Set(allRegions)).sort();
  }

  /**
   * Get all unique families
   */
  getFamilies(): string[] {
    if (!this.database) return [];
    return Array.from(new Set(this.database.map((f) => f.family))).sort();
  }

  /**
   * Get random fish species
   */
  getRandomSpecies(count: number = 10): FishSpecies[] {
    if (!this.database) return [];
    const shuffled = [...this.database].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get featured/popular species
   */
  getFeaturedSpecies(): FishSpecies[] {
    if (!this.database) return [];
    // Return species with high commercial importance
    return this.database
      .filter((fish) =>
        fish.commercial_importance.toLowerCase().includes("high")
      )
      .slice(0, 20);
  }

  /**
   * Advanced filter with multiple criteria
   */
  advancedFilter(criteria: {
    habitat?: string;
    region?: string;
    family?: string;
    minLength?: number;
    maxLength?: number;
    minWeight?: number;
    maxWeight?: number;
    conservationStatus?: string;
  }): FishSpecies[] {
    if (!this.database) return [];
    return this.database.filter((fish) => {
      // Habitat filter
      if (criteria.habitat && fish.habitat !== criteria.habitat) {
        return false;
      }

      // Region filter
      if (
        criteria.region &&
        !fish.native_regions.some((r) =>
          r.toLowerCase().includes(criteria.region!.toLowerCase())
        )
      ) {
        return false;
      }

      // Family filter
      if (criteria.family && fish.family !== criteria.family) {
        return false;
      }

      // Length filters
      if (criteria.minLength && fish.max_length_cm < criteria.minLength) {
        return false;
      }
      if (criteria.maxLength && fish.max_length_cm > criteria.maxLength) {
        return false;
      }

      // Weight filters
      if (criteria.minWeight && fish.max_weight_kg < criteria.minWeight) {
        return false;
      }
      if (criteria.maxWeight && fish.max_weight_kg > criteria.maxWeight) {
        return false;
      }

      // Conservation status filter
      if (
        criteria.conservationStatus &&
        !fish.conservation_status
          .toLowerCase()
          .includes(criteria.conservationStatus.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get database statistics
   */
  getStatistics() {
    if (!this.database || this.database.length === 0) {
      return {
        total: 0,
        byHabitat: {},
        byFamily: {},
        byConservationStatus: {},
        byRegion: {},
        averageLength: 0,
        averageWeight: 0,
        averageAge: 0,
        largestFish: null,
        heaviestFish: null,
        oldestFish: null,
      };
    }

    const stats = {
      total: this.database.length,
      byHabitat: {} as Record<string, number>,
      byFamily: {} as Record<string, number>,
      byConservationStatus: {} as Record<string, number>,
      byRegion: {} as Record<string, number>,
      averageLength: 0,
      averageWeight: 0,
      averageAge: 0,
      largestFish: null as FishSpecies | null,
      heaviestFish: null as FishSpecies | null,
      oldestFish: null as FishSpecies | null,
    };

    // Calculate statistics
    this.database.forEach((fish) => {
      // By habitat
      stats.byHabitat[fish.habitat] = (stats.byHabitat[fish.habitat] || 0) + 1;

      // By family
      stats.byFamily[fish.family] = (stats.byFamily[fish.family] || 0) + 1;

      // By conservation status
      stats.byConservationStatus[fish.conservation_status] =
        (stats.byConservationStatus[fish.conservation_status] || 0) + 1;

      // By region
      fish.native_regions.forEach((region) => {
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
      });
    });

    // Calculate averages
    stats.averageLength =
      this.database.reduce((sum, f) => sum + f.max_length_cm, 0) /
      this.database.length;
    stats.averageWeight =
      this.database.reduce((sum, f) => sum + f.max_weight_kg, 0) /
      this.database.length;
    stats.averageAge =
      this.database.reduce((sum, f) => sum + f.max_age_years, 0) /
      this.database.length;

    // Find extremes
    stats.largestFish = this.database.reduce((max, fish) =>
      fish.max_length_cm > (max?.max_length_cm || 0) ? fish : max
    );
    stats.heaviestFish = this.database.reduce((max, fish) =>
      fish.max_weight_kg > (max?.max_weight_kg || 0) ? fish : max
    );
    stats.oldestFish = this.database.reduce((max, fish) =>
      fish.max_age_years > (max?.max_age_years || 0) ? fish : max
    );

    return stats;
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const fishDb = new FishDatabaseService();

export default fishDb;
