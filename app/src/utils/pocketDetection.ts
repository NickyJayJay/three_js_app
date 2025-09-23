export const GraphEdgeType = {
    CONCAVE: 0,
    CONVEX: 1,
    TANGENTIAL: 2,
};

export type AdjacencyGraph = Record<string, string[]>;

export type EdgeMetadata = Record<string, number[]>;

export interface DetectedPocket {
    id: number;
    entityIds: string[];
    size: number;
    description: string;
}

export function buildConcaveAdjacencyGraph(
    adjacencyGraph: AdjacencyGraph,
    edgeMetadata: EdgeMetadata
): AdjacencyGraph {
    const concaveGraph: AdjacencyGraph = {};

    Object.keys(adjacencyGraph).forEach(entityId => {
        concaveGraph[entityId] = [];
    });

    Object.keys(adjacencyGraph).forEach(entityId => {
        const neighbors = adjacencyGraph[entityId];

        neighbors.forEach(neighborId => {
            const edgeKey = `${entityId}-${neighborId}`;
            const edgeTypes = edgeMetadata[edgeKey];

            if (edgeTypes && edgeTypes.includes(GraphEdgeType.CONCAVE)) {
                concaveGraph[entityId].push(neighborId);
            }
        });
    });

    return concaveGraph;
}

function depthFirstSearch(
    startEntityId: string,
    concaveGraph: AdjacencyGraph,
    visited: Set<string>
): string[] {
    const component: string[] = [];
    const stack: string[] = [startEntityId];

    while (stack.length > 0) {
        const currentEntityId = stack.pop()!;

        if (visited.has(currentEntityId)) {
            continue;
        }

        visited.add(currentEntityId);
        component.push(currentEntityId);

        const concaveNeighbors = concaveGraph[currentEntityId] || [];
        concaveNeighbors.forEach(neighborId => {
            if (!visited.has(neighborId)) {
                stack.push(neighborId);
            }
        });
    }

    return component;
}

/**
 * This algorithm identifies potential pockets by grouping faces (entities) that are 
 * connected through concave edges. The approach uses graph traversal to find 
 * connected components where edges between faces are marked as CONCAVE.
 * 
 * Assumptions:
 * - Pockets are characterized by faces connected via concave edges
 * - Single isolated faces are not considered pockets
 * - The algorithm prioritizes recall over precision (includes false positives)
 * 
 * @param adjacencyGraph Graph where keys are entity IDs and values are arrays of adjacent entity IDs
 * @param edgeMetadata Graph where keys are edge strings (format: "entityId1-entityId2") and values 
 * are arrays of GraphEdgeType
 *  * @param minPocketSize Minimum number of faces to consider a valid pocket (default: 3)
 * @returns Array of detected pockets sorted by size (largest first)
 */
export function detectPockets(
    adjacencyGraph: AdjacencyGraph,
    edgeMetadata: EdgeMetadata,
    minPocketSize: number = 3
): DetectedPocket[] {
    const visited = new Set<string>();
    const detectedPockets: DetectedPocket[] = [];
    let pocketId = 1;

    const concaveGraph = buildConcaveAdjacencyGraph(adjacencyGraph, edgeMetadata);
    Object.keys(concaveGraph).forEach(entityId => {
        if (!visited.has(entityId)) {
            const component = depthFirstSearch(entityId, concaveGraph, visited);

            if (component.length >= minPocketSize) {
                detectedPockets.push({
                    id: pocketId++,
                    entityIds: component.sort((a, b) => parseInt(a) - parseInt(b)),
                    size: component.length,
                    description: `Pocket with ${component.length} faces connected by concave edges`
                });
            }
        }
    });

    return detectedPockets.sort((a, b) => b.size - a.size);
}