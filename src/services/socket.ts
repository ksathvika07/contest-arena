import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected. Socket ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected. Reason:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
}

export function joinContestRoom(contestId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:contest', contestId);
  } else {
    s.once('connect', () => {
      s.emit('join:contest', contestId);
    });
  }
}

export function leaveContestRoom(contestId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('leave:contest', contestId);
  }
}
