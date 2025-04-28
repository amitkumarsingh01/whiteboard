import React from 'react';
import { Tool, ShapeType, ExportType } from '../../types';
import {
  Pencil,
  Pen,
  Edit3,
  Square,
  Circle,
  Triangle,
  Minus,
  ArrowRight,
  Type,
  Image,
  Eraser,
  FolderPlus,
  Download,
  Palette,
  Droplet
} from 'lucide-react';

interface ToolbarProps {
  currentTool: Tool;
  setTool: (tool: Tool) => void;
  currentColor: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  shapeType: ShapeType;
  setShapeType: (type: ShapeType) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  isFilled: boolean;
  setIsFilled: (filled: boolean) => void;
  onAddImage: () => void;
  onExport: (type: ExportType) => void;
  onNewSheet: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setTool,
  currentColor,
  setColor,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity,
  shapeType,
  setShapeType,
  fillColor,
  setFillColor,
  isFilled,
  setIsFilled,
  onAddImage,
  onExport,
  onNewSheet
}) => {
  const tools = [
    { id: 'pencil', icon: <Pencil size={20} />, label: 'Pencil' },
    { id: 'pen', icon: <Pen size={20} />, label: 'Pen' },
    { id: 'marker', icon: <Edit3 size={20} />, label: 'Marker' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
    { id: 'eraser-line', icon: <Eraser size={20} className="rotate-45" />, label: 'Line Eraser' },
    { id: 'shape', icon: <Square size={20} />, label: 'Shape' },
    { id: 'text', icon: <Type size={20} />, label: 'Text' },
    { id: 'image', icon: <Image size={20} />, label: 'Image' },
    { id: 'fill', icon: <Droplet size={20} />, label: 'Fill' }
  ];

  const shapes = [
    { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle size={20} />, label: 'Triangle' },
    { id: 'line', icon: <Minus size={20} />, label: 'Line' },
    { id: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' }
  ];

  const exportOptions = [
    { id: 'png', label: 'PNG' },
    { id: 'jpg', label: 'JPG' },
    { id: 'pdf', label: 'PDF' }
  ];

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#c0c0c0', '#808080',
    '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 flex flex-col gap-4">
      {/* Tools */}
      <div className="grid grid-cols-3 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`p-2 rounded-md flex flex-col items-center justify-center text-xs ${
              currentTool === tool.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
            onClick={() => setTool(tool.id as Tool)}
            title={tool.label}
          >
            {tool.icon}
            <span className="mt-1">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <hr className="border-gray-200" />

      {/* Color picker */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center">
          <Palette size={14} className="mr-1" /> Color
        </h3>
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ${
                color === currentColor ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #e2e8f0' : 'none' }}
              onClick={() => setColor(color)}
              title={color}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center">
          <label htmlFor="custom-color" className="text-xs mr-2">Custom:</label>
          <input
            type="color"
            id="custom-color"
            value={currentColor}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8"
          />
        </div>
      </div>

      {/* Brush size */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2">Brush Size</h3>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">{brushSize}px</div>
      </div>

      {/* Opacity */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2">Opacity</h3>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">{Math.round(opacity * 100)}%</div>
      </div>

      {/* Shape options (only shown when shape tool is selected) */}
      {currentTool === 'shape' && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">Shape Type</h3>
          <div className="grid grid-cols-3 gap-1">
            {shapes.map((shape) => (
              <button
                key={shape.id}
                className={`p-2 rounded-md ${
                  shapeType === shape.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setShapeType(shape.id as ShapeType)}
                title={shape.label}
              >
                {shape.icon}
              </button>
            ))}
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">Fill Shape</label>
              <input
                type="checkbox"
                checked={isFilled}
                onChange={(e) => setIsFilled(e.target.checked)}
                className="ml-2"
              />
            </div>
            
            {isFilled && (
              <div className="mt-2">
                <label className="text-xs font-medium text-gray-500 block mb-1">Fill Color</label>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-full h-8"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2">Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 text-sm"
            onClick={onNewSheet}
          >
            <FolderPlus size={16} />
            New Sheet
          </button>
          
          <div className="relative group">
            <button className="flex w-full items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 text-sm">
              <Download size={16} />
              Export
            </button>
            <div className="absolute z-10 left-0 right-0 mt-1 hidden group-hover:block">
              <div className="bg-white rounded-md shadow-lg border border-gray-200 py-1">
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => onExport(option.id as ExportType)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button
            className="flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md py-2 px-4 text-sm"
            onClick={onAddImage}
          >
            <Image size={16} />
            Add Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;