import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
// import { useNotificationSettingsStore } from '@/stores/notification-settings-store';
// import useWesappCodeStore from '@/stores/wesapp-code-store';
import websocketService from './websocket.service';



const sendMessage = async (data: any, userText: string) => {
  websocketService.subscribeToConversation(data.conversationId);

  websocketService.sendMessage("send_message", {
    conversation: data.conversationId,
    content: userText,
    sender_id: data.receiverId.toString(),
    file: "",
    type: "TEXT",
    reply_to_id: null,
  });
  return;
}
// Configurer les catégories de notification
 async function setupNotificationCategories(currentCode: any) {
  try {
    // const currentCode = useWesappCodeStore.getState().currentCode;

    if (!currentCode?.code) {
      console.log('Skipping notification category setup: User not authenticated');
      return;
    }
    // Définir une catégorie pour les messages avec actions "Ouvrir" et "Répondre"
    await Notifications.setNotificationCategoryAsync('new_message', [
      {
        identifier: 'OPEN',
        buttonTitle: 'Ouvrir',
        options: {
          opensAppToForeground: true,
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: 'REPLY',
        buttonTitle: 'Répondre',
        options: {
          opensAppToForeground: false,
          isDestructive: false,
          isAuthenticationRequired: false,
        },
        textInput: {
          submitButtonTitle: 'Envoyer',
          placeholder: 'Tapez votre réponse...',
        },
      },
    ]);

    // Configurer les canaux Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la configuration des catégories de notification:', error);
  }
}


// Gestionnaire de notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    try {
      const data = notification.request.content.data || {};
      // console.log('Received notification:', notification);

      // Récupérer le son depuis le store
      const receiverCode = currentCode?.code || '';
      // const sound = useNotificationSettingsStore.getState().getNotificationSound(receiverCode) || 'note';
      // console.log('Selected sound:', sound);

      // Personnaliser le titre/body pour inclure senderName
      const senderName = data.senderName || 'Contact';
      const notificationContent = {
        title: `${senderName}`,
        body: notification.request.content.body || 'Nouveau message',
        data,
      };
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        // sound: `${sound}.wav`,
        categoryIdentifier: data.type === 'new_message' ? 'new_message' : undefined,
        channelId: Platform.OS === 'android' && data.type === 'new_message' ? 'messages' : 'default',
        ...notificationContent,
      };
    } catch (error) {
      console.error('Error in notification handler:', error);
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        sound: 'note.wav',
        channelId: 'default',
      };
    }
  },
});

// Gérer les interactions avec les notifications
Notifications.addNotificationResponseReceivedListener(async (response) => {
  try {
    const { actionIdentifier, notification, userText } = response;
    const data = notification.request.content.data || {};
    // console.log('Notification response:', { actionIdentifier, userText, data });

    if (data.type === 'new_message') {
      if (actionIdentifier === 'REPLY' && userText) {
        // Envoyer la réponse via l'API
        try {
         
          console.log('Envoi de la réponse:', userText);
          await sendMessage(data, userText);
          
          console.log('Réponse envoyée:', userText);
          return;
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la réponse:', error);
        }
      } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER || actionIdentifier === 'OPEN') {
        // Naviguer vers la conversation
        router.push({
          pathname: '/(authenticated)/(drawer)/chat',
          params: {
            code: data.receiverCode || data.senderCode || '',
            conversationId: data.conversationId || '',
            username: data.senderName || 'Contact',
          },
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la réponse à la notification:', error);
  }
});

export class NotificationService {
  static async setupNotificationCategories(currentCode: any) {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = requestedStatus;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      const token = await Notifications.getDevicePushTokenAsync();
      console.log('Push token:', token.data);

      // Configurer les catégories et canaux
      await setupNotificationCategories(currentCode);

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  static async registerForPushNotificationsAsync(saveFcmToken: any) {
       let token;
     
       if (Device.isDevice) {
         const { status: existingStatus } = await Notifications.getPermissionsAsync();
         let finalStatus = existingStatus;
     
         if (existingStatus !== 'granted') {
           const { status } = await Notifications.requestPermissionsAsync();
           finalStatus = status;
         }
     
         if (finalStatus !== 'granted') {
           alert('Échec de l’obtention des permissions pour les notifications push !');
           return;
         }
     
         token = (await Notifications.getExpoPushTokenAsync()).data;
         console.log('Token Expo:', token);
         await saveFcmToken(token);
       } else {
         // alert('Doit être utilisé sur un appareil physique');
       }
     
       if (Platform.OS === 'android') {
         Notifications.setNotificationChannelAsync('default', {
           name: 'default',
           importance: Notifications.AndroidImportance.MAX,
           vibrationPattern: [0, 250, 250, 250],
           lightColor: '#FF231F7C',
         });
       }
     
       return token;
     }
}