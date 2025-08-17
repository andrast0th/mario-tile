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
const DISABLE_HOVER = '__DISABLE_HOVER__';

function PaletteImage({
                          src,
                          tileSize,
                          selected,
                          onSelect,
                          isEraser = false,
                          isDisableHover = false,
                      }: {
    src: string;
    tileSize: number;
    selected: boolean;
    onSelect: () => void;
    isEraser?: boolean;
    isDisableHover?: boolean;
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
                background: isEraser ? '#f8d7da' : isDisableHover ? '#e2e3e5' : undefined,
            }}
            title={isEraser ? 'Eraser' : isDisableHover ? 'Disable draw on hover' : undefined}
        >
            {isEraser ? (
                <span style={{ fontSize: tileSize * 0.5, color: '#c00', fontWeight: 'bold' }}>🧹</span>
            ) : isDisableHover ? (
                <span style={{ fontSize: tileSize * 0.5, color: '#888', fontWeight: 'bold' }}>🚫</span>
            ) : (
                <img src={src} alt="" style={{ width: '100%', height: '100%' }} />
            )}
        </div>
    );
}

function GridCell({
                      src,
                      tileSize,
                      onPaint,
                      onRemove,
                      onMouseDown,
                      onMouseEnter,
                  }: {
    src: string | null;
    tileSize: number;
    onPaint: () => void;
    onRemove: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseEnter: (e: React.MouseEvent) => void;
}) {
    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
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
                <img src={src} alt="" style={{ width: '100%', height: '100%' }} />
            )}
        </div>
    );
}

function App() {
    const [width, setWidth] = useState(20);
    const [height, setHeight] = useState(15);
    const [tileSize, setTileSize] = useState(30);
    const [grid, setGrid] = useState<(string | null)[]>(Array(20 * 15).fill(null));
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [drawOnHover, setDrawOnHover] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);

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
            } else if (selectedImage && selectedImage !== DISABLE_HOVER) {
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
        if ((drawOnHover || isDrawing) && selectedImage && selectedImage !== DISABLE_HOVER) {
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

    // Palette selection logic
    const handlePaletteSelect = (src: string) => {
        setSelectedImage(src);
        if (src === DISABLE_HOVER) {
            setDrawOnHover(false);
        } else {
            setDrawOnHover(true);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <PaletteImage
                    src={ERASER}
                    tileSize={tileSize}
                    selected={selectedImage === ERASER}
                    onSelect={() => handlePaletteSelect(ERASER)}
                    isEraser
                />
                <PaletteImage
                    src={DISABLE_HOVER}
                    tileSize={tileSize}
                    selected={selectedImage === DISABLE_HOVER}
                    onSelect={() => handlePaletteSelect(DISABLE_HOVER)}
                    isDisableHover
                />
                {images.map((src) => (
                    <PaletteImage
                        key={src}
                        src={src}
                        tileSize={tileSize}
                        selected={selectedImage === src}
                        onSelect={() => handlePaletteSelect(src)}
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
                    Select a tile (or the eraser 🧹), then draw on the grid by clicking and dragging.
                    <br />
                    Select 🚫 to disable draw on hover (painting only on click/drag).
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
                        onPaint={() => handlePaint(idx)}
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