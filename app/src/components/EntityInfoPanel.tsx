import React from 'react';
import './EntityInfoPanel.css';
import { DetectedPocket } from '../utils/pocketDetection';
import { getEntityPocketInfo } from '../utils/entityUtils';
import adjacencyGraph from '../../../data_dump/adjacency_graph.json';

interface EntityInfoPanelProps {
    selectedEntityId: string | null;
    detectedPockets: DetectedPocket[];
    onClose: () => void;
    onEntitySelect: (entityId: string) => void;
}

export const EntityInfoPanel: React.FC<EntityInfoPanelProps> = ({
    selectedEntityId,
    detectedPockets,
    onClose,
    onEntitySelect
}) => {
    if (!selectedEntityId) return null;

    const pocketInfo = getEntityPocketInfo(selectedEntityId, detectedPockets);
    const adjacentEntities = adjacencyGraph[selectedEntityId] || [];

    const handleAdjacentEntityClick = (entityId: string) => {
        onEntitySelect(entityId);
    };

    return (
        <div className="entity-info-panel">
            <div className="panel-header">
                <h3 className="panel-title">Entity Information</h3>
                <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close entity information panel"
                >
                    ×
                </button>
            </div>

            <div className="panel-content">
                <div className="info-section">
                    <div className="info-item">
                        <span className="info-label">Entity ID:</span>
                        <span className="info-value">{selectedEntityId}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Pocket Status:</span>
                        <span className={`info-value ${pocketInfo.isPocket ? 'is-pocket' : 'not-pocket'}`}>
                            {pocketInfo.isPocket
                                ? `Part of Pocket #${pocketInfo.pocketId}`
                                : 'Not in any pocket'
                            }
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Adjacent Entities:</span>
                        <span className="info-value">{adjacentEntities.length}</span>
                    </div>
                </div>

                {adjacentEntities.length > 0 && (
                    <div className="adjacent-entities-section">
                        <h4 className="section-title">Connected to:</h4>
                        <div className="adjacent-entities-grid">
                            {adjacentEntities.map((entityId) => (
                                <button
                                    key={entityId}
                                    className="adjacent-entity clickable"
                                    onClick={() => handleAdjacentEntityClick(entityId)}
                                    title={`Select entity ${entityId}`}
                                >
                                    {entityId}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};