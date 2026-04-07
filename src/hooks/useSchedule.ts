import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ClassSchedule, ClassException } from '../types';

const INITIAL_CLASSES: ClassSchedule[] = [
  { dayOfWeek: 'Friday', startTime: '10:30', endTime: '12:30', module: 'Méthodologie de recherche scientifique', professor: 'Mr. BELHAJ Youssef', room: 'Amphi 17' },
  { dayOfWeek: 'Tuesday', startTime: '14:30', endTime: '16:30', module: 'Méthodes Statistiques Appliquées à la Finance', professor: 'Mr. ALJ Abdelkamel', room: 'Amphi 11' },
  { dayOfWeek: 'Thursday', startTime: '10:30', endTime: '12:30', module: 'Comptabilité des Sociétés Approfondie', professor: 'Mr. NEJJARI Mohamed', room: 'Amphi 1' },
  { dayOfWeek: 'Wednesday', startTime: '10:30', endTime: '12:30', module: 'Ingénierie Fiscale', professor: 'Mr. EL ATIKI GUENNOUNI AZIZ', room: 'Amphi 13' },
  { dayOfWeek: 'Tuesday', startTime: '16:30', endTime: '18:30', module: 'Contrôle de Gestion Approfondi', professor: 'Mr. DAABAJI Abouziane', room: 'Amphi 11' },
  { dayOfWeek: 'Wednesday', startTime: '08:30', endTime: '10:30', module: 'Culture entrepreneuriale', professor: 'Mr. AZZOUZI Abdelmalek', room: 'Amphi 13' },
  { dayOfWeek: 'Saturday', startTime: '10:30', endTime: '12:30', module: 'Techniques de communication', professor: 'Mme. BENSALAH Fatima Zahra', room: 'Amphi 14' },
  { dayOfWeek: 'Monday', startTime: '14:30', endTime: '16:30', module: 'Company environment and organization', professor: 'Mr. KADOUS Mohammed / Mme. ADDYOUBAH Fatiha', room: 'Amphi 11' }
];

export function useSchedule() {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [exceptions, setExceptions] = useState<ClassException[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'classes'));
        if (snapshot.empty) {
          console.log('Bootstrapping initial classes...');
          for (const cls of INITIAL_CLASSES) {
            await addDoc(collection(db, 'classes'), cls);
          }
        }
      } catch (error) {
        console.error('Error bootstrapping data:', error);
      }
    };

    bootstrapData();

    const unsubscribeClasses = onSnapshot(query(collection(db, 'classes')), (snapshot) => {
      const classesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassSchedule));
      
      // Deduplicate to prevent UI issues from strict-mode double bootstrapping
      const uniqueClasses = classesData.filter((cls, index, self) => 
        index === self.findIndex((c) => (
          c.dayOfWeek === cls.dayOfWeek && 
          c.startTime === cls.startTime && 
          c.module === cls.module
        ))
      );
      
      setClasses(uniqueClasses);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching classes:', error);
      setLoading(false);
    });

    const unsubscribeExceptions = onSnapshot(query(collection(db, 'exceptions')), (snapshot) => {
      const exceptionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassException));
      setExceptions(exceptionsData);
    }, (error) => {
      console.error('Error fetching exceptions:', error);
    });

    return () => {
      unsubscribeClasses();
      unsubscribeExceptions();
    };
  }, []);

  const cancelClass = async (classId: string, date: string) => {
    try {
      await addDoc(collection(db, 'exceptions'), {
        type: 'canceled',
        classId,
        date
      });
    } catch (error) {
      console.error('Error canceling class:', error);
    }
  };

  const restoreClass = async (exceptionId: string) => {
    try {
      await deleteDoc(doc(db, 'exceptions', exceptionId));
    } catch (error) {
      console.error('Error restoring class:', error);
    }
  };

  const addAdditionalClass = async (exception: Omit<ClassException, 'id'>) => {
    try {
      await addDoc(collection(db, 'exceptions'), exception);
    } catch (error) {
      console.error('Error adding additional class:', error);
    }
  };

  const deleteAdditionalClass = async (exceptionId: string) => {
    try {
      await deleteDoc(doc(db, 'exceptions', exceptionId));
    } catch (error) {
      console.error('Error deleting additional class:', error);
    }
  };

  const updateClass = async (classId: string, data: Partial<ClassSchedule>) => {
    try {
      await updateDoc(doc(db, 'classes', classId), data);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const updateException = async (exceptionId: string, data: Partial<ClassException>) => {
    try {
      await updateDoc(doc(db, 'exceptions', exceptionId), data);
    } catch (error) {
      console.error('Error updating exception:', error);
    }
  };

  const resetSchedule = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'classes'));
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'classes', docSnapshot.id));
      }
      for (const cls of INITIAL_CLASSES) {
        await addDoc(collection(db, 'classes'), cls);
      }
    } catch (error) {
      console.error('Error resetting schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
