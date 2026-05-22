import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Company } from '../types';
import { initialCompanies } from '../data/initialCompanies';

// Data is stored under each user's own namespace: users/{uid}/companies/{id}
function companiesCol(uid: string) {
  return collection(db, 'users', uid, 'companies');
}
function companyDoc(uid: string, id: string) {
  return doc(db, 'users', uid, 'companies', id);
}

export function useCompanies(uid: string) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    // Seed initial data if the user's collection is empty
    getDocs(companiesCol(uid)).then(snap => {
      if (snap.empty) {
        Promise.all(
          initialCompanies.map(c => setDoc(companyDoc(uid, c.id), c))
        );
      }
    });

    // Real-time listener — syncs across all devices instantly
    const unsub = onSnapshot(companiesCol(uid), snap => {
      const data = snap.docs
        .map(d => {
          const raw = d.data() as Company & { internDates?: string };
          // 旧フィールド名 internDates → eventDates に自動マッピング
          if (!raw.eventDates && raw.internDates) {
            raw.eventDates = raw.internDates;
          }
          // type フィールドがない旧データはインターンとして扱う
          if (!raw.type) raw.type = 'インターン';
          return raw as Company;
        })
        .sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      setCompanies(data);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  const addCompany = async (company: Omit<Company, 'id'>) => {
    const id = Date.now().toString();
    await setDoc(companyDoc(uid, id), { ...company, id });
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    await updateDoc(companyDoc(uid, id), updates);
  };

  const deleteCompany = async (id: string) => {
    await deleteDoc(companyDoc(uid, id));
  };

  return { companies, loading, addCompany, updateCompany, deleteCompany };
}
