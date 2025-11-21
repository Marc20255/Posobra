import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { authService } from '../lib/auth'
import api from '../lib/api'
// Icons replaced with emojis for React Native compatibility

export default function DashboardScreen() {
  const navigation = useNavigation()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await authService.getUser()
    setUser(currentUser)
  }

  const { data: servicesData, refetch, isRefetching } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get('/services')
      return response.data
    },
    enabled: !!user,
  })

  const services = servicesData?.data || []
  const stats = {
    total: services.length,
    pending: services.filter((s: any) => s.status === 'pending').length,
    inProgress: services.filter((s: any) => s.status === 'in_progress').length,
    completed: services.filter((s: any) => s.status === 'completed').length,
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user.name}!</Text>
        <Text style={styles.subtitle}>Bem-vindo ao seu painel</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔧</Text>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏰</Text>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Em Andamento</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviços Recentes</Text>
        {services.slice(0, 5).map((service: any) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard}
            onPress={() => navigation.navigate('ServiceDetail' as never, { id: service.id } as never)}
          >
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <View style={[styles.statusBadge, getStatusStyle(service.status)]}>
                <Text style={styles.statusText}>
                  {getStatusLabel(service.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.serviceCategory}>{service.category}</Text>
          </TouchableOpacity>
        ))}
        {services.length === 0 && (
          <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
        )}
      </View>
    </ScrollView>
  )
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    scheduled: 'Agendado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
}

function getStatusStyle(status: string) {
  const styles: Record<string, any> = {
    pending: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
    scheduled: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    in_progress: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    completed: { backgroundColor: '#d1fae5', borderColor: '#10b981' },
    cancelled: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  }
  return styles[status] || { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 24,
  },
})

