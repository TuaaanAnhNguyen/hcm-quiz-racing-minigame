// src/lib/roomRouting.ts

const HOST_ROOM_PREFIX = "hcm-quiz-racing-host:";
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";

export interface RoomRoute {
  roomCode: string | null;
  isAdmin: boolean;
  isHostSetup: boolean;
  isInvalidHost: boolean;
}

function randomHex(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function generateRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));

  return Array.from(
    bytes,
    (byte) => ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length],
  ).join("");
}

export function createHostRoom(): {
  roomCode: string;
  adminToken: string;
} {
  const roomCode = generateRoomCode();
  const adminToken = randomHex(32);

  // Keep the private token-to-room association in the host's browser.
  window.localStorage.setItem(`${HOST_ROOM_PREFIX}${adminToken}`, roomCode);

  return { roomCode, adminToken };
}

export function getRoomRoute(): RoomRoute {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/host") {
    return {
      roomCode: null,
      isAdmin: false,
      isHostSetup: true,
      isInvalidHost: false,
    };
  }

  if (path.startsWith("/host/")) {
    const hostMatch = path.match(/^\/host\/([a-f0-9]{64})$/i);
    const adminToken = hostMatch?.[1];
    const roomCode = adminToken
      ? window.localStorage.getItem(`${HOST_ROOM_PREFIX}${adminToken}`)
      : null;

    return {
      roomCode,
      isAdmin: Boolean(roomCode),
      isHostSetup: false,
      isInvalidHost: !roomCode,
    };
  }

  const playerMatch = path.match(/^\/([A-Z0-9]{6})$/i);

  if (playerMatch) {
    return {
      roomCode: playerMatch[1].toUpperCase(),
      isAdmin: false,
      isHostSetup: false,
      isInvalidHost: false,
    };
  }

  return {
    roomCode: null,
    isAdmin: false,
    isHostSetup: false,
    isInvalidHost: false,
  };
}
