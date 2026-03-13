const SAVE_VERSION = 1;
const SAVE_KEY = "imperfect-game-save-slots";
const SLOT_IDS = [1, 2, 3];

function createEmptyStore() {
  return {
    version: SAVE_VERSION,
    slots: {
      1: null,
      2: null,
      3: null
    }
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStore() {
  if (!canUseStorage()) return createEmptyStore();

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createEmptyStore();

    const parsed = JSON.parse(raw);
    if (parsed?.version !== SAVE_VERSION || typeof parsed?.slots !== "object") {
      return createEmptyStore();
    }

    const normalized = createEmptyStore();
    for (const id of SLOT_IDS) {
      const slotData = parsed.slots[id];
      normalized.slots[id] = slotData ?? null;
    }

    return normalized;
  } catch {
    return createEmptyStore();
  }
}

function writeStore(store) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(store));
}

export function listSlots() {
  const store = readStore();

  return SLOT_IDS.map((id) => {
    const slot = store.slots[id];
    if (!slot) {
      return {
        id,
        isEmpty: true,
        updatedAt: null,
        day: null,
        money: null,
        version: SAVE_VERSION
      };
    }

    return {
      id,
      isEmpty: false,
      updatedAt: slot.updatedAt,
      day: slot.day,
      money: slot.money,
      version: slot.version ?? SAVE_VERSION
    };
  });
}

export function loadSlot(slotId) {
  const store = readStore();
  const slot = store.slots[slotId];
  return slot?.state ? structuredClone(slot.state) : null;
}

export function saveSlot(slotId, gameState) {
  const store = readStore();

  store.slots[slotId] = {
    id: slotId,
    version: SAVE_VERSION,
    updatedAt: new Date().toISOString(),
    day: gameState?.meta?.day ?? 1,
    money: gameState?.player?.money ?? 0,
    state: structuredClone(gameState)
  };

  writeStore(store);
  return store.slots[slotId];
}

export function clearSlot(slotId) {
  const store = readStore();
  store.slots[slotId] = null;
  writeStore(store);
}
