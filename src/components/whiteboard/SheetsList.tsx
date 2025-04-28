import React from 'react';
import { Sheet } from '../../types';
import { FileText, Trash2, Plus, Edit2 } from 'lucide-react';

interface SheetsListProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSelectSheet: (sheetId: string) => void;
  onCreateSheet: () => void;
  onRenameSheet: (sheetId: string) => void;
  onDeleteSheet: (sheetId: string) => void;
}

const SheetsList: React.FC<SheetsListProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onCreateSheet,
  onRenameSheet,
  onDeleteSheet
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">My Sheets</h2>
        <button
          className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md px-3 py-1"
          onClick={onCreateSheet}
        >
          <Plus size={16} className="mr-1" />
          New
        </button>
      </div>
      
      {sheets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No sheets yet</p>
          <p className="text-sm mt-1">Create your first sheet to get started</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100%-4rem)] overflow-y-auto">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                activeSheetId === sheet.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => onSelectSheet(sheet.id)}
            >
              <div className="flex items-center">
                <div className="mr-3">
                  {sheet.previewImage ? (
                    <img
                      src={sheet.previewImage}
                      alt={sheet.name}
                      className="w-10 h-10 object-cover border border-gray-200 rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded">
                      <FileText size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`font-medium ${activeSheetId === sheet.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {sheet.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Updated {new Date(sheet.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <button
                  className="text-gray-400 hover:text-blue-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameSheet(sheet.id);
                  }}
                  title="Rename"
                >
                  <Edit2 size={16} />
                </button>
                
                <button
                  className="text-gray-400 hover:text-red-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSheet(sheet.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SheetsList;