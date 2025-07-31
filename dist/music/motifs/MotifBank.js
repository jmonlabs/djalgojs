/**
 * Motif bank system for storing and searching musical patterns
 * Based on the Python djalgo MotifBank implementation
 */
export class MotifBank {
    constructor(motifs = []) {
        this.motifs = motifs;
    }
    /**
     * Load motifs from JSON data
     */
    static fromJSON(jsonData) {
        const motifs = jsonData.map(data => ({
            id: data.id || Math.random().toString(36).substr(2, 9),
            name: data.name || 'Untitled',
            artist: data.artist,
            instrument: data.instrument || 'piano',
            scale: data.scale || 'major',
            tags: data.tags || [],
            measures: data.measures || 1,
            notes: data.notes || [],
            metadata: data.metadata
        }));
        return new MotifBank(motifs);
    }
    /**
     * Get total number of motifs
     */
    get length() {
        return this.motifs.length;
    }
    /**
     * Get motif by index
     */
    get(index) {
        return this.motifs[index];
    }
    /**
     * Get motif by ID
     */
    getById(id) {
        return this.motifs.find(motif => motif.id === id);
    }
    /**
     * Get all motifs
     */
    all() {
        return [...this.motifs];
    }
    /**
     * Add a new motif
     */
    add(motif) {
        // Ensure unique ID
        if (this.motifs.some(m => m.id === motif.id)) {
            motif.id = Math.random().toString(36).substr(2, 9);
        }
        this.motifs.push(motif);
    }
    /**
     * Remove motif by ID
     */
    remove(id) {
        const index = this.motifs.findIndex(motif => motif.id === id);
        if (index !== -1) {
            this.motifs.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Update existing motif
     */
    update(id, updates) {
        const motif = this.getById(id);
        if (motif) {
            Object.assign(motif, updates);
            return true;
        }
        return false;
    }
    /**
     * Find motifs by artist
     */
    byArtist(artist) {
        const artistLower = artist.toLowerCase();
        return this.motifs.filter(motif => motif.artist?.toLowerCase() === artistLower);
    }
    /**
     * Find motifs by instrument
     */
    byInstrument(instrument) {
        const instrumentLower = instrument.toLowerCase();
        return this.motifs.filter(motif => motif.instrument.toLowerCase().includes(instrumentLower));
    }
    /**
     * Find motifs by scale
     */
    byScale(scale) {
        const scaleLower = scale.toLowerCase();
        return this.motifs.filter(motif => motif.scale.toLowerCase() === scaleLower);
    }
    /**
     * Find motifs by tag
     */
    byTag(tag) {
        const tagLower = tag.toLowerCase();
        return this.motifs.filter(motif => motif.tags.some(t => t.toLowerCase().includes(tagLower)));
    }
    /**
     * Find motifs by measure range
     */
    byMeasureRange(minMeasures, maxMeasures) {
        return this.motifs.filter(motif => {
            if (minMeasures !== undefined && motif.measures < minMeasures) {
                return false;
            }
            if (maxMeasures !== undefined && motif.measures > maxMeasures) {
                return false;
            }
            return true;
        });
    }
    /**
     * Comprehensive search with multiple criteria
     */
    search(options) {
        let results = [...this.motifs];
        if (options.artist) {
            const artistLower = options.artist.toLowerCase();
            results = results.filter(motif => motif.artist?.toLowerCase() === artistLower);
        }
        if (options.instrument) {
            const instrumentLower = options.instrument.toLowerCase();
            results = results.filter(motif => motif.instrument.toLowerCase().includes(instrumentLower));
        }
        if (options.scale) {
            const scaleLower = options.scale.toLowerCase();
            results = results.filter(motif => motif.scale.toLowerCase() === scaleLower);
        }
        if (options.tag) {
            const tagLower = options.tag.toLowerCase();
            results = results.filter(motif => motif.tags.some(t => t.toLowerCase().includes(tagLower)));
        }
        if (options.minMeasures !== undefined) {
            results = results.filter(motif => motif.measures >= options.minMeasures);
        }
        if (options.maxMeasures !== undefined) {
            results = results.filter(motif => motif.measures <= options.maxMeasures);
        }
        return results;
    }
    /**
     * Get random motif
     */
    random() {
        if (this.motifs.length === 0)
            return undefined;
        const index = Math.floor(Math.random() * this.motifs.length);
        return this.motifs[index];
    }
    /**
     * Get random motifs matching criteria
     */
    randomSearch(options, count = 1) {
        const candidates = this.search(options);
        if (candidates.length === 0)
            return [];
        const results = [];
        const used = new Set();
        for (let i = 0; i < Math.min(count, candidates.length); i++) {
            let motif;
            do {
                motif = candidates[Math.floor(Math.random() * candidates.length)];
            } while (used.has(motif.id) && used.size < candidates.length);
            if (!used.has(motif.id)) {
                results.push(motif);
                used.add(motif.id);
            }
        }
        return results;
    }
    /**
     * Find similar motifs based on musical characteristics
     */
    findSimilar(targetMotif, threshold = 0.7) {
        return this.motifs.filter(motif => {
            if (motif.id === targetMotif.id)
                return false;
            let similarity = 0;
            let factors = 0;
            // Scale similarity
            if (motif.scale === targetMotif.scale) {
                similarity += 0.3;
            }
            factors += 0.3;
            // Instrument similarity
            if (motif.instrument === targetMotif.instrument) {
                similarity += 0.2;
            }
            factors += 0.2;
            // Measure similarity
            const measureDiff = Math.abs(motif.measures - targetMotif.measures);
            const measureSimilarity = Math.max(0, 1 - measureDiff / Math.max(motif.measures, targetMotif.measures));
            similarity += measureSimilarity * 0.2;
            factors += 0.2;
            // Tag similarity
            const commonTags = motif.tags.filter(tag => targetMotif.tags.includes(tag));
            const tagSimilarity = commonTags.length / Math.max(motif.tags.length, targetMotif.tags.length, 1);
            similarity += tagSimilarity * 0.3;
            factors += 0.3;
            return (similarity / factors) >= threshold;
        });
    }
    /**
     * Group motifs by a specific property
     */
    groupBy(property) {
        const groups = {};
        for (const motif of this.motifs) {
            const key = String(motif[property] || 'unknown');
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(motif);
        }
        return groups;
    }
    /**
     * Get statistics about the motif collection
     */
    getStats() {
        const byInstrument = {};
        const byScale = {};
        const byArtist = {};
        const tagCounts = {};
        let totalMeasures = 0;
        for (const motif of this.motifs) {
            // Instrument stats
            byInstrument[motif.instrument] = (byInstrument[motif.instrument] || 0) + 1;
            // Scale stats
            byScale[motif.scale] = (byScale[motif.scale] || 0) + 1;
            // Artist stats
            if (motif.artist) {
                byArtist[motif.artist] = (byArtist[motif.artist] || 0) + 1;
            }
            // Tag stats
            for (const tag of motif.tags) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
            totalMeasures += motif.measures;
        }
        const mostCommonTags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            total: this.motifs.length,
            byInstrument,
            byScale,
            byArtist,
            averageMeasures: this.motifs.length > 0 ? totalMeasures / this.motifs.length : 0,
            mostCommonTags
        };
    }
    /**
     * Export motifs to JSON
     */
    toJSON() {
        return this.motifs.map(motif => ({ ...motif }));
    }
    /**
     * Clear all motifs
     */
    clear() {
        this.motifs = [];
    }
    /**
     * Clone the motif bank
     */
    clone() {
        const clonedMotifs = this.motifs.map(motif => ({
            ...motif,
            notes: motif.notes.map(note => ({ ...note })),
            tags: [...motif.tags],
            metadata: motif.metadata ? { ...motif.metadata } : undefined
        }));
        return new MotifBank(clonedMotifs);
    }
}
