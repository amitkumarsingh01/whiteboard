import React, { useState, useEffect, useRef } from 'react';
import WhiteboardCanvas from './WhiteboardCanvas';
import Toolbar from './Toolbar';
import SheetsList from './SheetsList';
import { DrawingElement, Sheet, Tool, ShapeType, SheetData, ExportType } from '../../types';
import { getCurrentUser, getSheets, createSheet, getSheetData, saveSheetData, deleteSheet, updateSheet } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

const SheetManager: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [isFilled, setIsFilled] = useState(false);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Load user's sheets
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userSheets = getSheets(user.id);
    setSheets(userSheets);
    
    // Open the first sheet or create a new one if none exist
    if (userSheets.length > 0) {
      setActiveSheetId(userSheets[0].id);
    } else {
      handleCreateSheet();
    }
  }, [navigate]);
  
  // Load sheet data when active sheet changes
  useEffect(() => {
    if (activeSheetId) {
      const sheetData = getSheetData(activeSheetId);
      if (sheetData) {
        setElements(sheetData.elements);
      } else {
        setElements([]);
      }
    }
  }, [activeSheetId]);
  
  // Save sheet data when elements change
  useEffect(() => {
    if (activeSheetId && elements) {
      const sheetData: SheetData = {
        id: activeSheetId,
        elements
      };
      saveSheetData(activeSheetId, sheetData);
      
      // Generate a preview image
      if (canvasContainerRef.current && elements.length > 0) {
        const canvas = canvasContainerRef.current.querySelector('canvas');
        if (canvas) {
          try {
            const previewImage = canvas.toDataURL('image/png');
            
            // Update the sheet with the preview image
            const sheetIndex = sheets.findIndex(s => s.id === activeSheetId);
            if (sheetIndex !== -1) {
              const updatedSheet = { ...sheets[sheetIndex], previewImage };
              updateSheet(updatedSheet);
              
              // Update local state
              const updatedSheets = [...sheets];
              updatedSheets[sheetIndex] = updatedSheet;
              setSheets(updatedSheets);
            }
          } catch (error) {
            console.error('Failed to generate preview:', error);
          }
        }
      }
    }
  }, [activeSheetId, elements, sheets]);
  
  const handleSelectSheet = (sheetId: string) => {
    setActiveSheetId(sheetId);
  };
  
  const handleCreateSheet = () => {
    const user = getCurrentUser();
    if (!user) return;
    
    const sheetName = prompt('Enter sheet name:', `Sheet ${sheets.length + 1}`);
    if (!sheetName) return;
    
    const newSheet = createSheet(user.id, sheetName);
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id);
    setElements([]);
  };
  
  const handleRenameSheet = (sheetId: string) => {
    const sheetIndex = sheets.findIndex(s => s.id === sheetId);
    if (sheetIndex === -1) return;
    
    const currentName = sheets[sheetIndex].name;
    const newName = prompt('Enter new sheet name:', currentName);
    if (!newName || newName === currentName) return;
    
    const updatedSheet = { ...sheets[sheetIndex], name: newName };
    updateSheet(updatedSheet);
    
    // Update local state
    const updatedSheets = [...sheets];
    updatedSheets[sheetIndex] = updatedSheet;
    setSheets(updatedSheets);
  };
  
  const handleDeleteSheet = (sheetId: string) => {
    if (!confirm('Are you sure you want to delete this sheet? This action cannot be undone.')) {
      return;
    }
    
    deleteSheet(sheetId);
    
    // Update local state
    const updatedSheets = sheets.filter(s => s.id !== sheetId);
    setSheets(updatedSheets);
    
    // If the active sheet was deleted, set a new active sheet
    if (activeSheetId === sheetId) {
      if (updatedSheets.length > 0) {
        setActiveSheetId(updatedSheets[0].id);
      } else {
        // Create a new sheet if all sheets were deleted
        handleCreateSheet();
      }
    }
  };
  
  const handleElementsChange = (newElements: DrawingElement[]) => {
    setElements(newElements);
  };
  
  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          
          // Create a temporary image to get dimensions
          const img = new Image();
          img.src = imageData;
          
          img.onload = () => {
            // Calculate dimensions to fit within canvas
            let width = img.width;
            let height = img.height;
            
            const maxWidth = 400; // Max width for the image
            const maxHeight = 400; // Max height for the image
            
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = height * ratio;
            }
            
            if (height > maxHeight) {
              const ratio = maxHeight / height;
              height = height * ratio;
              width = width * ratio;
            }
            
            // Add image element
            const newImage: DrawingElement = {
              id: `element_${Date.now()}`,
              type: 'image',
              position: { x: 50, y: 50 }, // Default position
              width,
              height,
              imageData,
              color: '#000000',
              size: 1,
              opacity: 1
            };
            
            setElements([...elements, newImage]);
          };
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };
  
  const handleExport = async (type: ExportType) => {
    if (!canvasContainerRef.current) return;
    
    const canvas = canvasContainerRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const activeSheet = sheets.find(s => s.id === activeSheetId);
    const fileName = activeSheet ? activeSheet.name : 'whiteboard';
    
    try {
      if (type === 'png') {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${fileName}.png`);
          }
        });
      } else if (type === 'jpg') {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${fileName}.jpg`);
          }
        }, 'image/jpeg');
      } else if (type === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };
  
  return (
    <div className="flex h-full gap-4">
      {/* Sheet list */}
      <div className="w-64 h-full">
        <SheetsList
          sheets={sheets}
          activeSheetId={activeSheetId}
          onSelectSheet={handleSelectSheet}
          onCreateSheet={handleCreateSheet}
          onRenameSheet={handleRenameSheet}
          onDeleteSheet={handleDeleteSheet}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Canvas */}
        <div ref={canvasContainerRef} className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
          {activeSheetId && (
            <WhiteboardCanvas
              elements={elements}
              tool={tool}
              color={color}
              size={brushSize}
              opacity={opacity}
              shapeType={shapeType}
              fillColor={fillColor}
              isFilled={isFilled}
              onElementsChange={handleElementsChange}
            />
          )}
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="w-64">
        <Toolbar
          currentTool={tool}
          setTool={setTool}
          currentColor={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          opacity={opacity}
          setOpacity={setOpacity}
          shapeType={shapeType}
          setShapeType={setShapeType}
          fillColor={fillColor}
          setFillColor={setFillColor}
          isFilled={isFilled}
          setIsFilled={setIsFilled}
          onAddImage={handleAddImage}
          onExport={handleExport}
          onNewSheet={handleCreateSheet}
        />
      </div>
    </div>
  );
};

export default SheetManager;