import { useEffect, useRef, useCallback, useState } from 'react';
import onlineStatusService from '~/services/websocket_status.service';

export interface OnlineStatusMessage {
  action: string;
  user_code?: string;
  status?: 'online' | 'offline';
  [key: string]: any;
}

export interface UseOnlineStatusReturn {
  isConnected: boolean;
  connect: (weSappCodeId: string) => Promise<void>;
  disconnect: () => void;
  requestUserStatus: (userCode: string) => void;
  addStatusListener: (type: string, callback: (data: OnlineStatusMessage) => void) => void;
  removeStatusListener: (type: string, callback: (data: OnlineStatusMessage) => void) => void;
  currentWeSappCodeId: string | null;
}

/**
 * Hook React pour gérer le statut en ligne des utilisateurs via WebSocket
 * Wrapper autour de websocket_status.service.ts pour intégration React
 */
export const useOnlineStatus = (): UseOnlineStatusReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentWeSappCodeId, setCurrentWeSappCodeId] = useState<string | null>(null);
  
  // Utiliser des refs pour éviter les re-renders excessifs
  const listenersRef = useRef<Map<string, (data: OnlineStatusMessage) => void>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);

  // Fonction pour se connecter au service de statut en ligne
  const connect = useCallback(async (weSappCodeId: string): Promise<void> => {
    try {
      await onlineStatusService.connect(weSappCodeId);
      setCurrentWeSappCodeId(weSappCodeId);
      setIsConnected(true);
    } catch (error) {
      console.error('Erreur lors de la connexion au service de statut en ligne:', error);
      setIsConnected(false);
    }
  }, []);

  // Fonction pour se déconnecter du service
  const disconnect = useCallback(() => {
    onlineStatusService.disconnect();
    setIsConnected(false);
    setCurrentWeSappCodeId(null);
  }, []);

  // Fonction pour demander le statut d'un utilisateur
  const requestUserStatus = useCallback((userCode: string) => {
    onlineStatusService.requestUserStatus(userCode);
  }, []);

  // Fonction pour ajouter un listener de statut
  const addStatusListener = useCallback((type: string, callback: (data: OnlineStatusMessage) => void) => {
    // Stocker le callback dans la ref pour pouvoir le supprimer plus tard
    listenersRef.current.set(`${type}_${callback.toString()}`, callback);
    onlineStatusService.addMessageListener(type, callback);
  }, []);

  // Fonction pour supprimer un listener de statut
  const removeStatusListener = useCallback((type: string, callback: (data: OnlineStatusMessage) => void) => {
    const key = `${type}_${callback.toString()}`;
    listenersRef.current.delete(key);
    onlineStatusService.removeMessageListener(type, callback);
  }, []);

  // Cleanup à la désinscription du composant
  useEffect(() => {
    return () => {
      // Nettoyer tous les listeners de statut
      listenersRef.current.forEach((callback, key) => {
        const [type] = key.split('_');
        onlineStatusService.removeMessageListener(type, callback);
      });
      listenersRef.current.clear();
      
      // Déconnexion du service
      onlineStatusService.disconnect();
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    requestUserStatus,
    addStatusListener,
    removeStatusListener,
    currentWeSappCodeId
  };
};

export default useOnlineStatus;