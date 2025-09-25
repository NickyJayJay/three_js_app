# Feature Identification - Pocket Detection System

A React-based 3D visualization tool for identifying machining features (pockets) in CAD models using geometric analysis and interactive visualization.

## Overview

This project was built as a front-end developer exercise focusing on UI/UX design and user experience over complex algorithmic implementation. The app lets users visualize 3D CAD models and detect "pockets" (machining features) through an intuitive interface with smooth interactions and polished visual design.

Since this was for a design-focused position, I prioritized creating a clean, professional interface with thoughtful hover states, animations, and information architecture rather than developing a sophisticated detection algorithm. The pocket detection uses a straightforward graph traversal approach that gets the job done while I focused most of my energy on making the tool feel responsive and visually appealing for shop floor users.

## Features

- **Automated Pocket Detection**: Algorithm identifies potential machining pockets using graph traversal
- **Entity Selection & Inspection**: Click on model faces to view detailed information
- **Adjacency Graph Navigation**: Jump between connected entities through the information panel
- **Real-time Visual Feedback**: Hover effects, selection highlighting, and pocket visualization
- **Toggle-based Analysis**: Switch between normal model view and pocket detection mode

## Installation

1. Clone the repository:

```bash
git clone <https://github.com/NickyJayJay/feature_identification.git>
cd feature_identification
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser to `http://localhost:4000`

## Project Structure

```
src/
├── components/           # React UI components
│   ├── EntityInfoPanel/  # Entity details sidebar
│   └── PocketDetectionPanel/ # Detection toggle control
├── model/               # 3D model rendering
│   ├── model.tsx        # Main 3D scene component
│   └── model.css        # 3D scene styling
├── utils/               # Core algorithms and utilities
│   ├── pocketDetection.ts    # Pocket detection algorithm
│   ├── entityUtils.ts        # Entity helper functions
│   └── rgbUtils.ts          # Color mapping utilities
└── index.tsx           # Application entry point

data_dump/              # CAD model data
├── colored_glb.glb     # 3D model file
├── adjacency_graph.json    # Entity connectivity
├── adjacency_graph_edge_metadata.json  # Edge type data
├── entity_geometry_info.json          # Geometric properties
└── rgb_id_to_entity_id_map.json      # Color-to-entity mapping
```

## Algorithm Overview

### Pocket Detection Algorithm

The pocket detection system uses a graph-based approach:

1. **Concave Edge Filtering**: Filters the adjacency graph to include only concave edges
2. **Connected Component Analysis**: Uses depth-first search to find groups of entities connected by concave edges
3. **Size Filtering**: Only considers groups with 3+ entities as potential pockets
4. **Result Ranking**: Sorts detected pockets by size (largest first)

**Key Assumptions:**

- Pockets are characterized by faces connected via concave edges
- Single isolated faces are not considered pockets
- Algorithm prioritizes recall over precision (may include false positives)

### Data Processing

The system processes several data sources:

- **3D Geometry**: GLB file containing mesh data with color-coded entities
- **Adjacency Graph**: Defines which entities are physically connected
- **Edge Metadata**: Classifies connections as CONCAVE, CONVEX, or TANGENTIAL
- **RGB Mapping**: Links visual colors to entity IDs

## User Interface

### Main Controls

- **Pocket Detection Toggle**: Enable/disable pocket highlighting (top-right panel)
- **Entity Selection**: Click any face to view detailed information
- **3D Navigation**: Mouse controls for zoom, pan, and rotate

### Information Panel

When an entity is selected, the panel displays:

- Entity ID
- Pocket membership status
- Count of adjacent entities
- Clickable grid of connected entities

### Visual Indicators

- **Red**: Currently selected entity
- **Blue**: Entities belonging to detected pockets (when detection is active)
- **Bright**: Hovered entities
- **Black Outlines**: Pocket entities and selected entities

## Future Enhancements

- Filtering and search capabilities for entities
- Multiple camera views (top, front, isometric)
- Migrate to Vite for things like HMR and source maps
- Scoped CSS styles (Tailwind, CSS modules, etc.)
- Unit testing of the utils files and integration tests of the React components
