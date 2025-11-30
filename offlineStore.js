import { openDB } from 'idb';

const DB_NAME = 'canva_offline';
const STORE = 'designs';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    }
  });
}

export async function saveDesign(design) {
  const db = await getDB();
  await db.put(STORE, design);
}

export async function loadDesign(id) {
  const db = await getDB();
  return db.get(STORE, id);
}
