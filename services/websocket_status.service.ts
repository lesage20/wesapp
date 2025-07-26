import AsyncStorage from "@react-native-async-storage/async-storage";

type MessageCallback = (data: any) => void;

class OnlineStatusWebSocketService {
  private socket: WebSocket | null = null;
  private messageListeners: Map<string, MessageCallback[]> = new Map();
  private isConnecting = false;
  private weSappCodeId: string | null = null;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
    this.baseUrl = `${this.baseUrl}/wss/get-online`;
  }

  async connect(weSappCodeId: string) {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;

    try {
      // const token = await AsyncStorage.getItem("authToken");
      // if (!token) throw new Error("No auth token");
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('Aucun token d\'authentification disponible pour la connexion WebSocket');
        this.isConnecting = false;
        return;
      }
      
      this.weSappCodeId = weSappCodeId;
      const url = `${this.baseUrl}/${weSappCodeId}/?token=${encodeURIComponent(authToken)}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("Online status WebSocket connecté");
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data?.action;
          if (type && this.messageListeners.has(type)) {
            this.messageListeners.get(type)!.forEach(cb => cb(data));
          }
        } catch (err) {
          console.error("Erreur parsing online status message:", err);
        }
      };

      this.socket.onclose = () => {
        console.log("Online status WebSocket fermé");
        this.socket = null;
        this.isConnecting = false;
      };

      this.socket.onerror = (e) => {
        console.error("Erreur WebSocket status:", e);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("Erreur connexion WebSocket status:", error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }


  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket non connecté, impossible d’envoyer un message.");
    }
  }

  requestUserStatus(userCode: string) {
    this.sendMessage({
      action: "get_status",
      user_code: userCode,
    });
  }

  addMessageListener(type: string, callback: MessageCallback) {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }

    const listeners = this.messageListeners.get(type)!;
    if (!listeners.includes(callback)) {
      listeners.push(callback);
      
    }
  }

  removeMessageListener(type: string, callback: MessageCallback) {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      this.messageListeners.set(
        type,
        listeners.filter((cb) => cb !== callback)
      );
    }
  }
}

const onlineStatusService = new OnlineStatusWebSocketService('https://wesapp.waretrack.online');
// const onlineStatusService = new OnlineStatusWebSocketService('http://192.168.1.87:8091');

export default onlineStatusService;
