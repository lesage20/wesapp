import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import callService, { CallType, CallStatus, CallDirection } from '@/services/call.service';
import { router } from 'expo-router';

// Types de caméra
const CAMERA_TYPES = {
  front: 'front' as const,
  back: 'back' as const
};

type CameraTypeValue = typeof CAMERA_TYPES.front | typeof CAMERA_TYPES.back;

interface ChimeCallManagerProps {
  callId: string;
  contactId: string;
  contactName: string;
  callType: CallType;
  onCallEnded?: () => void;
}

const ChimeCallManager: React.FC<ChimeCallManagerProps> = ({
  callId,
  contactId,
  contactName,
  callType,
  onCallEnded
}) => {
  // États pour les permissions et les contrôles d'appel
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraTypeValue>(CAMERA_TYPES.front);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.CONNECTING);
  
  // Référence aux éléments de l'interface
  const videoRef = useRef<any>(null);
  
  // Vérifier si le code de contact est valide
  useEffect(() => {
    if (!contactId) {
      console.error('Contact ID is missing or invalid');
      Alert.alert(
        "Erreur d'appel",
        "Le code de contact est manquant ou invalide. L'appel ne peut pas être établi.",
        [{ text: "OK", onPress: handleEndCall }]
      );
    }
  }, [contactId]);
  
  // Timer pour la durée de l'appel
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);
  
  // Demander les permissions pour la caméra et le micro
  useEffect(() => {
    const getPermissions = async () => {
      try {
        // Dans une implémentation réelle, cela demanderait les permissions
        // pour la caméra et le micro
        setHasPermission(true);
      } catch (error) {
        console.error('Error getting permissions:', error);
        setHasPermission(false);
      }
    };
    
    getPermissions();
    
    // Initialiser l'appel
    initializeCall().then(() => {
      // Simuler un délai de connexion
      setTimeout(() => {
        setCallStatus(CallStatus.ACTIVE);
      }, 2000);
    }).catch(error => {
      console.error('Error initializing call:', error);
      handleEndCall();
    });
    
    // Nettoyage à la fermeture du composant
    return () => {
      handleEndCall();
    };
  }, []);
  
  // Formater la durée de l'appel
  const formatCallDuration = () => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Basculer entre la caméra avant et arrière
  const toggleCameraType = () => {
    setCameraType((current: CameraTypeValue) => 
      current === CAMERA_TYPES.front ? CAMERA_TYPES.back : CAMERA_TYPES.front
    );
  };
  
  // Activer/désactiver le micro
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  // Activer/désactiver la caméra
  const toggleCamera = () => {
    setIsCameraOff(prev => !prev);
  };
  
  // Initialiser l'appel avec AWS Chime SDK
  const initializeCall = async () => {
    try {
      if (!contactId) {
        throw new Error('Contact ID is missing or invalid');
      }
      
      // Dans une implémentation réelle, cela créerait une session Chime
      // et configurerait les flux audio/vidéo
      await callService.createCallSession(contactId, callType);
      console.log(`Initialized ${callType} call with ${contactName}`);
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert(
        "Erreur d'initialisation",
        "Impossible d'initialiser l'appel. Veuillez réessayer.",
        [{ text: "OK", onPress: handleEndCall }]
      );
    }
  };
  
  // Terminer l'appel
  const handleEndCall = () => {
    try {
      setCallStatus(CallStatus.ENDED);
      
      // Enregistrer l'appel dans l'historique
      callService.saveCallToHistory({
        callId,
        contactCodeId: contactId || 'unknown',
        contactName: contactName || 'Contact inconnu',
        callType,
        duration: callDuration,
        status: CallStatus.ENDED,
        direction: CallDirection.OUTGOING
      }).catch(error => {
        console.error('Error saving call to history:', error);
      });
      
      // Appeler le callback de fin d'appel
      if (onCallEnded) {
        onCallEnded();
      } else {
        // Navigation de secours si le callback n'est pas fourni
        try {
          router.navigate({
            pathname: "/(authenticated)/(drawer)/(tabs)/calls",
            params: { resetInput: "1" }
          });
        } catch (navError) {
          console.error('Navigation error:', navError);
          router.replace("/(authenticated)/(drawer)/(tabs)/calls");
        }
      }
    } catch (error) {
      console.error('Error ending call:', error);
      // Navigation de secours en cas d'erreur
      router.replace("/(authenticated)/(drawer)/(tabs)/calls");
    }
  };

  return (
    <View style={styles.container}>
      {/* Afficher la caméra si c'est un appel vidéo et que la caméra est activée */}
      {callType === CallType.VIDEO && !isCameraOff ? (
        hasPermission ? (
          // Utiliser une vue simple au lieu de Camera pour éviter les erreurs
          <View style={styles.camera}>
            <Text style={styles.statusText}>Caméra active</Text>
          </View>
        ) : (
          <View style={[styles.camera, styles.cameraOff]}>
            <Text style={styles.statusText}>Autorisation de caméra non accordée</Text>
          </View>
        )
      ) : (
        <View style={[styles.camera, styles.cameraOff]}>
          <Text style={styles.contactName}>{contactName}</Text>
        </View>
      )}
      
      {/* Statut de l'appel */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {callStatus === CallStatus.CONNECTING ? 'Connexion...' : 
           callStatus === CallStatus.ACTIVE ? formatCallDuration() : 
           'Appel terminé'}
        </Text>
      </View>
      
      {/* Contrôles d'appel */}
      <View style={styles.controlsContainer}>
        {callType === CallType.VIDEO && (
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleCamera}
          >
            <Ionicons 
              name={isCameraOff ? "videocam-off" : "videocam"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={toggleMute}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        
        {callType === CallType.VIDEO && (
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleCameraType}
          >
            <MaterialIcons 
              name="flip-camera-android" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.endCallButton]} 
          onPress={handleEndCall}
        >
          <MaterialIcons 
            name="call-end" 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOff: {
    backgroundColor: '#333',
  },
  statusContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
  },
  contactName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
});

export default ChimeCallManager;
