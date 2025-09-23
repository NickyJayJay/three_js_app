import './model.css';
import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { getAllEntityColors, RGBColor } from '../utils/rgbUtils';
import { getEntityPocketInfo } from '../utils/entityUtils';
import { detectPockets, DetectedPocket } from '../utils/pocketDetection';
import { PocketDetectionPanel } from '../components/PocketDetectionPanel';
import { EntityInfoPanel } from '../components/EntityInfoPanel';
import adjacencyGraph from '../../../data_dump/adjacency_graph.json';
import adjacencyGraphEdgeMetadata from '../../../data_dump/adjacency_graph_edge_metadata.json';
interface ModelEntity {
    bufferGeometry: THREE.BufferGeometry;
    color: RGBColor;
    entityId: string;
}

export const Model = (): JSX.Element => {
    const [modelEnts, setModelEnts] = React.useState<ModelEntity[]>([]);
    const [detectedPockets, setDetectedPockets] = React.useState<DetectedPocket[]>([]);
    const [isPocketDetectionActive, setIsPocketDetectionActive] = React.useState(false);
    const [originalEntityColors] = React.useState(() => getAllEntityColors());
    const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null);
    const [hoveredEntityId, setHoveredEntityId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const entityColors = getAllEntityColors();

        new GLTFLoader().load('./colored_glb.glb', gltf => {
            const newModuleEntities: ModelEntity[] = [];

            gltf.scene.traverse(element => {
                if (element.type !== 'Mesh') return;

                const meshElement = element as THREE.Mesh;

                // Extract entity ID from mesh name (e.g., "Product_1_3" -> "3")
                const entityId = meshElement.name.split('_').pop() || '';

                const color = entityColors.get(entityId) || { r: 0.47, g: 0.47, b: 0.47 };

                newModuleEntities.push({
                    bufferGeometry: meshElement.geometry as THREE.BufferGeometry,
                    color: color,
                    entityId: entityId
                });
            });

            setModelEnts(newModuleEntities);
        });

        const pockets = detectPockets(adjacencyGraph, adjacencyGraphEdgeMetadata);
        setDetectedPockets(pockets);

    }, []);

    // Update entity colors based on pocket detection state, selection, and hover
    const getEntityColor = React.useCallback((entity: ModelEntity): RGBColor => {
        if (selectedEntityId === entity.entityId) {
            return { r: 1.0, g: 0.0, b: 0.0 };
        }

        if (hoveredEntityId === entity.entityId) {
            const baseColor = isPocketDetectionActive ?
                (getEntityPocketInfo(entity.entityId, detectedPockets).isPocket ?
                    { r: 0.02, g: 0.19, b: 0.68 } :
                    (originalEntityColors.get(entity.entityId) || { r: 0.47, g: 0.47, b: 0.47 })
                ) :
                (originalEntityColors.get(entity.entityId) || { r: 0.47, g: 0.47, b: 0.47 });

            return {
                r: Math.min(1.0, baseColor.r * 1.3),
                g: Math.min(1.0, baseColor.g * 1.3),
                b: Math.min(1.0, baseColor.b * 1.3)
            };
        }

        if (!isPocketDetectionActive) {
            return originalEntityColors.get(entity.entityId) || { r: 0.47, g: 0.47, b: 0.47 };
        }

        const pocketInfo = getEntityPocketInfo(entity.entityId, detectedPockets);

        if (pocketInfo.isPocket) {
            return { r: 0.02, g: 0.19, b: 0.68 };
        }

        return originalEntityColors.get(entity.entityId) || { r: 0.47, g: 0.47, b: 0.47 };
    }, [isPocketDetectionActive, detectedPockets, originalEntityColors, selectedEntityId, hoveredEntityId]);

    const createOutline = React.useCallback((geometry: THREE.BufferGeometry) => {
        const edges = new THREE.EdgesGeometry(geometry, 30);
        return edges;
    }, []);

    const handleEntityClick = React.useCallback((entityId: string) => {
        setSelectedEntityId(prev => prev === entityId ? null : entityId);
    }, []);

    const handleEntitySelect = React.useCallback((entityId: string) => {
        setSelectedEntityId(entityId);
    }, []);

    const handleEntityHover = React.useCallback((entityId: string | null) => {
        setHoveredEntityId(entityId);
    }, []);

    const renderEntity = React.useCallback((ent: ModelEntity, index: number) => {
        const currentColor = getEntityColor(ent);
        const pocketInfo = getEntityPocketInfo(ent.entityId, detectedPockets);
        const isPocket = isPocketDetectionActive && pocketInfo.isPocket;
        const isSelected = selectedEntityId === ent.entityId;
        const isHovered = hoveredEntityId === ent.entityId;
        const edgeColor = { r: 0, g: 0, b: 0 };

        return (
            <group key={index}>
                <mesh
                    geometry={ent.bufferGeometry}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEntityClick(ent.entityId);
                    }}
                    onPointerEnter={(e) => {
                        e.stopPropagation();
                        document.body.style.cursor = 'pointer';
                        handleEntityHover(ent.entityId);
                    }}
                    onPointerLeave={() => {
                        document.body.style.cursor = 'default';
                        handleEntityHover(null);
                    }}
                >
                    <meshStandardMaterial
                        color={[currentColor.r, currentColor.g, currentColor.b]}
                        transparent={isHovered || isSelected}
                        opacity={isHovered || isSelected ? 0.8 : 1.0}
                        metalness={.2}
                    />
                </mesh>

                {(isPocket || isSelected) && (
                    <lineSegments geometry={createOutline(ent.bufferGeometry)}>
                        <lineBasicMaterial
                            color={[edgeColor.r, edgeColor.g, edgeColor.b]}
                            linewidth={10}
                            transparent={true}
                            opacity={1.0}
                        />
                    </lineSegments>
                )}
            </group>
        );
    }, [getEntityColor, isPocketDetectionActive, detectedPockets, createOutline, selectedEntityId, hoveredEntityId, handleEntityClick, handleEntityHover]);

    const handleTogglePocketDetection = () => {
        setIsPocketDetectionActive(prev => !prev);
    };

    const handleCloseEntityInfo = () => {
        setSelectedEntityId(null);
    };

    const handleCanvasClick = (event: any) => {
        if (selectedEntityId) {
            handleCloseEntityInfo();
        }
    };

    return (
        <div className="canvas-container">
            <PocketDetectionPanel
                isActive={isPocketDetectionActive}
                pocketCount={detectedPockets.length}
                onToggle={handleTogglePocketDetection}
            />

            <EntityInfoPanel
                selectedEntityId={selectedEntityId}
                detectedPockets={detectedPockets}
                onClose={handleCloseEntityInfo}
                onEntitySelect={handleEntitySelect}
            />

            <Canvas camera={{ position: [0, 0, 300] }} onPointerMissed={handleCanvasClick} >
                <ambientLight intensity={0.4} />

                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.0}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                    shadow-bias={-0.0001}
                />

                <directionalLight
                    position={[-5, -5, -2]}
                    intensity={0.3}
                    color="#8bb8ff"
                />

                <pointLight
                    position={[0, 15, 0]}
                    intensity={0.5}
                    color="#ffffff"
                    distance={100}
                    decay={2}
                />
                <OrbitControls makeDefault />
                <group>
                    {modelEnts.map((ent, index) => renderEntity(ent, index))}
                </group>
            </Canvas>
        </div>
    );
};