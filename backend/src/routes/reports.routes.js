import express from 'express';
import pool from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import jsPDFModule from 'jspdf';
import autoTable from 'jspdf-autotable';

// jsPDF versão 3.x: usar jsPDF do módulo (named export) ou default
const jsPDF = jsPDFModule.jsPDF || jsPDFModule;

const router = express.Router();

// Generate service report
router.get('/services', authenticate, async (req, res) => {
  try {
    console.log('📊 Iniciando geração de relatório...');
    const { startDate, endDate, status, format = 'pdf' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log('👤 Usuário:', userId, 'Role:', userRole, 'Format:', format);

    // Build query based on user role
    let query = '';
    let queryParams = [];
    let paramCount = 1;

    if (userRole === 'client') {
      query = 'SELECT * FROM services WHERE client_id = $1';
      queryParams.push(userId);
      paramCount++;
    } else if (userRole === 'technician') {
      query = 'SELECT * FROM services WHERE technician_id = $1';
      queryParams.push(userId);
      paramCount++;
    } else if (userRole === 'constructor') {
      query = `
        SELECT s.* 
        FROM services s
        LEFT JOIN units u ON u.id = s.unit_id
        LEFT JOIN developments d ON d.id = u.development_id
        WHERE d.constructor_id = $1
      `;
      queryParams.push(userId);
      paramCount++;
    } else {
      query = 'SELECT * FROM services WHERE 1=1';
    }

    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    console.log('🔍 Executando query:', query.substring(0, 100));
    const result = await pool.query(query, queryParams);
    const services = result.rows;
    console.log('✅ Serviços encontrados:', services.length);

    // Get user info
    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
    const userName = userResult.rows[0]?.name || 'Usuário';
    console.log('👤 Nome do usuário:', userName);

    if (format === 'pdf') {
      console.log('📄 Gerando PDF...');
      try {
        // Debug: verificar se jsPDF está disponível
        if (!jsPDF || typeof jsPDF !== 'function') {
          console.error('jsPDF não está disponível como construtor:', typeof jsPDF);
          return res.status(500).json({ 
            success: false, 
            message: 'Erro ao inicializar gerador de PDF',
            error: 'jsPDF não está disponível'
          });
        }
        
        // Generate PDF
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('Relatório de Serviços', 14, 20);
        
        doc.setFontSize(12);
        doc.text(`Gerado por: ${userName}`, 14, 30);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);
        
        if (startDate || endDate) {
          doc.text(
            `Período: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} - ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Fim'}`,
            14,
            42
          );
        }

        let startY = 50;

        if (services.length > 0) {
          // Prepare table data
          const tableData = services.map(service => [
            service.id.toString(),
            (service.title || '').substring(0, 30),
            service.category || '-',
            service.status === 'completed' ? 'Concluído' :
            service.status === 'in_progress' ? 'Em Andamento' :
            service.status === 'pending' ? 'Pendente' :
            service.status === 'scheduled' ? 'Agendado' : (service.status || '-'),
            service.priority === 'urgent' ? 'Urgente' :
            service.priority === 'high' ? 'Alta' :
            service.priority === 'medium' ? 'Média' : 'Baixa',
            service.created_at ? new Date(service.created_at).toLocaleDateString('pt-BR') : '-',
            service.completed_date ? new Date(service.completed_date).toLocaleDateString('pt-BR') : '-'
          ]);

          // Add table
          autoTable(doc, {
            head: [['ID', 'Título', 'Categoria', 'Status', 'Prioridade', 'Criado em', 'Concluído em']],
            body: tableData,
            startY: startY,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [14, 165, 233] }
          });

          startY = doc.lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(12);
          doc.text('Nenhum serviço encontrado para o período selecionado.', 14, startY);
          startY += 10;
        }

        // Statistics
        doc.setFontSize(14);
        doc.text('Estatísticas', 14, startY);
        
        doc.setFontSize(10);
        const total = services.length;
        const completed = services.filter(s => s.status === 'completed').length;
        const pending = services.filter(s => s.status === 'pending').length;
        const inProgress = services.filter(s => s.status === 'in_progress').length;
        
        doc.text(`Total de Serviços: ${total}`, 14, startY + 8);
        doc.text(`Concluídos: ${completed}`, 14, startY + 14);
        doc.text(`Pendentes: ${pending}`, 14, startY + 20);
        doc.text(`Em Andamento: ${inProgress}`, 14, startY + 26);

        // Generate PDF buffer
        const pdfOutput = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfOutput);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-servicos-${Date.now()}.pdf`);
        res.send(pdfBuffer);
      } catch (pdfError) {
        console.error('❌ Erro ao gerar PDF:', pdfError);
        console.error('Stack:', pdfError.stack);
        console.error('jsPDF type:', typeof jsPDF);
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar PDF',
          error: process.env.NODE_ENV === 'development' ? pdfError.message : 'Erro interno ao gerar relatório'
        });
        return;
      }
    } else {
      // JSON format
      res.json({
        success: true,
        data: {
          user: userName,
          generated_at: new Date().toISOString(),
          period: {
            start: startDate || null,
            end: endDate || null
          },
          statistics: {
            total: services.length,
            completed: services.filter(s => s.status === 'completed').length,
            pending: services.filter(s => s.status === 'pending').length,
            in_progress: services.filter(s => s.status === 'in_progress').length
          },
          services
        }
      });
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao gerar relatório',
      error: error.message 
    });
  }
});

// Generate client history report
router.get('/client/:clientId', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { format = 'pdf' } = req.query;

    // Verificar autorização
    if (req.user.role !== 'admin' && req.user.role !== 'constructor' && req.user.id !== parseInt(clientId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    // Buscar histórico do cliente
    const clientResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    const client = clientResult.rows[0];

    // Buscar serviços
    let servicesQuery = 'SELECT * FROM services WHERE client_id = $1 ORDER BY created_at DESC';
    let servicesParams = [clientId];

    if (req.user.role === 'constructor') {
      servicesQuery = `
        SELECT s.* 
        FROM services s
        LEFT JOIN units u ON u.id = s.unit_id
        LEFT JOIN developments d ON d.id = u.development_id
        WHERE s.client_id = $1 AND d.constructor_id = $2
        ORDER BY s.created_at DESC
      `;
      servicesParams = [clientId, req.user.id];
    }

    const servicesResult = await pool.query(servicesQuery, servicesParams);
    const services = servicesResult.rows;

    // Buscar estatísticas
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_services,
        AVG(CASE WHEN status = 'completed' AND maintenance_cost IS NOT NULL THEN maintenance_cost END) as avg_cost,
        AVG(r.rating) as avg_rating
       FROM services s
       LEFT JOIN reviews r ON r.service_id = s.id AND r.client_id = s.client_id
       WHERE s.client_id = $1`,
      [clientId]
    );
    const stats = statsResult.rows[0];

    if (format === 'pdf') {
      try {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('Histórico do Cliente', 14, 20);
        
        doc.setFontSize(12);
        doc.text(`Cliente: ${client.name}`, 14, 30);
        doc.text(`Email: ${client.email}`, 14, 36);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 42);

        // Statistics
        doc.setFontSize(14);
        doc.text('Estatísticas', 14, 52);
        doc.setFontSize(10);
        doc.text(`Total de Serviços: ${stats.total_services || 0}`, 14, 60);
        doc.text(`Serviços Concluídos: ${stats.completed_services || 0}`, 14, 66);
        doc.text(`Custo Médio: R$ ${parseFloat(stats.avg_cost || 0).toFixed(2)}`, 14, 72);
        doc.text(`Avaliação Média: ${parseFloat(stats.avg_rating || 0).toFixed(1)} estrelas`, 14, 78);

        // Services table
        const tableData = services.length > 0 ? services.map(service => [
          service.id.toString(),
          (service.title || '').substring(0, 25),
          service.category || '-',
          service.status === 'completed' ? 'Concluído' : (service.status || '-'),
          service.created_at ? new Date(service.created_at).toLocaleDateString('pt-BR') : '-'
        ]) : [];

        if (tableData.length > 0) {
          autoTable(doc, {
            head: [['ID', 'Título', 'Categoria', 'Status', 'Data']],
            body: tableData,
            startY: 85,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [14, 165, 233] }
          });
        } else {
          doc.setFontSize(12);
          doc.text('Nenhum serviço encontrado.', 14, 85);
        }

        const pdfOutput = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfOutput);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=historico-cliente-${clientId}-${Date.now()}.pdf`);
        res.send(pdfBuffer);
      } catch (pdfError) {
        console.error('Erro ao gerar PDF:', pdfError);
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar PDF',
          error: pdfError.message 
        });
        return;
      }
    } else {
      res.json({
        success: true,
        data: {
          client,
          statistics: {
            total_services: parseInt(stats.total_services || 0),
            completed_services: parseInt(stats.completed_services || 0),
            avg_cost: parseFloat(stats.avg_cost || 0),
            avg_rating: parseFloat(stats.avg_rating || 0)
          },
          services
        }
      });
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao gerar relatório',
      error: error.message 
    });
  }
});

export default router;

