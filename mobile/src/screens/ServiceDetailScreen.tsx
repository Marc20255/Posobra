import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'

export default function ServiceDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Serviço</Text>
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

