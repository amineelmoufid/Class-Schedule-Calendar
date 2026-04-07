import React from 'react';
import { Calendar } from './components/Calendar';
import { useSchedule } from './hooks/useSchedule';
import { Calendar as CalendarIcon, Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const { 
    classes, 
    exceptions, 
    loading, 
    cancelClass, 
    restoreClass, 
    addAdditionalClass, 
    deleteAdditionalClass,
    updateClass,
    updateException,
    resetSchedule
  } = useSchedule();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p className="font-medium">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Class Schedule</h1>
              <p className="text-sm text-gray-500">Manage your weekly classes and exceptions</p>
            </div>
          </div>
          <button 
            onClick={resetSchedule}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update to New Schedule</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 overflow-hidden flex flex-col">
        <Calendar 
          classes={classes}
          exceptions={exceptions}
          onCancelClass={cancelClass}
          onRestoreClass={restoreClass}
          onAddAdditionalClass={addAdditionalClass}
          onDeleteAdditionalClass={deleteAdditionalClass}
          onUpdateClass={updateClass}
          onUpdateException={updateException}
        />
      </main>
    </div>
  );
}
