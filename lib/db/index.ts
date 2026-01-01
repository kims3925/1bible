/**
 * IndexedDB 데이터베이스 설정 및 CRUD 함수
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { MeditationEntry, ReadingSession } from '@/types';

const DB_NAME = 'LazyBibleReadDB';
const DB_VERSION = 1;

interface LazyBibleDB {
  meditations: {
    key: string;
    value: MeditationEntry;
    indexes: { 'by-date': string; 'by-passage': string };
  };
  sessions: {
    key: string;
    value: ReadingSession;
    indexes: { 'by-date': string; 'by-passage': string };
  };
}

let dbInstance: IDBPDatabase<LazyBibleDB> | null = null;

/**
 * 데이터베이스 인스턴스 가져오기
 */
async function getDB(): Promise<IDBPDatabase<LazyBibleDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LazyBibleDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 묵상 저장소
      if (!db.objectStoreNames.contains('meditations')) {
        const meditationStore = db.createObjectStore('meditations', { keyPath: 'id' });
        meditationStore.createIndex('by-date', 'createdAt');
        meditationStore.createIndex('by-passage', 'passageId');
      }

      // 세션 저장소
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by-date', 'startedAt');
        sessionStore.createIndex('by-passage', 'passageId');
      }
    },
  });

  return dbInstance;
}

// ============================================
// 묵상 CRUD
// ============================================

/**
 * 묵상 저장
 */
export async function saveMeditation(entry: MeditationEntry): Promise<void> {
  const db = await getDB();
  await db.put('meditations', entry);
}

/**
 * 묵상 조회
 */
export async function getMeditation(id: string): Promise<MeditationEntry | undefined> {
  const db = await getDB();
  return db.get('meditations', id);
}

/**
 * 모든 묵상 조회
 */
export async function getAllMeditations(): Promise<MeditationEntry[]> {
  const db = await getDB();
  return db.getAll('meditations');
}

/**
 * 묵상 삭제
 */
export async function deleteMeditation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('meditations', id);
}

// ============================================
// 세션 CRUD
// ============================================

/**
 * 세션 저장
 */
export async function saveSession(session: ReadingSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

/**
 * 세션 조회
 */
export async function getSession(id: string): Promise<ReadingSession | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

/**
 * 모든 세션 조회
 */
export async function getAllSessions(): Promise<ReadingSession[]> {
  const db = await getDB();
  return db.getAll('sessions');
}

// ============================================
// 데이터 내보내기/가져오기
// ============================================

/**
 * 모든 데이터 내보내기
 */
export async function exportData(): Promise<{
  meditations: MeditationEntry[];
  sessions: ReadingSession[];
  exportedAt: string;
}> {
  const db = await getDB();
  const meditations = await db.getAll('meditations');
  const sessions = await db.getAll('sessions');

  return {
    meditations,
    sessions,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * 데이터 가져오기
 */
export async function importData(data: {
  meditations?: MeditationEntry[];
  sessions?: ReadingSession[];
}): Promise<void> {
  const db = await getDB();

  const tx = db.transaction(['meditations', 'sessions'], 'readwrite');

  if (data.meditations) {
    for (const entry of data.meditations) {
      await tx.objectStore('meditations').put(entry);
    }
  }

  if (data.sessions) {
    for (const session of data.sessions) {
      await tx.objectStore('sessions').put(session);
    }
  }

  await tx.done;
}

/**
 * 모든 데이터 삭제
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['meditations', 'sessions'], 'readwrite');
  await tx.objectStore('meditations').clear();
  await tx.objectStore('sessions').clear();
  await tx.done;
}
