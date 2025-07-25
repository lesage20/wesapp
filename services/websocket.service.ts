import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '~/store/store';

// Configuration et constantes
const WEBSOCKET_RECONNECT_TIMEOUT = 5000; // 5 secondes entre les tentatives
const MAX_RECONNECT_ATTEMPTS = 3; // Nombre maximum de tentatives de reconnexion

/**
 * Format des messages WebSocket:
 * {
 *     "action": "new_message",
 *     "message": {
 *         "id": "febef683-30a5-4c72-8c40-d2ec4465f6e0",
 *         "conversation_id": "f130304b-e181-4aff-9c45-8a3e7a793cb4",
 *         "sender_id": "9f7276ce-f608-4ba8-a8d4-003e0a10fb30",
 *         "content": "Salut, comment vas-tu ?",
 *         "timestamp": "2025-05-03T14:34:38.038383+00:00",
 *         "is_read": false
 *     }
 * }
 */

class WebSocketService {
  private socket: WebSocket | null = null;
  private baseUrl: string = '';
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private messageListeners: Map<string, Array<(data: any) => void>> = new Map();
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private activeConversationId: string | null = null;
  private lastConnectUrl: string | null = null;
  private readonly maxReconnectAttempts: number = MAX_RECONNECT_ATTEMPTS;
  
