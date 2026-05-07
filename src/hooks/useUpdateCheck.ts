import { useState, useCallback } from 'react';
import Constants from 'expo-constants';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'update_available'
  | 'downloading'
  | 'installing'
  | 'up_to_date'
  | 'error';

export interface UpdateInfo {
  status: UpdateStatus;
  currentVersion: string;
  error?: string;
  // Si usas expo-updates, aquí vendrían detalles del update
  releaseNotes?: string;
}

// Lazy-load expo-updates usando require para evitar crash si no está instalado
function getExpoUpdates(): typeof import('expo-updates') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-updates');
  } catch {
    return null;
  }
}

export function useUpdateCheck() {
  const currentVersion = Constants.expoConfig?.version ?? '1.0.0';

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    status: 'idle',
    currentVersion,
  });

  const checkForUpdate = useCallback(async () => {
    setUpdateInfo((prev) => ({ ...prev, status: 'checking' }));

    try {
      const Updates = getExpoUpdates();

      // Si expo-updates no está disponible o estamos en dev, simular
      if (!Updates || __DEV__) {
        await new Promise((r) => setTimeout(r, 1200));
        setUpdateInfo({ status: 'up_to_date', currentVersion });
        return;
      }

      const result = await Updates.checkForUpdateAsync();

      if (result.isAvailable) {
        setUpdateInfo({
          status: 'update_available',
          currentVersion,
          releaseNotes: 'Nueva versión disponible con mejoras de rendimiento y nuevas funcionalidades.',
        });
      } else {
        setUpdateInfo({ status: 'up_to_date', currentVersion });
      }
    } catch (e) {
      setUpdateInfo({
        status: 'error',
        currentVersion,
        error: 'No se pudo verificar la actualización.',
      });
    }
  }, [currentVersion]);

  const downloadAndInstall = useCallback(async () => {
    setUpdateInfo((prev) => ({ ...prev, status: 'downloading' }));

    try {
      const Updates = getExpoUpdates();
      if (!Updates) return;

      await Updates.fetchUpdateAsync();
      setUpdateInfo((prev) => ({ ...prev, status: 'installing' }));

      // Breve pausa para mostrar el estado "instalando"
      await new Promise((r) => setTimeout(r, 800));
      await Updates.reloadAsync();
    } catch (e) {
      setUpdateInfo((prev) => ({
        ...prev,
        status: 'error',
        error: 'Error al descargar la actualización.',
      }));
    }
  }, []);

  const dismiss = useCallback(() => {
    setUpdateInfo((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  return { updateInfo, checkForUpdate, downloadAndInstall, dismiss };
}
