export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Sheet {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  previewImage?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: 'pencil' | 'pen' | 'marker' | 'shape' | 'text' | 'image';
  points?: Point[];
  color: string;
  size: number;
  opacity: number;
  text?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  position?: Point;
  width?: number;
  height?: number;
  imageData?: string;
  filled?: boolean;
  fillColor?: string;
}

export interface SheetData {
  id: string;
  elements: DrawingElement[];
}

export type Tool = 'pencil' | 'pen' | 'marker' | 'eraser' | 'eraser-line' | 'shape' | 'text' | 'image' | 'fill';

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';

export type ExportType = 'png' | 'jpg' | 'pdf';