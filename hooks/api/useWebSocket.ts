import { useEffect, useRef, useCallback, useState } from 'react';
import websocketService from '~/services/websocket.service';

export type WebSocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  action: string;
  message?: any;
  [key: string]: any;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: WebSocketConnectionStatus;
  sendMessage: (action: string, payload: any) => boolean;
  subscribeToConversation: (conversationId: string) => Promise<boolean>;
  unsubscribeFromConversation: () => void;
  markMessageAsRead: (messageId: string) => Promise<boolean>;
  deleteMessage: (messageIds: string) => Promise<boolean>;
  addMessageListener: (type: string, callback: (data: WebSocketMessage) => void) => void;
  removeMessageListener: (type: string, callback: (data: WebSocketMessage) => void) => void;
  activeConversationId: string | null;
}

/**
 * Hook React pour gérer les connexions WebSocket
 * Wrapper autour de websocket.service.ts pour intégration React
 */
export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>('disconnected');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Utiliser des refs pour éviter les re-renders excessifs
  const listenersRef = useRef<Map<string, (data: WebSocketMessage) => void>>(new Map());
  const connectionListenerRef = useRef<(connected: boolean) => void>();

  // Gestionnaire de changement d'état de connexion
  useEffect(() => {
    const connectionListener = (connected: boolean) => {
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      
      if (!connected) {
        setActiveConversationId(null);
      }
    };

    connectionListenerRef.current = connectionListener;
    websocketService.addConnectionListener(connectionListener);

    // Cleanup à la désinscription du composant
    return () => {
      if (connectionListenerRef.current) {
        websocketService.removeConnectionListener(connectionListenerRef.current);
      }
      
      // Nettoyer tous les listeners de messages
      listenersRef.current.forEach((callback, type) => {
        websocketService.removeMessageListener(type, callback);
      });
      listenersRef.current.clear();
    };
  }, []);

  // Fonction pour envoyer un message
  const sendMessage = useCallback((action: string, payload: any): boolean => {
    return websocketService.sendMessage(action, payload);
  }, []);

  // Fonction pour s'abonner à une conversation
  const subscribeToConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    setConnectionStatus('connecting');
    
    try {
      const success = await websocketService.subscribeToConversation(conversationId);
      
      if (success) {
        setActiveConversationId(conversationId);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
      
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'abonnement à la conversation:', error);
      setConnectionStatus('error');
      return false;
    }
  }, []);

  // Fonction pour se désabonner d'une conversation
  const unsubscribeFromConversation = useCallback(() => {
    websocketService.unsubscribeFromConversation();
    setActiveConversationId(null);
    setConnectionStatus('disconnected');
  }, []);

  // Fonction pour marquer un message comme lu
  const markMessageAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    return await websocketService.markMessageAsRead(messageId);
  }, []);

  // Fonction pour supprimer un message
  const deleteMessage = useCallback(async (messageIds: string): Promise<boolean> => {
    return await websocketService.deleteMessage(messageIds);
  }, []);

  // Fonction pour ajouter un listener de message
  const addMessageListener = useCallback((type: string, callback: (data: WebSocketMessage) => void) => {
    // Stocker le callback dans la ref pour pouvoir le supprimer plus tard
    listenersRef.current.set(`${type}_${callback.toString()}`, callback);
    websocketService.addMessageListener(type, callback);
  }, []);

  // Fonction pour supprimer un listener de message
  const removeMessageListener = useCallback((type: string, callback: (data: WebSocketMessage) => void) => {
    const key = `${type}_${callback.toString()}`;
    listenersRef.current.delete(key);
    websocketService.removeMessageListener(type, callback);
  }, []);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    subscribeToConversation,
    unsubscribeFromConversation,
    markMessageAsRead,
    deleteMessage,
    addMessageListener,
    removeMessageListener,
    activeConversationId
  };
};

export default useWebSocket;