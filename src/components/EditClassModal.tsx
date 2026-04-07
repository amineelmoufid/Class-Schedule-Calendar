import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ClassSchedule, ClassException } from '../types';
import { TimePicker } from './TimePicker';

interface EditClassModalProps {
  cls: ClassSchedule | ClassException;
  type: 'static' | 'additional' | 'canceled';
  classes: ClassSchedule[];
  onClose: () => void;
  onSave: (id: string, data: any, type: 'static' | 'additional' | 'canceled', newStatus: 'scheduled' | 'canceled') => void;
}

export function EditClassModal({ cls, type, classes, onClose, onSave }: EditClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [startTime, setStartTime] = useState(cls.startTime || '08:00');
  const [endTime, setEndTime] = useState(cls.endTime || '10:00');
  const [module, setModule] = useState(cls.module || '');
  const [professor, setProfessor] = useState(cls.professor || '');
  const [room, setRoom] = useState(cls.room || '');
  const [note, setNote] = useState(cls.note || '');
  const [status, setStatus] = useState<'scheduled' | 'canceled'>(type === 'canceled' ? 'canceled' : 'scheduled');

  const uniqueClasses = Array.from(new Map(classes.map(c => [c.module, c])).values());

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    if (classId) {
      const selected = classes.find(c => c.id === classId);
      if (selected) {
        setModule(selected.module);
        setProfessor(selected.professor);
        setRoom(selected.room);
        setStartTime(selected.startTime);
        setEndTime(selected.endTime);
        setNote(selected.note || '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cls.id!, { startTime, endTime, module, professor, room, note }, type, status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">
            Edit Class
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Select Existing Class</label>
            <select
              value={selectedClassId}
              onChange={e => handleClassSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">-- Custom Class --</option>
              {uniqueClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.module} ({c.professor})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="canceled-status-edit"
              checked={status === 'canceled'}
              onChange={e => setStatus(e.target.checked ? 'canceled' : 'scheduled')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="canceled-status-edit" className="text-sm font-medium text-gray-700">
              Mark as Canceled
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Start Time</label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">End Time</label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Module</label>
            <input
              type="text"
              required
              list="modules-list"
              value={module}
              onChange={e => setModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <datalist id="modules-list">
              {uniqueClasses.map(c => <option key={c.id} value={c.module} />)}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Professor</label>
            <input
              type="text"
              required
              list="professors-list"
              value={professor}
              onChange={e => setProfessor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <datalist id="professors-list">
              {Array.from(new Set(classes.map(c => c.professor))).map(p => <option key={p} value={p} />)}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Room</label>
            <input
              type="text"
              required
              list="rooms-list"
              value={room}
              onChange={e => setRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <datalist id="rooms-list">
              {Array.from(new Set(classes.map(c => c.room))).map(r => <option key={r} value={r} />)}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Note (Optional)</label>
            <textarea
              placeholder="e.g. Bring your laptops"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-20"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
