import React, { useRef, useState, useEffect } from 'react';
import { Tool, Point, DrawingElement, ShapeType } from '../../types';

interface WhiteboardCanvasProps {
  elements: DrawingElement[];
  tool: Tool;
  color: string;
  size: number;
  opacity: number;
  shapeType: ShapeType;
  fillColor: string;
  isFilled: boolean;
  onElementsChange: (elements: DrawingElement[]) => void;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  elements,
  tool,
  color,
  size,
  opacity,
  shapeType,
  fillColor,
  isFilled,
  onElementsChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Set canvas size to match container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (container) {
          setCanvasSize({
            width: container.clientWidth,
            height: container.clientHeight
          });
        }
      }
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // Draw all elements when they change
  useEffect(() => {
    drawElements();
  }, [elements, canvasSize]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDrawing(true);
    
    if (tool === 'eraser' || tool === 'eraser-line') {
      // Don't create a new element for eraser
      setCurrentElement(null);
      return;
    }
    
    let newElement: DrawingElement;
    
    if (tool === 'shape') {
      newElement = {
        id: `element_${Date.now()}`,
        type: 'shape',
        shapeType,
        position: { x, y },
        width: 0,
        height: 0,
        color,
        size,
        opacity,
        filled: isFilled,
        fillColor
      };
    } else if (tool === 'text') {
      const text = prompt('Enter text:');
      if (!text) {
        setDrawing(false);
        return;
      }
      
      newElement = {
        id: `element_${Date.now()}`,
        type: 'text',
        position: { x, y },
        text,
        color,
        size,
        opacity
      };
      
      onElementsChange([...elements, newElement]);
      setDrawing(false);
      return;
    } else if (tool === 'fill') {
      // Handle fill bucket
      applyFill(x, y);
      setDrawing(false);
      return;
    } else {
      // Pencil, pen, marker
      newElement = {
        id: `element_${Date.now()}`,
        type: tool as 'pencil' | 'pen' | 'marker',
        points: [{ x, y }],
        color,
        size,
        opacity
      };
    }
    
    setCurrentElement(newElement);
    onElementsChange([...elements, newElement]);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'eraser' || tool === 'eraser-line') {
      handleEraser(x, y);
      return;
    }
    
    if (!currentElement) return;
    
    const updatedElements = [...elements];
    const index = updatedElements.length - 1;
    
    if (tool === 'shape') {
      if (currentElement.position) {
        const updatedElement = {
          ...currentElement,
          width: x - currentElement.position.x,
          height: y - currentElement.position.y
        };
        
        updatedElements[index] = updatedElement;
        setCurrentElement(updatedElement);
      }
    } else {
      // Pencil, pen, marker
      if (currentElement.points) {
        const updatedElement = {
          ...currentElement,
          points: [...currentElement.points, { x, y }]
        };
        
        updatedElements[index] = updatedElement;
        setCurrentElement(updatedElement);
      }
    }
    
    onElementsChange(updatedElements);
  };
  
  const endDrawing = () => {
    setDrawing(false);
    setCurrentElement(null);
  };
  
  const handleEraser = (x: number, y: number) => {
    if (tool === 'eraser') {
      // Precision eraser (erases part of a stroke)
      const updatedElements = elements.map(el => {
        if (el.type === 'pencil' || el.type === 'pen' || el.type === 'marker') {
          if (el.points) {
            // Filter out points that are close to the eraser
            const newPoints = el.points.filter(point => {
              const distance = Math.sqrt(
                Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
              );
              return distance > size * 2;
            });
            
            return { ...el, points: newPoints };
          }
        }
        return el;
      });
      
      onElementsChange(updatedElements);
    } else if (tool === 'eraser-line') {
      // Line eraser (erases entire elements)
      const updatedElements = elements.filter(el => {
        if (el.type === 'pencil' || el.type === 'pen' || el.type === 'marker') {
          if (el.points) {
            // Check if any point of the element is close to the eraser
            return !el.points.some(point => {
              const distance = Math.sqrt(
                Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
              );
              return distance < size * 3;
            });
          }
        } else if (el.type === 'shape' || el.type === 'text') {
          if (el.position) {
            const centerX = el.position.x + (el.width || 0) / 2;
            const centerY = el.position.y + (el.height || 0) / 2;
            const distance = Math.sqrt(
              Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
            );
            return distance > size * 3;
          }
        }
        return true;
      });
      
      onElementsChange(updatedElements);
    }
  };
  
  const applyFill = (x: number, y: number) => {
    // Find the shape that contains the point
    const elementIndex = elements.findIndex(el => {
      if (el.type === 'shape' && el.position) {
        const left = el.position.x;
        const top = el.position.y;
        const right = left + (el.width || 0);
        const bottom = top + (el.height || 0);
        
        return x >= left && x <= right && y >= top && y <= bottom;
      }
      return false;
    });
    
    if (elementIndex !== -1) {
      const updatedElements = [...elements];
      updatedElements[elementIndex] = {
        ...updatedElements[elementIndex],
        filled: true,
        fillColor: color
      };
      
      onElementsChange(updatedElements);
    }
  };
  
  const drawElements = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each element
    elements.forEach(element => {
      if (element.type === 'pencil' || element.type === 'pen' || element.type === 'marker') {
        drawFreehandElement(ctx, element);
      } else if (element.type === 'shape') {
        drawShapeElement(ctx, element);
      } else if (element.type === 'text') {
        drawTextElement(ctx, element);
      } else if (element.type === 'image') {
        drawImageElement(ctx, element);
      }
    });
  };
  
  const drawFreehandElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { points, color, size, opacity, type } = element;
    
    if (!points || points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity;
    
    if (type === 'marker') {
      ctx.lineWidth = size * 2;
      ctx.globalAlpha = 0.5 * opacity;
    } else if (type === 'pen') {
      ctx.lineWidth = size * 1.5;
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  
  const drawShapeElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { shapeType, position, width, height, color, size, opacity, filled, fillColor } = element;
    
    if (!position || width === undefined || height === undefined) return;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;
    
    if (shapeType === 'rectangle') {
      ctx.rect(position.x, position.y, width, height);
    } else if (shapeType === 'circle') {
      const centerX = position.x + width / 2;
      const centerY = position.y + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else if (shapeType === 'triangle') {
      ctx.moveTo(position.x + width / 2, position.y);
      ctx.lineTo(position.x, position.y + height);
      ctx.lineTo(position.x + width, position.y + height);
      ctx.closePath();
    } else if (shapeType === 'line') {
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(position.x + width, position.y + height);
    } else if (shapeType === 'arrow') {
      const headLength = Math.min(Math.abs(width), Math.abs(height)) * 0.2;
      const angle = Math.atan2(height, width);
      
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(position.x + width, position.y + height);
      
      ctx.lineTo(
        position.x + width - headLength * Math.cos(angle - Math.PI / 6),
        position.y + height - headLength * Math.sin(angle - Math.PI / 6)
      );
      
      ctx.moveTo(position.x + width, position.y + height);
      ctx.lineTo(
        position.x + width - headLength * Math.cos(angle + Math.PI / 6),
        position.y + height - headLength * Math.sin(angle + Math.PI / 6)
      );
    }
    
    if (filled) {
      ctx.fillStyle = fillColor || color;
      ctx.fill();
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  
  const drawTextElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { position, text, color, size, opacity } = element;
    
    if (!position || !text) return;
    
    ctx.font = `${size * 5}px Arial`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillText(text, position.x, position.y);
    ctx.globalAlpha = 1;
  };
  
  const drawImageElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { position, imageData, width, height, opacity } = element;
    
    if (!position || !imageData || width === undefined || height === undefined) return;
    
    const img = new Image();
    img.src = imageData;
    
    img.onload = () => {
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, position.x, position.y, width, height);
      ctx.globalAlpha = 1;
    };
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="border border-gray-300 bg-white w-full h-full cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
    />
  );
};

export default WhiteboardCanvas;