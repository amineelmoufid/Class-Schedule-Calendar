export interface ClassSchedule {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  module: string;
  professor: string;
  room: string;
  note?: string;
}

export interface ClassException {
  id?: string;
  date: string; // YYYY-MM-DD
  type: 'canceled' | 'additional';
  classId?: string; // If canceled, which static class is canceled
  startTime?: string;
  endTime?: string;
  module?: string;
  professor?: string;
  room?: string;
  note?: string;
}
