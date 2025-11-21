'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, MapPin, Route, Zap } from 'lucide-react'
import api from '@/lib/api'

// Fix para ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Service {
  id: number
  title: string
  address: string
  city: string
  state: string
  zip_code: string
  status: string
  category: string
  lat?: number
  lng?: number
}

interface ServicesMapProps {
  services: Service[]
  center?: [number, number]
  zoom?: number
  showRouteOptimization?: boolean
  userRole?: string
}

export function ServicesMap({ services, center, zoom = 13, showRouteOptimization = true, userRole }: ServicesMapProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<[number, number][]>([])
  const [groupedServices, setGroupedServices] = useState<Map<string, Service[]>>(new Map())
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [servicesWithCoords, setServicesWithCoords] = useState<Service[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Garantir que o componente só renderize no cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Geocodificar serviços sem coordenadas e atualizar lista
  useEffect(() => {
    if (!isMounted) return
    
    const geocodeServices = async () => {
      // Primeiro, usar serviços que já têm coordenadas válidas
      const servicesWithExistingCoords = services.filter(s => 
        s.lat != null && s.lng != null &&
        !isNaN(s.lat) && !isNaN(s.lng) &&
        typeof s.lat === 'number' && typeof s.lng === 'number' &&
        isFinite(s.lat) && isFinite(s.lng) &&
        s.lat >= -90 && s.lat <= 90 && s.lng >= -180 && s.lng <= 180
      )
      setServicesWithCoords(servicesWithExistingCoords)
      
      // Buscar serviços sem coordenadas
      const servicesWithoutCoords = services.filter(s => !s.lat || !s.lng)
      
      if (servicesWithoutCoords.length === 0) {
        return
      }

      setIsGeocoding(true)
      const geocodedServices: Service[] = []

      // Geocodificar serviços sem coordenadas (processar todos, mas com delay entre requisições)
      for (let i = 0; i < servicesWithoutCoords.length; i++) {
        const service = servicesWithoutCoords[i]
        
        // Adicionar delay entre requisições para não sobrecarregar a API
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // 1 segundo entre requisições
        }
        
        try {
          const address = `${service.address}, ${service.city}, ${service.state}, Brasil`
          const encodedAddress = encodeURIComponent(address)
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
            {
              headers: {
                'User-Agent': 'PosObraApp/1.0'
              }
            }
          )

          const data = await response.json()

          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat)
            const lng = parseFloat(data[0].lon)
            
            // Validar coordenadas antes de usar
            if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) &&
                lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              
              // Atualizar no backend usando a rota de geocoding
              try {
                await api.post('/geocoding/geocode-services', {
                  serviceIds: [service.id]
                })
              } catch (e) {
                console.error('Erro ao salvar coordenadas:', e)
                // Continuar mesmo se falhar ao salvar, usar coordenadas localmente
              }

              geocodedServices.push({
                ...service,
                lat,
                lng
              })
              
              // Atualizar estado incrementalmente para mostrar progresso
              setServicesWithCoords([...servicesWithExistingCoords, ...geocodedServices])
            } else {
              console.warn(`Coordenadas inválidas para serviço ${service.id}: lat=${lat}, lng=${lng}`)
            }
          } else {
            console.warn(`Nenhum resultado de geocoding para serviço ${service.id}: ${address}`)
          }
        } catch (error) {
          console.error(`Erro ao geocodificar serviço ${service.id}:`, error)
        }
      }

      // Atualizar estado final com todos os serviços geocodificados
      setServicesWithCoords([...servicesWithExistingCoords, ...geocodedServices])
      setIsGeocoding(false)
    }

    geocodeServices()
  }, [services, isMounted])

  // Agrupar serviços por região (CEP) - usar servicesWithCoords
  useEffect(() => {
    const grouped = new Map<string, Service[]>()
    
    servicesWithCoords.forEach(service => {
      if (service.lat && service.lng) {
        // Agrupar por CEP (primeiros 5 dígitos)
        const cepPrefix = service.zip_code?.replace(/\D/g, '').substring(0, 5) || 'unknown'
        if (!grouped.has(cepPrefix)) {
          grouped.set(cepPrefix, [])
        }
        grouped.get(cepPrefix)!.push(service)
      }
    })

    setGroupedServices(grouped)
  }, [servicesWithCoords])

  // Calcular rota otimizada quando há múltiplos serviços na mesma região
  useEffect(() => {
    if (showRouteOptimization && groupedServices.size > 0) {
      const multipleServicesRegions = Array.from(groupedServices.entries())
        .filter(([_, services]) => services.length > 1)
        .map(([_, services]) => services)

      if (multipleServicesRegions.length > 0) {
        // Pegar a primeira região com múltiplos serviços
        const regionServices = multipleServicesRegions[0]
        const route = regionServices
          .map(s => s.lat && s.lng ? [s.lat, s.lng] : null)
          .filter(Boolean) as [number, number][]
        
        // Ordenar por distância (algoritmo simples de nearest neighbor)
        if (route.length > 1) {
          const optimized = optimizeRoute(route)
          setOptimizedRoute(optimized)
        } else {
          setOptimizedRoute([])
        }
      } else {
        setOptimizedRoute([])
      }
    } else {
      setOptimizedRoute([])
    }
  }, [groupedServices, showRouteOptimization])

  // Algoritmo simples de otimização de rota (Nearest Neighbor)
  const optimizeRoute = (points: [number, number][]): [number, number][] => {
    if (points.length <= 1) return points

    const optimized: [number, number][] = []
    const remaining = [...points]
    
    // Começar do primeiro ponto
    let current = remaining.shift()!
    optimized.push(current)

    while (remaining.length > 0) {
      // Encontrar o ponto mais próximo
      let nearestIndex = 0
      let nearestDistance = calculateDistance(current, remaining[0]!)

      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(current, remaining[i]!)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }

      current = remaining.splice(nearestIndex, 1)[0]
      optimized.push(current)
    }

    return optimized
  }

  // Calcular distância entre dois pontos (Haversine)
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180
    const dLon = (point2[1] - point1[1]) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Abrir navegação no Waze
  const openWaze = (service: Service) => {
    if (service.lat && service.lng) {
      const url = `https://waze.com/ul?ll=${service.lat},${service.lng}&navigate=yes`
      window.open(url, '_blank')
    } else {
      // Fallback: usar endereço
      const address = encodeURIComponent(`${service.address}, ${service.city}, ${service.state}`)
      const url = `https://waze.com/ul?q=${address}&navigate=yes`
      window.open(url, '_blank')
    }
  }

  // Abrir navegação no Google Maps
  const openGoogleMaps = (service: Service) => {
    if (service.lat && service.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`
      window.open(url, '_blank')
    } else {
      // Fallback: usar endereço
      const address = encodeURIComponent(`${service.address}, ${service.city}, ${service.state}`)
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`
      window.open(url, '_blank')
    }
  }

  // Calcular centro do mapa baseado nos serviços ou usar padrão
  const calculateCenter = (): [number, number] => {
    // Validar center prop
    if (center && Array.isArray(center) && center.length === 2 && 
        typeof center[0] === 'number' && typeof center[1] === 'number' &&
        !isNaN(center[0]) && !isNaN(center[1]) &&
        isFinite(center[0]) && isFinite(center[1]) &&
        center[0] >= -90 && center[0] <= 90 && center[1] >= -180 && center[1] <= 180) {
      return center
    }
    
    // Calcular centro baseado nos serviços
    if (servicesWithCoords.length > 0) {
      const validCoords = servicesWithCoords.filter(s => 
        s.lat != null && s.lng != null && 
        !isNaN(s.lat) && !isNaN(s.lng) &&
        typeof s.lat === 'number' && typeof s.lng === 'number' &&
        isFinite(s.lat) && isFinite(s.lng) &&
        s.lat >= -90 && s.lat <= 90 && s.lng >= -180 && s.lng <= 180
      )
      
      if (validCoords.length > 0) {
        const avgLat = validCoords.reduce((sum, s) => sum + s.lat!, 0) / validCoords.length
        const avgLng = validCoords.reduce((sum, s) => sum + s.lng!, 0) / validCoords.length
        
        // Verificar se os valores são válidos
        if (!isNaN(avgLat) && !isNaN(avgLng) && 
            isFinite(avgLat) && isFinite(avgLng) &&
            avgLat >= -90 && avgLat <= 90 && avgLng >= -180 && avgLng <= 180) {
          return [avgLat, avgLng]
        }
      }
    }
    
    // Retornar coordenadas padrão válidas
    return [-8.7619, -63.9039] // Porto Velho, RO (centro do Brasil)
  }

  const defaultCenter: [number, number] = calculateCenter()
  
  // Validar defaultCenter antes de usar
  const isValidCenter = !isNaN(defaultCenter[0]) && !isNaN(defaultCenter[1]) &&
                        isFinite(defaultCenter[0]) && isFinite(defaultCenter[1]) &&
                        defaultCenter[0] >= -90 && defaultCenter[0] <= 90 &&
                        defaultCenter[1] >= -180 && defaultCenter[1] <= 180
  
  const mapZoom = servicesWithCoords.length > 0 && isValidCenter ? zoom : 4
  const safeCenter: [number, number] = isValidCenter ? defaultCenter : [-8.7619, -63.9039]

  // Verificar se há múltiplos serviços na mesma região
  const hasMultipleServicesInRegion = Array.from(groupedServices.values())
    .some(regionServices => regionServices.length > 1)

  // Não renderizar mapa no servidor
  if (typeof window === 'undefined' || !isMounted) {
    return <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Carregando mapa...</p>
    </div>
  }

  return (
    <div className="w-full">
      {/* Mensagem informativa sobre a função do mapa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Mapa de Serviços</h3>
            <p className="text-sm text-blue-800">
              {servicesWithCoords.length > 0 ? (
                <>
                  Visualize a localização de {servicesWithCoords.length} {servicesWithCoords.length === 1 ? 'serviço' : 'serviços'} no mapa. 
                  {userRole === 'technician' && ' Clique nos marcadores para abrir rotas no Waze ou Google Maps.'}
                </>
              ) : (
                <>
                  {isGeocoding ? (
                    'Geocodificando endereços dos serviços...'
                  ) : (
                    'Nenhum serviço com localização disponível. Os endereços serão geocodificados automaticamente quando os serviços forem criados.'
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Banner de otimização de rota */}
      {showRouteOptimization && hasMultipleServicesInRegion && userRole === 'technician' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-2">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rota Otimizada Disponível</h3>
                <p className="text-sm text-gray-600">
                  Detectamos múltiplos serviços na mesma região. A rota foi otimizada para economizar tempo e combustível.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {Array.from(groupedServices.values())
                  .filter(s => s.length > 1)
                  .reduce((sum, s) => sum + s.length, 0)} serviços próximos
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 relative">
        {isGeocoding && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Geocodificando endereços...</p>
            </div>
          </div>
        )}
        {isMounted && isValidCenter && (
          <MapContainer
            center={safeCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            key={`map-${servicesWithCoords.length}-${isMounted}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          
          {/* Linha de rota otimizada */}
          {optimizedRoute.length > 1 && (
            <Polyline
              positions={optimizedRoute}
              color="#3b82f6"
              weight={4}
              opacity={0.7}
            />
          )}

          {servicesWithCoords
            .filter(service => 
              service.lat != null && service.lng != null &&
              !isNaN(service.lat) && !isNaN(service.lng) &&
              typeof service.lat === 'number' && typeof service.lng === 'number' &&
              isFinite(service.lat) && isFinite(service.lng)
            )
            .map((service) => {
            const isInOptimizedRoute = optimizedRoute.some(
              ([lat, lng]) => lat === service.lat && lng === service.lng
            )
            
            return (
              <Marker
                key={service.id}
                position={[service.lat!, service.lng!]}
                icon={isInOptimizedRoute ? 
                  L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  }) : undefined
                }
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-semibold text-sm mb-2">{service.title}</h3>
                    <p className="text-xs text-gray-600 mb-1">{service.category}</p>
                    <p className="text-xs text-gray-500 mb-2">{service.address}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mb-3 ${
                      service.status === 'completed' ? 'bg-green-100 text-green-800' :
                      service.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status === 'completed' ? 'Concluído' :
                       service.status === 'in_progress' ? 'Em Andamento' :
                       service.status === 'pending' ? 'Pendente' : service.status}
                    </span>
                    
                    {/* Botões de navegação */}
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        onClick={() => openWaze(service)}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Abrir no Waze
                      </button>
                      <button
                        onClick={() => openGoogleMaps(service)}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Abrir no Google Maps
                      </button>
                    </div>

                    {/* Indicador de rota otimizada */}
                    {isInOptimizedRoute && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Zap className="w-3 h-3" />
                          <span>Incluído na rota otimizada</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
          </MapContainer>
        )}
      </div>

      {/* Lista de serviços agrupados por região */}
      {hasMultipleServicesInRegion && userRole === 'technician' && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-600" />
            Serviços Agrupados por Região
          </h4>
          <div className="space-y-3">
            {Array.from(groupedServices.entries())
              .filter(([_, regionServices]) => regionServices.length > 1)
              .map(([cepPrefix, regionServices]) => (
                <div key={cepPrefix} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        Região CEP {cepPrefix !== 'unknown' ? `${cepPrefix}***` : 'Não informado'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {regionServices.length} {regionServices.length === 1 ? 'serviço' : 'serviços'} na mesma região
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Abrir todos os serviços da região no Waze com múltiplos destinos
                        const coords = regionServices
                          .filter(s => s.lat && s.lng)
                          .map(s => `${s.lat},${s.lng}`)
                          .join('/')
                        if (coords) {
                          window.open(`https://waze.com/ul?ll=${coords}&navigate=yes`, '_blank')
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Rota Otimizada
                    </button>
                  </div>
                  <div className="space-y-1 mt-2">
                    {regionServices.map(service => (
                      <div key={service.id} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {service.title} - {service.address}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
