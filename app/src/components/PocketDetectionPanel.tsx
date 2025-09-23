import React from 'react';
import './PocketDetectionPanel.css';

interface PocketDetectionPanelProps {
    isActive: boolean;
    pocketCount: number;
    onToggle: () => void;
}

export const PocketDetectionPanel: React.FC<PocketDetectionPanelProps> = ({
    isActive,
    pocketCount,
    onToggle
}) => {
    return (
        <div className="pocket-detection-panel">
            <div className="toggle-container">
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={onToggle}
                    />
                    <span className="slider"></span>
                </label>
                <div className="toggle-info">
                    <span className="toggle-label">Pocket Detection</span>
                    <span className="toggle-status">
                        {isActive
                            ? `${pocketCount} pockets detected`
                            : 'No detection active'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};