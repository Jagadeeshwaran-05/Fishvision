"""
Split large fish database into smaller chunks for efficient loading
This prevents app crashes while maintaining offline capability
"""

import json
import os

def split_database_into_chunks():
    """Split the large database into manageable chunks"""
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'fish_database_1000plus.json')
    
    # Load the large database
    with open(db_path, 'r', encoding='utf-8') as f:
        all_fish = json.load(f)
    
    print(f"📦 Loading {len(all_fish)} species...")
    
    # Create chunks of 100 species each
    chunk_size = 100
    chunks = []
    
    for i in range(0, len(all_fish), chunk_size):
        chunk = all_fish[i:i + chunk_size]
        chunks.append(chunk)
    
    # Create output directory
    output_dir = 'fish_database_chunks'
    os.makedirs(output_dir, exist_ok=True)
    
    # Save each chunk
    for idx, chunk in enumerate(chunks):
        chunk_file = f'{output_dir}/fish_chunk_{idx:02d}.json'
        with open(chunk_file, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, indent=2, ensure_ascii=False)
        print(f"✅ Chunk {idx + 1}/{len(chunks)}: {len(chunk)} species -> {chunk_file}")
    
    # Create index file with metadata
    index = {
        "total_species": len(all_fish),
        "total_chunks": len(chunks),
        "chunk_size": chunk_size,
        "chunks": [
            {
                "chunk_id": idx,
                "file": f"fish_chunk_{idx:02d}.json",
                "species_count": len(chunk),
                "start_id": chunk[0]["id"],
                "end_id": chunk[-1]["id"]
            }
            for idx, chunk in enumerate(chunks)
        ],
        "statistics": {
            "freshwater": sum(1 for f in all_fish if f["habitat"] == "Freshwater"),
            "marine": sum(1 for f in all_fish if f["habitat"] == "Marine"),
            "brackish": sum(1 for f in all_fish if f["habitat"] == "Brackish")
        }
    }
    
    index_file = f'{output_dir}/index.json'
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n📊 Index file created: {index_file}")
    print(f"✨ Total: {len(chunks)} chunks with {len(all_fish)} species")
    print(f"   Each chunk: ~{chunk_size} species")
    print(f"   Freshwater: {index['statistics']['freshwater']}")
    print(f"   Marine: {index['statistics']['marine']}")
    print(f"   Brackish: {index['statistics']['brackish']}")

if __name__ == "__main__":
    print("🔨 Splitting fish database into optimized chunks...\n")
    split_database_into_chunks()
    print("\n✅ Database ready for efficient offline loading!")
