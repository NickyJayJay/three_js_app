import { DetectedPocket } from './pocketDetection';

/**
 * Check if an entity is part of any pocket
 * @param entityId - The entity ID to check
 * @param detectedPockets - Array of detected pockets
 * @returns Object with isPocket flag and pocket info
 */
export function getEntityPocketInfo(
    entityId: string,
    detectedPockets: DetectedPocket[]
): { isPocket: boolean; pocketId?: number; entityIndex?: number; } {
    for (const pocket of detectedPockets) {
        const entityIndex = pocket.entityIds.indexOf(entityId);
        if (entityIndex !== -1) {
            return {
                isPocket: true,
                pocketId: pocket.id,
                entityIndex
            };
        }
    }
    return { isPocket: false };
}