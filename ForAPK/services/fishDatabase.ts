// Offline Fish Database Service
// Provides access to 2500+ Indian fish species data without internet

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

  constructor() {
    // Automatically preload on instantiation for faster access
    // This is non-blocking and happens in the background
    if (typeof global !== "undefined") {
      // Start preloading immediately but don't await
      setTimeout(() => this.initialize().catch(console.error), 0);
    }
  }

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
      const startTime = Date.now();
      console.log("🐟 Loading fish database...");

      // Use dynamic import for better performance
      const fishDatabase = require("@/assets/fish_database.json");

      // Immediately mark as initialized
      this.database = fishDatabase as FishSpecies[];
      this.initialized = true;

      const loadTime = Date.now() - startTime;
      console.log(
        `✅ Fish database loaded: ${this.database.length} species (${loadTime}ms)`
      );

      // Clear the promise so it can be garbage collected
      this.initPromise = null;
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
  async getAllSpecies(): Promise<FishSpecies[]> {
    await this.ensureInitialized();
    return this.database || [];
  }

  /**
   * Get fish by ID
   */
  async getSpeciesById(id: number): Promise<FishSpecies | undefined> {
    await this.ensureInitialized();
    return this.database?.find((fish) => fish.id === id);
  }

  /**
   * Search fish by name (fuzzy search)
   */
  async searchByName(query: string): Promise<FishSpecies[]> {
    await this.ensureInitialized();

    if (!query || query.trim().length === 0) {
      return this.database || [];
    }

    const searchTerm = query.toLowerCase().trim();

    return (this.database || []).filter((fish) => {
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
  async filterByHabitat(
    habitat: "Freshwater" | "Marine" | "Brackish"
  ): Promise<FishSpecies[]> {
    await this.ensureInitialized();
    return (this.database || []).filter((fish) => fish.habitat === habitat);
  }

  /**
   * Filter by region (sync - call after initialization)
   */
  filterByRegion(region: string): FishSpecies[] {
    if (!this.initialized || !this.database) return [];
    const searchRegion = region.toLowerCase();
    return this.database.filter((fish) =>
      fish.native_regions.some((r) => r.toLowerCase().includes(searchRegion))
    );
  }

  /**
   * Filter by family (sync - call after initialization)
   */
  filterByFamily(family: string): FishSpecies[] {
    if (!this.initialized || !this.database) return [];
    return this.database.filter(
      (fish) => fish.family.toLowerCase() === family.toLowerCase()
    );
  }

  /**
   * Get fish by conservation status (sync - call after initialization)
   */
  filterByConservationStatus(status: string): FishSpecies[] {
    if (!this.initialized || !this.database) return [];
    return this.database.filter((fish) =>
      fish.conservation_status.toLowerCase().includes(status.toLowerCase())
    );
  }

  /**
   * Get all unique habitats (sync - call after initialization)
   */
  getHabitats(): string[] {
    if (!this.initialized || !this.database) return [];
    return Array.from(new Set(this.database.map((f) => f.habitat)));
  }

  /**
   * Get all unique regions (sync - call after initialization)
   */
  getRegions(): string[] {
    if (!this.initialized || !this.database) return [];
    const allRegions = this.database.flatMap((f) => f.native_regions);
    return Array.from(new Set(allRegions)).sort();
  }

  /**
   * Get all unique families (sync - call after initialization)
   */
  getFamilies(): string[] {
    if (!this.initialized || !this.database) return [];
    return Array.from(new Set(this.database.map((f) => f.family))).sort();
  }

  /**
   * Get random fish species
   */
  async getRandomSpecies(count: number = 10): Promise<FishSpecies[]> {
    await this.ensureInitialized();
    const shuffled = [...(this.database || [])].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get featured/popular species (sync - call after initialization)
   */
  getFeaturedSpecies(): FishSpecies[] {
    if (!this.initialized || !this.database) return [];
    // Return species with high commercial importance
    return this.database
      .filter((fish) =>
        fish.commercial_importance.toLowerCase().includes("high")
      )
      .slice(0, 20);
  }

  /**
   * Advanced filter with multiple criteria (sync - call after initialization)
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
    if (!this.initialized || !this.database) return [];
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
   * Get popular places (regions with most species) - offline
   */
  getPopularPlaces(limit: number = 6): Array<{
    id: string;
    name: string;
    region: string;
    fish_species_count: number;
    image_url: string;
    description: string;
  }> {
    if (!this.initialized || !this.database) return [];

    // Get region counts
    const regionCounts = this.getStatistics().byRegion;

    // Create place objects with images and descriptions
    const places = Object.entries(regionCounts)
      .map(([region, count]) => ({
        id: region.toLowerCase().replace(/\s+/g, "-"),
        name: region,
        region: region,
        fish_species_count: count,
        image_url: this.getRegionImage(region),
        description: this.getRegionDescription(region),
      }))
      .sort((a, b) => b.fish_species_count - a.fish_species_count)
      .slice(0, limit);

    return places;
  }

  /**
   * Get default image for a region
   */
  private getRegionImage(region: string): string {
    const regionImages: Record<string, string> = {
      Kerala: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
      Ganges:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      "Bay of Bengal":
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400",
      "Arabian Sea":
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
      Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400",
      "Andaman Islands":
        "https://images.unsplash.com/photo-1540202404-a2f2a7275e22?w=400",
      "Indian Ocean":
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400",
      "Western Ghats":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "Eastern Ghats":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      Brahmaputra:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Godavari:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Krishna:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Mahanadi:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Cauvery:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Narmada:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Tapti:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      Yamuna:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      "Chilika Lake":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "Vembanad Lake":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "Dal Lake":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    };

    // Check for exact match
    if (regionImages[region]) {
      return regionImages[region];
    }

    // Check for partial match
    const matchingKey = Object.keys(regionImages).find(
      (key) =>
        region.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(region.toLowerCase())
    );

    if (matchingKey) {
      return regionImages[matchingKey];
    }

    // Default images based on keywords
    if (region.toLowerCase().includes("lake")) {
      return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";
    } else if (region.toLowerCase().includes("river")) {
      return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400";
    } else if (
      region.toLowerCase().includes("sea") ||
      region.toLowerCase().includes("ocean")
    ) {
      return "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400";
    } else if (region.toLowerCase().includes("coast")) {
      return "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400";
    }

    // Default fallback
    return "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400";
  }

  /**
   * Get description for a region
   */
  private getRegionDescription(region: string): string {
    const descriptions: Record<string, string> = {
      Kerala: "Rich marine biodiversity along the Arabian Sea coast",
      Ganges: "One of the most sacred rivers with diverse freshwater species",
      "Bay of Bengal": "Largest bay in the world with abundant marine life",
      "Arabian Sea": "Western coastal waters with diverse marine ecosystems",
      Goa: "Popular coastal destination with vibrant fishing culture",
      "Andaman Islands": "Pristine coral reefs and diverse marine ecosystem",
      "Indian Ocean": "Vast oceanic region with incredible biodiversity",
      "Western Ghats": "Mountain range with unique freshwater species",
      Brahmaputra: "Major river system flowing through Northeast India",
      "Chilika Lake": "Asia's largest brackish water lagoon",
    };

    if (descriptions[region]) {
      return descriptions[region];
    }

    // Generate generic description
    if (region.toLowerCase().includes("lake")) {
      return `Freshwater lake ecosystem with diverse aquatic life`;
    } else if (region.toLowerCase().includes("river")) {
      return `River system supporting various fish species`;
    } else if (
      region.toLowerCase().includes("sea") ||
      region.toLowerCase().includes("ocean")
    ) {
      return `Marine waters with rich biodiversity`;
    } else if (region.toLowerCase().includes("coast")) {
      return `Coastal region with diverse marine species`;
    }

    return `Region with unique fish species`;
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
