import env from '#start/env'

export default {
  // Path to Firebase service account JSON
  serviceAccountPath: env.get('FIREBASE_SERVICE_ACCOUNT_PATH'),
  
  // Or service account JSON as string
  serviceAccount: env.get('FIREBASE_SERVICE_ACCOUNT'),
  
  // FCM configuration
  fcm: {
    // Default notification channel for Android
    defaultChannel: 'default',
    
    // Default sound
    defaultSound: 'default',
    
    // Notification priority
    priority: 'high' as const,
  },
  
  // Topics for admin notifications
  topics: {
    allAdmins: 'all-admins',
    securityAlerts: 'security-alerts',
    eventUpdates: 'event-updates',
    registrationUpdates: 'registration-updates',
  },
}