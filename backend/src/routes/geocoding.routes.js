import express from 'express';
import pool from '../database/connection.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Geocode service addresses (batch)
router.post('/geocode-services', authenticate, async (req, res) => {
  try {
    const { serviceIds } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lista de IDs de serviços é obrigatória' 
      });
    }

    // Buscar serviços sem coordenadas
    const result = await pool.query(
      `SELECT id, address, city, state, zip_code 
       FROM services 
       WHERE id = ANY($1::int[]) 
         AND (lat IS NULL OR lng IS NULL)`,
      [serviceIds]
    );

    const geocodedServices = [];

    for (const service of result.rows) {
      try {
        // Usar API de geocodificação (exemplo com Nominatim - OpenStreetMap)
        const address = `${service.address}, ${service.city}, ${service.state}, Brasil`;
        const encodedAddress = encodeURIComponent(address);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
          {
            headers: {
              'User-Agent': 'PosObraApp/1.0'
            }
          }
        );

        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          // Validar coordenadas antes de salvar
          if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) &&
              lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            
            // Atualizar serviço com coordenadas
            await pool.query(
              'UPDATE services SET lat = $1, lng = $2 WHERE id = $3',
              [lat, lng, service.id]
            );

            geocodedServices.push({
              id: service.id,
              lat,
              lng,
              address: service.address
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao geocodificar serviço ${service.id}:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        geocoded: geocodedServices.length,
        total: result.rows.length,
        services: geocodedServices
      }
    });
  } catch (error) {
    console.error('Erro ao geocodificar serviços:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao geocodificar serviços',
      error: error.message 
    });
  }
});

// Get optimized route for multiple services
router.get('/optimize-route', authenticate, async (req, res) => {
  try {
    const { serviceIds, startLat, startLng } = req.query;

    if (!serviceIds) {
      return res.status(400).json({ 
        success: false, 
        message: 'IDs de serviços são obrigatórios' 
      });
    }

    const ids = Array.isArray(serviceIds) ? serviceIds : serviceIds.split(',').map(Number);

    // Buscar serviços com coordenadas
    const result = await pool.query(
      `SELECT id, title, address, city, state, zip_code, lat, lng, status
       FROM services 
       WHERE id = ANY($1::int[]) 
         AND lat IS NOT NULL 
         AND lng IS NOT NULL
         AND (deletion_status IS NULL OR deletion_status = 'none' OR deletion_status = 'pending_approval' OR deletion_status = 'rejected')`,
      [ids]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nenhum serviço com coordenadas encontrado' 
      });
    }

    // Agrupar por região (CEP)
    const groupedByRegion = new Map();
    result.rows.forEach(service => {
      const cepPrefix = service.zip_code?.replace(/\D/g, '').substring(0, 5) || 'unknown';
      if (!groupedByRegion.has(cepPrefix)) {
        groupedByRegion.set(cepPrefix, []);
      }
      groupedByRegion.get(cepPrefix).push(service);
    });

    // Calcular rota otimizada usando algoritmo Nearest Neighbor
    const optimizeRoute = (points, startPoint = null) => {
      if (points.length <= 1) return points;

      const optimized = [];
      const remaining = [...points];
      
      let current = startPoint || remaining.shift();
      optimized.push(current);

      while (remaining.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = calculateDistance(
          [current.lat, current.lng],
          [remaining[0].lat, remaining[0].lng]
        );

        for (let i = 1; i < remaining.length; i++) {
          const distance = calculateDistance(
            [current.lat, current.lng],
            [remaining[i].lat, remaining[i].lng]
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        }

        current = remaining.splice(nearestIndex, 1)[0];
        optimized.push(current);
      }

      return optimized;
    };

    const calculateDistance = (point1, point2) => {
      const R = 6371; // Raio da Terra em km
      const dLat = (point2[0] - point1[0]) * Math.PI / 180;
      const dLon = (point2[1] - point1[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Otimizar rotas por região
    const optimizedRoutes = [];
    let totalDistance = 0;

    for (const [cepPrefix, regionServices] of groupedByRegion.entries()) {
      if (regionServices.length > 1) {
        const startPoint = startLat && startLng ? 
          { lat: parseFloat(startLat), lng: parseFloat(startLng) } : 
          null;
        
        const optimized = optimizeRoute(regionServices, startPoint);
        
        // Calcular distância total da rota
        let routeDistance = 0;
        for (let i = 0; i < optimized.length - 1; i++) {
          routeDistance += calculateDistance(
            [optimized[i].lat, optimized[i].lng],
            [optimized[i + 1].lat, optimized[i + 1].lng]
          );
        }
        totalDistance += routeDistance;

        optimizedRoutes.push({
          region: cepPrefix !== 'unknown' ? `CEP ${cepPrefix}***` : 'Região não identificada',
          services: optimized.map(s => ({
            id: s.id,
            title: s.title,
            address: s.address,
            lat: s.lat,
            lng: s.lng,
            status: s.status
          })),
          distance: routeDistance.toFixed(2),
          serviceCount: optimized.length
        });
      } else {
        // Serviço único na região
        optimizedRoutes.push({
          region: cepPrefix !== 'unknown' ? `CEP ${cepPrefix}***` : 'Região não identificada',
          services: regionServices.map(s => ({
            id: s.id,
            title: s.title,
            address: s.address,
            lat: s.lat,
            lng: s.lng,
            status: s.status
          })),
          distance: '0.00',
          serviceCount: 1
        });
      }
    }

    res.json({
      success: true,
      data: {
        routes: optimizedRoutes,
        totalDistance: totalDistance.toFixed(2),
        totalServices: result.rows.length,
        regionsWithMultipleServices: optimizedRoutes.filter(r => r.serviceCount > 1).length
      }
    });
  } catch (error) {
    console.error('Erro ao otimizar rota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao otimizar rota',
      error: error.message 
    });
  }
});

export default router;
