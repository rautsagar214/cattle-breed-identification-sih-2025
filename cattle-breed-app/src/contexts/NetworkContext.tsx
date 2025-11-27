/**
 * 📡 Network Context
 * 
 * Provides network connectivity status to all components
 * and handles automatic sync when connection is restored.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import {
  checkNetworkStatus,
  subscribeToNetworkChanges,
  NetworkStatus,
  getPendingUploadCount,
} from '../services/offline';

// ==========================================
// TypeScript Interfaces
// ==========================================

interface NetworkContextType {
  isOnline: boolean;
  networkStatus: NetworkStatus | null;
  pendingUploads: number;
  refreshPendingCount: () => Promise<void>;
}

// ==========================================
// Create Context
// ==========================================

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// ==========================================
// Network Provider Component
// ==========================================

export const NetworkProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [pendingUploads, setPendingUploads] = useState<number>(0);

  // Check initial network status
  useEffect(() => {
    const initNetwork = async () => {
      const status = await checkNetworkStatus();
      setNetworkStatus(status);
      setIsOnline(status.isConnected);
      
      // Check pending uploads
      const count = await getPendingUploadCount();
      setPendingUploads(count);
    };
    
    initNetwork();
  }, []);

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges(async (status) => {
      const wasOffline = !isOnline;
      const nowOnline = status.isConnected;
      
      setNetworkStatus(status);
      setIsOnline(nowOnline);
      
      // If connection restored and there are pending uploads
      if (wasOffline && nowOnline) {
        const count = await getPendingUploadCount();
        if (count > 0) {
          Alert.alert(
            'Back Online!',
            `You have ${count} pending upload(s). They will sync automatically.`,
            [{ text: 'OK' }]
          );
        }
      }
      
      // If connection lost
      if (!wasOffline && !nowOnline) {
        Alert.alert(
          'No Internet',
          'You are now offline. The app will continue to work and sync data when connection is restored.',
          [{ text: 'OK' }]
        );
      }
    });
    
    return () => unsubscribe();
  }, [isOnline]);

  // Refresh pending upload count
  const refreshPendingCount = async () => {
    const count = await getPendingUploadCount();
    setPendingUploads(count);
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        networkStatus,
        pendingUploads,
        refreshPendingCount,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

// ==========================================
// Custom Hook
// ==========================================

/**
 * Hook to access network status in components
 * 
 * @returns Network context
 * 
 * Example:
 * ```typescript
 * const { isOnline, pendingUploads } = useNetwork();
 * if (isOnline) {
 *   // Upload to server
 * } else {
 *   // Save locally
 * }
 * ```
 */
export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
