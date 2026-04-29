import { 
  doc, 
  setDoc, 
  onSnapshot, 
  runTransaction, 
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GameState, TradeOffer, Player } from '../types';

export const GameService = {
  async createGame(roomId: string, initialState: GameState) {
    try {
      await setDoc(doc(db, 'games', roomId), initialState);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `games/${roomId}`);
    }
  },

  subscribeToGame(roomId: string, onUpdate: (game: GameState) => void) {
    return onSnapshot(doc(db, 'games', roomId), (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as GameState);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `games/${roomId}`);
    });
  },

  async joinGame(roomId: string, player: Player) {
    try {
      await runTransaction(db, async (transaction) => {
        const gameRef = doc(db, 'games', roomId);
        const gameSnap = await transaction.get(gameRef);
        
        if (!gameSnap.exists()) throw new Error('Game not found');
        
        const gameData = gameSnap.data() as GameState;
        if (gameData.status !== 'waiting') throw new Error('Game already started');
        if (gameData.players.length >= 8) throw new Error('Game is full');
        if (gameData.players.find(p => p.uid === player.uid)) return;

        const newPlayers = [...gameData.players, player];
        transaction.update(gameRef, { 
          players: newPlayers,
          log: [...gameData.log, { 
            message: `${player.name} joined the game.`, 
            timestamp: Date.now(), 
            type: 'info' 
          }]
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${roomId}`);
    }
  },

  async startGame(roomId: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const gameRef = doc(db, 'games', roomId);
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;
        
        const gameData = gameSnap.data() as GameState;
        transaction.update(gameRef, { 
          status: 'playing',
          log: [...gameData.log, { 
            message: `The game has started!`, 
            timestamp: Date.now(), 
            type: 'success' 
          }]
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${roomId}`);
    }
  },

  async updateGameState(roomId: string, updates: Partial<GameState>) {
    try {
      await setDoc(doc(db, 'games', roomId), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `games/${roomId}`);
    }
  },

  async performTurn(roomId: string, logic: (state: GameState) => Partial<GameState>) {
    try {
      await runTransaction(db, async (transaction) => {
        const gameRef = doc(db, 'games', roomId);
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;
        
        const gameData = gameSnap.data() as GameState;
        const updates = logic(gameData);
        transaction.update(gameRef, updates);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `games/${roomId}`);
    }
  }
};

export const TradeService = {
  subscribeToTrades(roomId: string, onUpdate: (trades: TradeOffer[]) => void) {
    return onSnapshot(
      query(collection(db, 'games', roomId, 'trades'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        onUpdate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TradeOffer)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `games/${roomId}/trades`);
      }
    );
  },

  async createTrade(roomId: string, trade: Omit<TradeOffer, 'id' | 'createdAt'>) {
    try {
      const tradeRef = doc(collection(db, 'games', roomId, 'trades'));
      await setDoc(tradeRef, { ...trade, createdAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `games/${roomId}/trades`);
    }
  }
};
