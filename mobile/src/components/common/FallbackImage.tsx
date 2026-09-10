import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FallbackImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  containerStyle?: any;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  uri,
  fallbackIcon = 'image-outline',
  fallbackIconSize = 24,
  fallbackIconColor = '#9ca3af',
  containerStyle,
  style,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!uri || hasError) {
    return (
      <View style={[styles.fallbackContainer, containerStyle, style]}>
        <Ionicons name={fallbackIcon} size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, style]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        {...rest}
      />
      {isLoading && (
        <View style={[styles.fallbackContainer, StyleSheet.absoluteFill]}>
           <ActivityIndicator size="small" color={fallbackIconColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb', // gray-200
  },
});

export default FallbackImage;
