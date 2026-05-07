import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../theme';
import type { UpdateInfo } from '../../hooks/useUpdateCheck';

interface UpdateModalProps {
  updateInfo: UpdateInfo;
  onUpdate: () => void;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  update_available: {
    icon: 'cloud-download-outline' as const,
    color: colors.brand[400],
    title: 'Actualización disponible',
    subtitle: 'Hay una nueva versión de Gymetra lista para instalar.',
    showButton: true,
    buttonLabel: 'Actualizar ahora',
    showDismiss: true,
  },
  downloading: {
    icon: 'cloud-download-outline' as const,
    color: colors.accent.cyan,
    title: 'Descargando...',
    subtitle: 'La actualización se está descargando. Un momento.',
    showButton: false,
    buttonLabel: '',
    showDismiss: false,
  },
  installing: {
    icon: 'refresh-outline' as const,
    color: colors.accent.green,
    title: 'Instalando...',
    subtitle: 'Casi listo. La app se reiniciará en un momento.',
    showButton: false,
    buttonLabel: '',
    showDismiss: false,
  },
  error: {
    icon: 'alert-circle-outline' as const,
    color: colors.accent.red,
    title: 'Error',
    subtitle: 'No se pudo completar la actualización. Intenta más tarde.',
    showButton: false,
    buttonLabel: '',
    showDismiss: true,
  },
};

export function UpdateModal({ updateInfo, onUpdate, onDismiss }: UpdateModalProps) {
  const config = STATUS_CONFIG[updateInfo.status as keyof typeof STATUS_CONFIG];
  const isVisible = updateInfo.status in STATUS_CONFIG;

  if (!isVisible) return null;

  const isLoading = updateInfo.status === 'downloading' || updateInfo.status === 'installing';

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={config?.showDismiss ? onDismiss : undefined}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: spacing.lg,
          paddingBottom: spacing.xl * 2,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg.card,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: config ? `${config.color}30` : colors.border?.default ?? 'rgba(255,255,255,0.1)',
            padding: spacing.xl,
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Icono */}
          <View
            style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: config ? `${config.color}18` : 'transparent',
              borderWidth: 1.5,
              borderColor: config ? `${config.color}50` : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={config?.color} />
            ) : (
              <Ionicons name={config?.icon ?? 'information-circle-outline'} size={32} color={config?.color} />
            )}
          </View>

          {/* Versión */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: radius.sm,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: colors.text.muted, fontSize: fontSize.xs }}>
              v{updateInfo.currentVersion}
            </Text>
          </View>

          <Text style={{
            color: colors.text.primary,
            fontSize: fontSize.xl,
            fontWeight: '800',
            textAlign: 'center',
          }}>
            {config?.title}
          </Text>

          <Text style={{
            color: colors.text.secondary,
            fontSize: fontSize.sm,
            textAlign: 'center',
            lineHeight: 21,
          }}>
            {updateInfo.releaseNotes ?? config?.subtitle}
          </Text>

          {/* Botón de actualizar */}
          {config?.showButton && (
            <TouchableOpacity
              onPress={onUpdate}
              style={{
                backgroundColor: config.color,
                borderRadius: radius.xl,
                paddingVertical: 14,
                width: '100%',
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: fontSize.md,
                fontWeight: '700',
              }}>
                {config.buttonLabel}
              </Text>
            </TouchableOpacity>
          )}

          {/* Botón de cerrar */}
          {config?.showDismiss && (
            <TouchableOpacity onPress={onDismiss} style={{ padding: 8 }}>
              <Text style={{ color: colors.text.muted, fontSize: fontSize.sm }}>
                Recordarme después
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
