// Optimized Offline Fish Database Service
// Loads 1000+ species efficiently using chunked loading

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

interface ChunkIndex {
  total_species: number;
  total_chunks: number;
  chunk_size: number;
  chunks: Array<{
    chunk_id: number;
    file: string;
    species_count: number;
    start_id: number;
    end_id: number;
  }>;
  statistics: {
    freshwater: number;
    marine: number;
    brackish: number;
  };
}

class OptimizedFishDatabaseService {
  private loadedChunks: Map<number, FishSpecies[]> = new Map();
  private index: ChunkIndex | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the database by loading the index
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.index) {
      return;
    }

    try {
      console.log("🐟 Loading fish database index...");
      const startTime = Date.now();

      // Load only the index file (small, ~2KB)
      this.index = require("@/assets/fish_database_chunks/index.json");

      this.initialized = true;
      const loadTime = Date.now() - startTime;

      if (this.index) {
        console.log(
          `✅ Database index loaded: ${this.index.total_species} species in ${this.index.total_chunks} chunks (${loadTime}ms)`
        );
      }
    } catch (error) {
      console.error("❌ Error loading fish database index:", error);
      throw new Error("Failed to load fish database index");
    }
  }

  /**
   * Load a specific chunk on demand
   */
  private async loadChunk(chunkId: number): Promise<FishSpecies[]> {
    // Return cached chunk if already loaded
    if (this.loadedChunks.has(chunkId)) {
      return this.loadedChunks.get(chunkId)!;
    }

    try {
      const chunkFile = `fish_chunk_${chunkId.toString().padStart(2, "0")}`;
      const chunk = require(`@/assets/fish_database_chunks/${chunkFile}.json`);

      // Cache the loaded chunk
      this.loadedChunks.set(chunkId, chunk);
      console.log(`📦 Loaded chunk ${chunkId}: ${chunk.length} species`);

      return chunk;
    } catch (error) {
      console.error(`❌ Error loading chunk ${chunkId}:`, error);
      return [];
    }
  }

  /**
   * Get all species (loads all chunks)
   */
  async getAllSpecies(): Promise<FishSpecies[]> {
    if (!this.index) {
      await this.initialize();
    }

    const allSpecies: FishSpecies[] = [];

    // Load all chunks
    for (let i = 0; i < this.index!.total_chunks; i++) {
      const chunk = await this.loadChunk(i);
      allSpecies.push(...chunk);
    }

    return allSpecies;
  }

  /**
   * Get species paginated (efficient for lists)
   */
  async getSpeciesPaginated(
    page: number,
    pageSize: number = 20
  ): Promise<FishSpecies[]> {
    if (!this.index) {
      await this.initialize();
    }

    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    // Calculate which chunks we need
    const startChunk = Math.floor(startIndex / this.index!.chunk_size);
    const endChunk = Math.floor(endIndex / this.index!.chunk_size);

    const species: FishSpecies[] = [];

    for (
      let chunkId = startChunk;
      chunkId <= endChunk && chunkId < this.index!.total_chunks;
      chunkId++
    ) {
      const chunk = await this.loadChunk(chunkId);
      species.push(...chunk);
    }

    // Slice to exact page size
    const offset = startIndex % this.index!.chunk_size;
    return species.slice(offset, offset + pageSize);
  }

  /**
   * Get fish by ID (loads only necessary chunk)
   */
  async getSpeciesById(id: number): Promise<FishSpecies | undefined> {
    if (!this.index) {
      await this.initialize();
    }

    // Find which chunk contains this ID
    const chunkInfo = this.index!.chunks.find(
      (c) => id >= c.start_id && id <= c.end_id
    );

    if (!chunkInfo) {
      return undefined;
    }

    // Load only that chunk
    const chunk = await this.loadChunk(chunkInfo.chunk_id);
    return chunk.find((fish) => fish.id === id);
  }

  /**
   * Search fish by name (loads chunks as needed)
   */
  async searchByName(query: string): Promise<FishSpecies[]> {
    if (!query || query.trim().length === 0) {
      // Return first 20 species for empty query
      return this.getSpeciesPaginated(0, 20);
    }

    const searchTerm = query.toLowerCase().trim();
    const results: FishSpecies[] = [];

    // Load all chunks and search
    const allSpecies = await this.getAllSpecies();

    return allSpecies.filter((fish) => {
      if (fish.name.toLowerCase().includes(searchTerm)) return true;
      if (fish.scientific_name.toLowerCase().includes(searchTerm)) return true;
      if (
        fish.common_names.some((name) =>
          name.toLowerCase().includes(searchTerm)
        )
      )
        return true;
      if (fish.family.toLowerCase().includes(searchTerm)) return true;
      return false;
    });
  }

  /**
   * Filter by habitat (loads all chunks)
   */
  async filterByHabitat(
    habitat: "Freshwater" | "Marine" | "Brackish"
  ): Promise<FishSpecies[]> {
    const allSpecies = await this.getAllSpecies();
    return allSpecies.filter((fish) => fish.habitat === habitat);
  }

  /**
   * Get database statistics (from index, no loading needed)
   */
  getStatistics() {
    if (!this.index) {
      return {
        total: 0,
        byHabitat: { Freshwater: 0, Marine: 0, Brackish: 0 },
      };
    }

    return {
      total: this.index.total_species,
      byHabitat: {
        Freshwater: this.index.statistics.freshwater,
        Marine: this.index.statistics.marine,
        Brackish: this.index.statistics.brackish,
      },
    };
  }

  /**
   * Get random species (loads random chunks)
   */
  async getRandomSpecies(count: number = 10): Promise<FishSpecies[]> {
    if (!this.index) {
      await this.initialize();
    }

    // Load a random chunk
    const randomChunkId = Math.floor(Math.random() * this.index!.total_chunks);
    const chunk = await this.loadChunk(randomChunkId);

    // Shuffle and return random species
    const shuffled = [...chunk].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Clear loaded chunks to free memory
   */
  clearCache() {
    this.loadedChunks.clear();
    console.log("🗑️ Chunk cache cleared");
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const fishDb = new OptimizedFishDatabaseService();

export default fishDb;
