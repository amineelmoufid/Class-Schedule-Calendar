import React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hour = '08', minute = '00'] = (value || '').split(':');

  // Hours from 08 to 22 (8 AM to 10 PM)
  const hours = Array.from({ length: 15 }).map((_, i) => (i + 8).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="flex items-center space-x-1">
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm w-16 text-center"
      >
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-gray-500 font-medium">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm w-16 text-center"
      >
        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}
