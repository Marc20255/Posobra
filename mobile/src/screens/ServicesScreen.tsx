import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function ServicesScreen() {
  const navigation = useNavigation()
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serviços</Text>
      <Text style={styles.subtitle}>Em desenvolvimento...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
})