  /**
   * Notifie tous les écouteurs d'un changement d'état de connexion
   * @param connected - Le nouvel état de connexion
   */
  private notifyConnectionChange(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Erreur dans un écouteur de connexion:', error);
      }
    });
  }

  constructor(baseUrl: string) {
    // Conversion du protocole HTTP vers WebSocket
    this.baseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    // Retirer un éventuel slash à la fin du baseUrl
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
    // Ajouter le chemin pour les conversations
    this.baseUrl = `${this.baseUrl}/wss/conversations`;
  }

  // Connexion au WebSocket avec authentification
  async connect(conversationId?: string): Promise<void> {
    // Vérifier si déjà connecté à la même conversation
    if (this.socket?.readyState === WebSocket.OPEN && this.activeConversationId === conversationId) {
      console.log('WebSocket déjà connecté à cette conversation');
      return;
    }
    
    // Vérifier si tentative de connexion déjà en cours
    if (this.isConnecting) {
      console.log('Tentative de connexion WebSocket déjà en cours');
      return;
    }

    // Fermer toute connexion existante avant d'en ouvrir une nouvelle
    if (this.socket) {
      console.log('Fermeture de la connexion existante avant reconnexion');
      this.socket.close();
      this.socket = null;
    }

    this.isConnecting = true;

    try {
      // Récupérer le token d'authentification
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('Aucun token d\'authentification disponible pour la connexion WebSocket');
        this.isConnecting = false;
        return;
      }

      // Créer l'URL de connexion avec le token et l'ID de conversation si disponible
      let url;
      if (conversationId) {
        // Url pour une conversation spécifique (format exact fourni par l'utilisateur)
        url = `${this.baseUrl}/${conversationId}/?token=${encodeURIComponent(authToken)}`;
        this.activeConversationId = conversationId;
      } else {
        // Connexion générale
        url = `${this.baseUrl}/?token=${encodeURIComponent(authToken)}`;
        this.activeConversationId = null;
      }
      
      // Conserver l'URL pour les tentatives futures
      this.lastConnectUrl = url;
      
      console.log(`Tentative de connexion WebSocket à ${url}`);
      this.socket = new WebSocket(url);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      this.isConnecting = false;
      this.notifyConnectionChange(false);
    }
  }

  // Déconnexion manuelle du WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.activeConversationId = null;
      this.notifyConnectionChange(false);
      console.log('Déconnecté du WebSocket');
    }
  }

  // Envoi d'un message au serveur WebSocket
  sendMessage(action: string, payload: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Tentative d\'envoi de message sur un WebSocket fermé');
      return false;
    }

    try {
      const message = JSON.stringify({
        action,
        ...payload
      });
      this.socket.send(message);
      console.log(`Message envoyé: ${message}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message WebSocket:', error);
      return false;
    }
  }

  // S'abonner à une conversation spécifique avec vérification d'état et nouvelles tentatives
  async subscribeToConversation(conversationId: string): Promise<boolean> {
    console.log(`Tentative d'abonnement à la conversation ${conversationId}`);
    
    // Vérifier d'abord si déjà connecté à cette conversation
    if (this.isActiveConversation(conversationId)) {
      console.log('Déjà connecté à cette conversation');
      return true;
    }
    
    // Nombre maximal de tentatives
    const maxRetries = 1;
    let retryCount = 0;
    let connected = false;
    
    while (retryCount < maxRetries && !connected) {
      try {
        retryCount++;
        console.log(`Tentative de connexion ${retryCount}/${maxRetries}...`);
        
        // Fermer toute connexion existante avant d'en établir une nouvelle
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
          this.socket.close();
          // Attendre que la connexion précédente soit fermée
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Établir une nouvelle connexion
        await this.connect(conversationId);
        
        // Attendre plus longtemps pour s'assurer que la connexion est établie
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Vérifier si la connexion a réussi
        connected = this.isConnected();
        console.log(`Vérification de la connexion (tentative ${retryCount}): ${connected ? 'SUCCES' : 'ECHEC'}`);
        
        if (connected) {
          // Enregistrer la conversation comme active
          this.activeConversationId = conversationId;
          break;
        }
        
        // Attendre avant de réessayer si la tentative échoue
        if (!connected && retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Attente progressive
        }
      } catch (error) {
        console.error(`Erreur lors de la tentative de connexion ${retryCount}:`, error);
        // Attendre avant de réessayer après une erreur
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Attente progressive
        }
      }
    }
    
    if (!connected) {
      console.error('Toutes les tentatives de connexion WebSocket ont échoué');
    } else {
      console.log('Connexion WebSocket établie avec succès après', retryCount, 'tentative(s)');
      // Envoyer un message de souscription une fois connecté
      this.sendSubscriptionMessage(conversationId);
    }
    
    return connected;
  }

  // Se désabonner d'une conversation spécifique
  unsubscribeFromConversation(): void {
    // Déconnexion de la conversation actuelle
    this.disconnect();
  }

  // Ajouter un écouteur pour un type de message spécifique
  addMessageListener(type: string, callback: (data: any) => void): void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }
    
    const listeners = this.messageListeners.get(type);
    if (listeners && !listeners.includes(callback)) {
      listeners.push(callback);
    }
  }

  // Supprimer un écouteur pour un type de message spécifique
  removeMessageListener(type: string, callback: (data: any) => void): void {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Ajout d'un écouteur de l'état de connexion
  addConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners.push(callback);
    
    // Notifier immédiatement de l'état actuel
    if (this.socket) {
      callback(this.socket.readyState === WebSocket.OPEN);
    } else {
      callback(false);
    }
  }

  // Suppression d'un écouteur de l'état de connexion
  removeConnectionListener(callback: (connected: boolean) => void): void {
    const index = this.connectionListeners.indexOf(callback);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  // Gestionnaires d'événements WebSocket
  handleOpen(): void {
    console.log('Connexion WebSocket établie');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionChange(true);

    // Avec la nouvelle architecture, l'abonnement est déjà inclus dans l'URL
    console.log(`Connecté à la conversation: ${this.activeConversationId || 'WebSocket général'}`);
  }

  handleClose(event: CloseEvent): void {
    console.log(`Connexion WebSocket fermée: ${event.code} ${event.reason}`);
    this.socket = null;
    this.isConnecting = false;
    this.notifyConnectionChange(false);
    
    // Ne jamais essayer de se reconnecter automatiquement après une déconnexion volontaire ou une erreur serveur
    // Cela évite les boucles infinies de reconnexion
    // L'application devrait explicitement appeler connect() lorsque nécessaire
    if (event.code === 1006 && !event.reason.includes('500') && !event.reason.includes('Error')) {
      // Code 1006 = fermeture anormale, uniquement si ce n'est pas une erreur 500 ou une autre erreur connue
      console.log("Tentative de reconnexion programmée après fermeture anormale sans erreur");
      this.scheduleReconnect();
    }
  }

  handleError(event: Event): void {
    console.log('Erreur WebSocket:', event);
    this.notifyConnectionChange(false);
  }

  handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message reçu:', data);
      
      // Traitement spécifique pour le format {action: 'new_message', message: {...}}
      if (data && data.action) {
        // Notifier tous les écouteurs pour ce type d'action
        const listeners = this.messageListeners.get(data.action) || [];
        
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Erreur dans un écouteur de type '${data.action}':`, error?.message || JSON.stringify(error) || error);
          }
        });
        
        // Notifier aussi les écouteurs génériques ('*')
        const genericListeners = this.messageListeners.get('*') || [];
        genericListeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Erreur dans un écouteur générique:`, error?.message || JSON.stringify(error) || error);
          }
        });
      } else {
        console.warn('Message WebSocket reçu sans action définie:', data);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message WebSocket:', error?.message || JSON.stringify(error) || error);
    }
  }

  sendSubscriptionMessage(conversationId: string): void {
    this.sendMessage('subscribe', { conversation_id: conversationId });
  }

  private scheduleReconnect(delay = WEBSOCKET_RECONNECT_TIMEOUT): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Nombre maximum de tentatives de reconnexion atteint');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms...`);
    
    setTimeout(() => {
      console.log('Tentative de reconnexion WebSocket...');
      
      // Utiliser la dernière URL de connexion si disponible
      if (this.lastConnectUrl && (!this.socket || this.socket.readyState !== WebSocket.OPEN)) {
        // Si nous avons un ID de conversation actif, réutiliser celui-ci
        if (this.activeConversationId) {
          this.connect(this.activeConversationId);
        } else {
          this.connect();
        }
      }
    }, delay);
  }

  // Vérifier si le WebSocket est actuellement connecté
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Vérifier si on est déjà connecté à la conversation spécifiée
  isActiveConversation(conversationId: string): boolean {
    return this.isConnected() && this.activeConversationId === conversationId;
  }

  /**
   * Marque un message comme lu via WebSocket
   * @param messageId - L'ID du message à marquer comme lu
   */
  /**
   * Marque un message comme lu via WebSocket
   * @param messageId - L'ID du message à marquer comme lu
   */
  async markMessageAsRead(messageId: string): Promise<boolean> {
    if (!messageId) {
      console.error('ID de message requis pour marquer comme lu');
      return false;
    }
    
    try {
      // Récupérer le sender_id (l'ID de l'utilisateur actuel)
      const { user } = useAuthStore.getState();
      if (!user || !user.id) {
        console.error('Impossible de récupérer l\'ID de l\'utilisateur pour marquer le message comme lu');
        return false;
      }
      
      console.log(`Marquer le message ${messageId} comme lu avec sender_id ${user.id}`);
      return this.sendMessage('mark_message_as_read', {
        
          conversation_id: this.activeConversationId,
          sender_id: user.id,
          message_id: messageId
        
      });
    } catch (error) {
      // console.error('Erreur lors du marquage du message comme lu:', error?.message || JSON.stringify(error) || error);
      return false;
    }
  }

  async deleteMessage(messageIds: string): Promise<boolean> {
    if (!messageIds) {
      console.error('ID de message requis pour supprimer le message');
      return false;
    }
    
    try {
      // Récupérer le sender_id (l'ID de l'utilisateur actuel)
      const { user } = useAuthStore.getState();
      if (!user || !user.id) {
        console.error('Impossible de récupérer l\'ID de l\'utilisateur pour supprimer le message');
        return false;
      }
      

      
      // Format corrigé pour correspondre à ce que le backend attend
      // Utiliser message_ids comme tableau d'identifiants
      return this.sendMessage('delete_message', {
       
          conversation_id: this.activeConversationId,
          sender_id: user.id,
          message_ids: messageIds
        
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error?.message || JSON.stringify(error) || error);
      return false;
    }
  }
}

// Créer une instance unique du service WebSocket
const websocketService = new WebSocketService('https://wesapp.waretrack.online');
// const websocketService = new WebSocketService('http://192.168.1.2:8091');


export default websocketService;
