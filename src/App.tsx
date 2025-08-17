import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const images = [
    'img/negru.webp',
    'img/rosu.webp',
    'img/verde.webp',
    'img/galben.webp',
    'img/gri.webp',
    'img/albastru.webp',
];

const ItemType = 'IMAGE';

type DragItem = { src: string; fromPalette?: boolean; fromIndex?: number };

function PaletteImage({ src }: { src: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [, drag] = useDrag({
        type: ItemType,
        item: { src, fromPalette: true },
    });
    drag(ref);
    return (
        <div ref={ref} style={{ width: 100, height: 100, margin: 4, cursor: 'grab' }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

function GridCell({
                      src,
                      index,
                      onDropImage,
                      onRemoveImage,
                  }: {
    src: string | null;
    index: number;
    onDropImage: (src: string, fromIndex?: number) => void;
    onRemoveImage: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: ItemType,
        drop: (item: DragItem) => {
            onDropImage(item.src, item.fromIndex);
        },
        canDrop: (item: DragItem) => !src || item.fromIndex !== undefined,
    });

    const [, drag] = useDrag({
        type: ItemType,
        item: { src: src!, fromIndex: index },
        canDrag: () => !!src,
        end: (item, monitor) => {
            if (monitor.didDrop() && monitor.getDropResult() == null) {
                onRemoveImage();
            }
        },
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            onDoubleClick={() => src && onRemoveImage()}
            style={{
                width: 100,
                height: 100,
                border: '1px solid #ccc',
                background: src ? '#fff' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 2,
                position: 'relative',
                cursor: src ? 'pointer' : 'default',
            }}
        >
            {src && (
                <img src={src} alt="" style={{ width: '100%', height: '100%' }} />
            )}
        </div>
    );
}

function App() {
    const [width, setWidth] = useState(3);
    const [height, setHeight] = useState(2);
    const [grid, setGrid] = useState<(string | null)[]>(Array(2 * 3).fill(null));

    // Update grid size when width or height changes
    React.useEffect(() => {
        setGrid((prev) => {
            const newSize = width * height;
            const newGrid = prev.slice(0, newSize);
            while (newGrid.length < newSize) newGrid.push(null);
            return newGrid;
        });
    }, [width, height]);

    const handleDropImage = (cellIdx: number, src: string, fromIndex?: number) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            if (fromIndex !== undefined) {
                newGrid[fromIndex] = null;
            }
            newGrid[cellIdx] = src;
            return newGrid;
        });
    };

    const handleRemoveImage = (cellIdx: number) => {
        setGrid((prev) => {
            const newGrid = [...prev];
            newGrid[cellIdx] = null;
            return newGrid;
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ display: 'flex', marginBottom: 16 }}>
                {images.map((src) => (
                    <PaletteImage key={src} src={src} />
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
                        style={{ width: 50, marginLeft: 4 }}
                    />
                </label>
            </div>
            <div>
                <p>Drag and drop onto the grid, double click to remove.</p>
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${width}, 100px)`,
                    gridTemplateRows: `repeat(${height}, 100px)`,
                    gap: 4,
                }}
            >
                {grid.map((src, idx) => (
                    <GridCell
                        key={idx}
                        src={src}
                        index={idx}
                        onDropImage={(imgSrc, fromIndex) => handleDropImage(idx, imgSrc, fromIndex)}
                        onRemoveImage={() => handleRemoveImage(idx)}
                    />
                ))}
            </div>
        </DndProvider>
    );
}

export default App;