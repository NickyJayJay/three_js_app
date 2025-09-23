import rgbIdToEntityIdMap from '../../../data_dump/rgb_id_to_entity_id_map.json';
export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Converts RGB ID string (format: "r-g-b") to normalized RGB values for Three.js
 * @param rgbId - String in format "255-128-64" where values are 0-255
 * @returns RGBColor object with values normalized to 0-1 range
 */
function parseRgbId(rgbId: string): RGBColor {
    const [r, g, b] = rgbId.split('-').map(Number);

    return {
        r: r / 255,
        g: g / 255,
        b: b / 255
    };
}

/**
 * Gets all available RGB colors mapped to their entity IDs
 * @returns Map of entity ID to RGBColor
 */
export function getAllEntityColors(): Map<string, RGBColor> {
    const colorMap = new Map<string, RGBColor>();

    Object.entries(rgbIdToEntityIdMap).forEach(([rgbId, entityId]) => {
        colorMap.set(entityId, parseRgbId(rgbId));
    });

    return colorMap;
}