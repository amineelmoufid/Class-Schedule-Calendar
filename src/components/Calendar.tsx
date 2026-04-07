import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, RotateCcw, Pencil } from 'lucide-react';
import { ClassSchedule, ClassException } from '../types';
import { cn } from '../lib/utils';
import { AddClassModal } from './AddClassModal';
import { EditClassModal } from './EditClassModal';

interface CalendarProps {
  classes: ClassSchedule[];
  exceptions: ClassException[];
  onCancelClass: (classId: string, date: string) => void;
  onRestoreClass: (exceptionId: string) => void;
  onAddAdditionalClass: (exception: Omit<ClassException, 'id'>) => void;
  onDeleteAdditionalClass: (exceptionId: string) => void;
  onUpdateClass: (id: string, data: Partial<ClassSchedule>) => void;
  onUpdateException: (id: string, data: Partial<ClassException>) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Calendar({
  classes,
  exceptions,
  onCancelClass,
  onRestoreClass,
  onAddAdditionalClass,
  onDeleteAdditionalClass,
  onUpdateClass,
  onUpdateException
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<Date | null>(null);
  const [initialTimeForAdd, setInitialTimeForAdd] = useState<{start: string, end: string} | null>(null);
  const [editingClass, setEditingClass] = useState<{cls: ClassSchedule | ClassException, type: 'static' | 'additional' | 'canceled', dateStr: string} | null>(null);
  const [dragSelection, setDragSelection] = useState<{ date: string, startY: number, currentY: number } | null>(null);
  const [hoverSelection, setHoverSelection] = useState<{ date: string, y: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const handleMouseDown = (e: React.MouseEvent, dateStr: string) => {
    if ((e.target as HTMLElement).closest('.class-block')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    setDragSelection({ date: dateStr, startY: y, currentY: y });
  };

  const handleMouseMove = (e: React.MouseEvent, dateStr: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, 12 * 96));
    
    if (dragSelection && dragSelection.date === dateStr) {
      setDragSelection({ ...dragSelection, currentY: y });
      setHoverSelection(null);
    } else if (!dragSelection) {
      setHoverSelection({ date: dateStr, y });
    }
  };

  const handleMouseLeave = () => {
    setHoverSelection(null);
    handleMouseUp();
  };

  const handleMouseUp = () => {
    if (!dragSelection) return;
    const { date, startY, currentY } = dragSelection;
    setDragSelection(null);

    const top = Math.min(startY, currentY);
    const bottom = Math.max(startY, currentY);
    
    // If drag is too small (e.g. just a click), default to 2 hours from click point
    let finalTop = top;
    let finalBottom = bottom;
    if (bottom - top < 24) { // Less than 15 mins drag
      finalBottom = finalTop + 96 * 2; // Default 2 hours
    }

    const startHour = 8 + Math.floor(finalTop / 96);
    const startMin = Math.floor((finalTop % 96) / 96 * 60);
    const endHour = 8 + Math.floor(finalBottom / 96);
    const endMin = Math.floor((finalBottom % 96) / 96 * 60);

    const roundedStartMin = Math.round(startMin / 15) * 15;
    const roundedEndMin = Math.round(endMin / 15) * 15;

    let finalStartHour = startHour;
    let finalStartMin = roundedStartMin;
    if (finalStartMin === 60) { finalStartHour += 1; finalStartMin = 0; }

    let finalEndHour = endHour;
    let finalEndMin = roundedEndMin;
    if (finalEndMin === 60) { finalEndHour += 1; finalEndMin = 0; }

    const formatTime = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    const targetDate = weekDays.find(d => format(d, 'yyyy-MM-dd') === date) || parseISO(date);
    setSelectedDateForAdd(targetDate);
    setInitialTimeForAdd({
      start: formatTime(finalStartHour, finalStartMin),
      end: formatTime(finalEndHour, finalEndMin)
    });
    setIsModalOpen(true);
  };

  const handleAddClick = (date: Date) => {
    setSelectedDateForAdd(date);
    setIsModalOpen(true);
  };

  // Generate time slots from 08:00 to 20:00
  const timeSlots = Array.from({ length: 13 }).map((_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 bg-gray-50 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
            {format(weekStart, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center bg-white rounded-md border border-gray-200 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={prevWeek} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors rounded-l-md">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={today} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-x border-gray-200 transition-colors flex-1 sm:flex-none">
              Today
            </button>
            <button onClick={nextWeek} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors rounded-r-md">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => handleAddClick(currentDate)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[800px] grid grid-cols-8 border-b border-gray-200">
          {/* Time column header */}
          <div className="p-3 border-r border-gray-200 bg-gray-50 text-center sticky left-0 z-30">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time</span>
          </div>
          {/* Days headers */}
          {weekDays.map((date, i) => (
            <div key={i} className={cn(
              "p-3 border-r border-gray-200 text-center",
              isSameDay(date, new Date()) ? "bg-blue-50" : "bg-gray-50"
            )}>
              <div className={cn(
                "text-sm font-medium",
                isSameDay(date, new Date()) ? "text-blue-600" : "text-gray-900"
              )}>
                {format(date, 'EEEE')}
              </div>
              <div className={cn(
                "text-2xl mt-1",
                isSameDay(date, new Date()) ? "text-blue-600 font-bold" : "text-gray-500"
              )}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-[800px] grid grid-cols-8 relative">
          {/* Time slots */}
          <div className="border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky left-0 z-20">
            {timeSlots.map((time, i) => (
              <div key={i} className="h-24 border-b border-gray-200 p-2 text-right">
                <span className="text-xs font-medium text-gray-500">{time}</span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map((date, dayIndex) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayName = format(date, 'EEEE');
            
            // Get static classes for this day
            const dayClasses = classes.filter(c => c.dayOfWeek === dayName);
            
            // Get exceptions for this date
            const dayExceptions = exceptions.filter(e => e.date === dateStr);
            
            // Filter out canceled classes
            const canceledClassIds = dayExceptions.filter(e => e.type === 'canceled').map(e => e.classId);
            const activeClasses = dayClasses.filter(c => !canceledClassIds.includes(c.id));
            const canceledClasses = dayClasses.filter(c => canceledClassIds.includes(c.id));
            
            // Get additional classes
            const additionalClasses = dayExceptions.filter(e => e.type === 'additional');

            return (
              <div 
                key={dayIndex} 
                className="border-r border-gray-200 relative group select-none"
                onMouseDown={(e) => handleMouseDown(e, dateStr)}
                onMouseMove={(e) => handleMouseMove(e, dateStr)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {/* Background grid lines */}
                {timeSlots.map((_, i) => (
                  <div key={i} className="h-24 border-b border-gray-100 pointer-events-none" />
                ))}

                {/* Drag Selection Box */}
                {dragSelection && dragSelection.date === dateStr && (
                  <div 
                    className="absolute left-1 right-1 bg-blue-500/20 border-2 border-blue-500/50 rounded-md pointer-events-none z-10"
                    style={{
                      top: `${Math.min(dragSelection.startY, dragSelection.currentY)}px`,
                      height: `${Math.max(24, Math.abs(dragSelection.currentY - dragSelection.startY))}px`
                    }}
                  />
                )}
                
                {/* Hover Selection Box */}
                {!dragSelection && hoverSelection && hoverSelection.date === dateStr && (
                  <div 
                    className="absolute left-1 right-1 bg-blue-500/10 border-2 border-blue-500/30 rounded-md pointer-events-none z-10 border-dashed"
                    style={{
                      top: `${Math.floor(hoverSelection.y / 24) * 24}px`,
                      height: `192px` // 2 hours default
                    }}
                  />
                )}

                {/* Current Time Indicator */}
                {isSameDay(date, currentTime) && currentTime.getHours() >= 8 && currentTime.getHours() <= 20 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                    style={{ top: `${(currentTime.getHours() - 8) * 96 + (currentTime.getMinutes() / 60) * 96}px` }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                )}
                
                {/* Add button overlay on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                >
                  <button 
                    onClick={() => handleAddClick(date)}
                    className="pointer-events-auto bg-white/90 text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Render active static classes */}
                {activeClasses.map(cls => (
                  <ClassBlock 
                    key={cls.id} 
                    cls={cls} 
                    type="static"
                    onCancel={() => onCancelClass(cls.id!, dateStr)}
                    onEdit={() => setEditingClass({ cls, type: 'static', dateStr })}
                  />
                ))}

                {/* Render canceled static classes */}
                {canceledClasses.map(cls => {
                  const exception = dayExceptions.find(e => e.type === 'canceled' && e.classId === cls.id);
                  return (
                    <ClassBlock 
                      key={`canceled-${cls.id}`} 
                      cls={cls} 
                      type="canceled"
                      onRestore={() => onRestoreClass(exception!.id!)}
                      onEdit={() => setEditingClass({ cls: exception!, type: 'canceled', dateStr })}
                    />
                  );
                })}

                {/* Render additional classes */}
                {additionalClasses.map(cls => (
                  <ClassBlock 
                    key={`add-${cls.id}`} 
                    cls={cls as any} 
                    type="additional"
                    onDelete={() => onDeleteAdditionalClass(cls.id!)}
                    onEdit={() => setEditingClass({ cls, type: 'additional', dateStr })}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <AddClassModal 
          date={selectedDateForAdd!} 
          classes={classes}
          initialStartTime={initialTimeForAdd?.start}
          initialEndTime={initialTimeForAdd?.end}
          onClose={() => {
            setIsModalOpen(false);
            setInitialTimeForAdd(null);
          }} 
          onAdd={(exception) => {
            onAddAdditionalClass(exception);
            setIsModalOpen(false);
            setInitialTimeForAdd(null);
          }} 
        />
      )}

      {editingClass && (
        <EditClassModal
          cls={editingClass.cls}
          type={editingClass.type}
          classes={classes}
          onClose={() => setEditingClass(null)}
          onSave={(id, data, type, newStatus) => {
            if (type === 'static') {
              if (newStatus === 'canceled') {
                onCancelClass(id, editingClass.dateStr);
              } else {
                onUpdateClass(id, data);
              }
            } else if (type === 'additional') {
              if (newStatus === 'canceled') {
                onUpdateException(id, { ...data, type: 'canceled' });
              } else {
                onUpdateException(id, { ...data, type: 'additional' });
              }
            } else if (type === 'canceled') {
              if (newStatus === 'scheduled') {
                if (editingClass.cls.classId) {
                  onRestoreClass(id);
                } else {
                  onUpdateException(id, { ...data, type: 'additional' });
                }
              } else {
                onUpdateException(id, data);
              }
            }
            setEditingClass(null);
          }}
        />
      )}
    </div>
  );
}

function ClassBlock({ 
  cls, 
  type, 
  onCancel, 
  onRestore, 
  onDelete,
  onEdit
}: { 
  cls: ClassSchedule | ClassException, 
  type: 'static' | 'canceled' | 'additional',
  onCancel?: () => void,
  onRestore?: () => void,
  onDelete?: () => void,
  onEdit?: () => void
}) {
  // Calculate position and height based on time
  const startHour = parseInt(cls.startTime!.split(':')[0]);
  const startMin = parseInt(cls.startTime!.split(':')[1]);
  const endHour = parseInt(cls.endTime!.split(':')[0]);
  const endMin = parseInt(cls.endTime!.split(':')[1]);
  
  const topOffset = ((startHour - 8) * 96) + ((startMin / 60) * 96); // 96px per hour (h-24)
  const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
  const height = durationHours * 96;

  return (
    <div 
      className={cn(
        "absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden shadow-sm border transition-all class-block group/block",
        type === 'static' && "bg-blue-50 border-blue-200 text-blue-900 hover:shadow-md",
        type === 'canceled' && "bg-gray-100 border-gray-200 text-gray-500 opacity-70",
        type === 'additional' && "bg-emerald-50 border-emerald-200 text-emerald-900 hover:shadow-md"
      )}
      style={{ top: `${topOffset}px`, height: `${height}px` }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-semibold truncate pr-2" title={cls.module}>
          {type === 'canceled' ? <del>{cls.module}</del> : cls.module}
        </div>
        
        {/* Actions */}
        <div className="opacity-0 group-hover/block:opacity-100 transition-opacity flex-shrink-0 bg-white/80 rounded backdrop-blur-sm flex items-center">
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit class">
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-0.5">
        <div className="text-[10px] opacity-80 font-medium">
          {cls.startTime} - {cls.endTime}
        </div>
        <div className="truncate text-[10px] opacity-90" title={cls.professor}>
          {cls.professor}
        </div>
        <div className="truncate text-[10px] opacity-90 font-medium" title={cls.room}>
          {cls.room}
        </div>
        {type === 'additional' && (
          <div className="inline-block px-1 py-0.5 bg-emerald-100 text-emerald-800 rounded-[3px] text-[9px] font-bold mt-1 uppercase tracking-wider">
            Extra
          </div>
        )}
        {type === 'canceled' && (
          <div className="inline-block px-1 py-0.5 bg-gray-200 text-gray-600 rounded-[3px] text-[9px] font-bold mt-1 uppercase tracking-wider">
            Canceled
          </div>
        )}
        {cls.note && (
          <div className="mt-1 text-[10px] italic opacity-80 border-t border-black/10 pt-0.5">
            {cls.note}
          </div>
        )}
      </div>
    </div>
  );
}
