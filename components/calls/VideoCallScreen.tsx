// import React, { useState, useEffect } from 'react';
// import { View, Button, Text } from 'react-native';
// import { fetchAuthSession } from 'aws-amplify/auth';
// import { post } from 'aws-amplify/api';
// import { ConsoleLogger, DefaultMeetingSession, MeetingSessionConfiguration } from 'amazon-chime-sdk-js';

// const logger = new ConsoleLogger('Chime Logs');

// const CallScreen = () => {
//   const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const startCall = async () => {
//     try {
//       // Récupérer l’ID utilisateur authentifié
//       const session = await fetchAuthSession();
//       const userId = session.tokens?.idToken?.payload?.sub;

//       // Appeler l’API pour créer une réunion
//       const response = await post({
//         apiName: 'monApi',
//         path: '/create-meeting',
//         options: { body: {} }, // userId est récupéré côté backend via le token
//       }).response;
//       const { meeting, attendee } = await response.body.json();

//       // Configurer la session Chime
//       const configuration = new MeetingSessionConfiguration(meeting, attendee);
//       const session = new DefaultMeetingSession(configuration, logger, {
//         startAudioInput: async () => console.log('Audio démarré'),
//         stopAudioInput: async () => console.log('Audio arrêté'),
//       } as any); // Note : Audio natif nécessite une implémentation supplémentaire

//       setMeetingSession(session);

//       // Démarrer l’audio (nécessite un module natif pour React Native)
//       // Pour l’instant, simulation
//       console.log('Appel 1:1 démarré');
//     } catch (err) {
//       setError('Erreur : ' + err.message);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Démarrer un appel 1:1" onPress={startCall} />
//       {error && <Text>{error}</Text>}
//     </View>
//   );
// };

// export default CallScreen;