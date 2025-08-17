import React, { useState } from 'react';

const images = [
    'img/negru.webp',
    'img/rosu.webp',
    'img/verde.webp',
    'img/galben.webp',
    'img/gri.webp',
    'img/albastru.webp',
];

const ERASER = '__ERASER__';
const STORAGE_KEY = 'pixel-art-state';

function PaletteImage({ src, tileSize, selected, onSelect, isEraser = false }: {
    src: string;
    tileSize: number;
    selected: boolean;
    onSelect: () => void;
    isEraser?: boolean;
}) {
    return (
        <div
            onClick={onSelect}
            style={{
                width: tileSize,
                height: tileSize,
                cursor: 'pointer',
                border: selected ? '2px solid #007bff' : '2px solid transparent',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isEraser ? '#f8d7da' : undefined,
            }}
            title={isEraser ? 'Eraser' : undefined}
        >
            {isEraser ? (
                <span style={{ fontSize: tileSize * 0.5, color: '#c00', fontWeight: 'bold' }}>🧹</span>
            ) : (
                <img src={src} alt="" style={{ width: '100%', height: '100%' }} draggable={false} />
            )}
        </div>
    );
}

function GridCell({ src, tileSize, onRemove, onMouseDown, onMouseEnter }: {
    src: string | null;
    tileSize: number;
    onRemove: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseEnter: (e: React.MouseEvent) => void;
}) {
    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onDoubleClick={onRemove}
            style={{
                width: tileSize,
                height: tileSize,
                background: src ? '#fff' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'crosshair',
                userSelect: 'none',
            }}
        >
            {src && (
                <img src={src} alt="" style={{ width: '100%', height: '100%' }} draggable={false} />
            )}
        </div>
    );
}

function App() {
    // Load from localStorage if available
    const loadState = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    };

    const saved = loadState();

    const [width, setWidth] = useState(saved?.width ?? 20);
    const [height, setHeight] = useState(saved?.height ?? 15);
    const [tileSize, setTileSize] = useState(saved?.tileSize ?? 30);
    const [grid, setGrid] = useState<(string | null)[]>(saved?.grid ?? Array((saved?.width ?? 20) * (saved?.height ?? 15)).fill(null));
    const [selectedImage, setSelectedImage] = useState<string | null>(saved?.selectedImage ?? null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Save to localStorage on any relevant state change
    React.useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ width, height, tileSize, grid, selectedImage })
        );
    }, [width, height, tileSize, grid, selectedImage]);

    React.useEffect(() => {
        setGrid((prev) => {
            const newSize = width * height;
            const newGrid = prev.slice(0, newSize);
            while (newGrid.length < newSize) newGrid.push(null);
            return newGrid;
        });
    }, [width, height]);

    const handlePaint = (idx: number) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            if (selectedImage === ERASER) {
                newGrid[idx] = null;
            } else if (selectedImage) {
                newGrid[idx] = selectedImage;
            }
            return newGrid;
        });
    };

    const handleRemove = (idx: number) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            newGrid[idx] = null;
            return newGrid;
        });
    };

    const handleMouseDown = (idx: number) => {
        setIsDrawing(true);
        handlePaint(idx);
    };

    const handleMouseEnter = (idx: number) => {
        if (isDrawing && selectedImage) {
            handlePaint(idx);
        }
    };

    React.useEffect(() => {
        const handleMouseUp = () => setIsDrawing(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const handleMouseLeave = () => {
        setIsDrawing(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <PaletteImage
                    src={ERASER}
                    tileSize={tileSize}
                    selected={selectedImage === ERASER}
                    onSelect={() => setSelectedImage(ERASER)}
                    isEraser
                />
                {images.map((src) => (
                    <PaletteImage
                        key={src}
                        src={src}
                        tileSize={tileSize}
                        selected={selectedImage === src}
                        onSelect={() => setSelectedImage(src)}
                    />
                ))}
            </div>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Width:
                    <input
                        type="number"
                        min={1}
                        value={width}
                        onChange={e => setWidth(Math.max(1, Number(e.target.value)))}
                        style={{ width: 50, marginLeft: 4, marginRight: 16 }}
                    />
                </label>
                <label>
                    Height:
                    <input
                        type="number"
                        min={1}
                        value={height}
                        onChange={e => setHeight(Math.max(1, Number(e.target.value)))}
                        style={{ width: 50, marginLeft: 4, marginRight: 16 }}
                    />
                </label>
                <label>
                    Tile size:
                    <input
                        type="number"
                        min={20}
                        max={200}
                        value={tileSize}
                        onChange={e => setTileSize(Math.max(20, Math.min(200, Number(e.target.value))))}
                        style={{ width: 60, marginLeft: 4 }}
                    />
                    px
                </label>
            </div>
            <div>
                <p>
                    Select a tile (or the eraser 🧹), then draw on the grid by clicking and dragging. Double click a cell to remove its image.
                </p>
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${width}, ${tileSize}px)`,
                    gridTemplateRows: `repeat(${height}, ${tileSize}px)`,
                    gap: 0,
                }}
                onMouseLeave={handleMouseLeave}
            >
                {grid.map((src, idx) => (
                    <GridCell
                        key={idx}
                        src={src}
                        tileSize={tileSize}
                        onRemove={() => handleRemove(idx)}
                        onMouseDown={() => handleMouseDown(idx)}
                        onMouseEnter={() => handleMouseEnter(idx)}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;