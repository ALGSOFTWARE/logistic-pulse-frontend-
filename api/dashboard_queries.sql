-- =====================================================
-- QUERIES PARA DASHBOARD - SISTEMA MITTRACKING
-- =====================================================
-- Este arquivo contém todas as queries necessárias para
-- popular o dashboard com dados dinâmicos do banco
-- =====================================================

-- =====================================================
-- 1. KPIs PRINCIPAIS
-- =====================================================

-- Tempo Médio de Entrega (em dias)
SELECT 
  ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) as tempo_medio_entrega,
  ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)) - 
    (SELECT AVG(DATEDIFF(e2.data_entrega_real, e2.data_criacao)) 
     FROM entregas e2 
     WHERE e2.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
     AND e2.data_entrega_real < DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 1) as variacao_tempo
FROM entregas e
WHERE e.status = 'entregue' 
  AND e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- SLA Atendido (%)
SELECT 
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(*)), 1
  ) as sla_atendido,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(*)) - 
    (SELECT COUNT(CASE WHEN e2.data_entrega_real <= e2.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(*)
     FROM entregas e2 
     WHERE e2.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
     AND e2.data_entrega_real < DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 1
  ) as variacao_sla
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- NPS Médio
SELECT 
  ROUND(AVG(c.nps), 1) as nps_medio,
  ROUND(AVG(c.nps) - 
    (SELECT AVG(c2.nps) 
     FROM clientes c2 
     JOIN entregas e2 ON c2.id = e2.cliente_id
     WHERE e2.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
     AND e2.data_entrega_real < DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 1) as variacao_nps
FROM clientes c
JOIN entregas e ON c.id = e.cliente_id
WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Total de Incidentes
SELECT 
  COUNT(*) as total_incidentes,
  COUNT(*) - 
  (SELECT COUNT(*) 
   FROM ocorrencias o2 
   WHERE o2.data_ocorrencia >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
   AND o2.data_ocorrencia < DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as variacao_incidentes
FROM ocorrencias o
WHERE o.data_ocorrencia >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND o.status IN ('aberta', 'em_andamento');

-- =====================================================
-- 2. DISTRIBUIÇÃO DE STATUS DAS CARGAS
-- =====================================================

SELECT 
  CASE 
    WHEN j.status = 'em_transito' THEN 'Em Trânsito'
    WHEN j.status = 'entregue' THEN 'Entregue'
    WHEN j.status = 'aguardando' THEN 'Aguardando Doc'
    WHEN j.status = 'cancelada' THEN 'Cancelada'
    WHEN j.status = 'atrasada' THEN 'Atrasada'
  END as status,
  COUNT(*) as quantidade,
  CASE 
    WHEN j.status = 'em_transito' THEN 'hsl(var(--chart-1))'
    WHEN j.status = 'entregue' THEN 'hsl(var(--chart-2))'
    WHEN j.status = 'aguardando' THEN 'hsl(var(--chart-3))'
    WHEN j.status = 'cancelada' THEN 'hsl(var(--chart-4))'
    WHEN j.status = 'atrasada' THEN 'hsl(var(--chart-5))'
  END as cor
FROM jornadas j
WHERE j.data_criacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY j.status
ORDER BY quantidade DESC;

-- =====================================================
-- 3. PERFORMANCE POR CLIENTE
-- =====================================================

SELECT 
  c.empresa as nome_cliente,
  COUNT(e.id) as total_entregas,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(*)), 1
  ) as sla_percentual,
  c.score as score_cliente
FROM clientes c
LEFT JOIN entregas e ON c.id = e.cliente_id
WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  OR e.data_entrega_real IS NULL
GROUP BY c.id, c.empresa, c.score
HAVING total_entregas > 0
ORDER BY total_entregas DESC
LIMIT 10;

-- =====================================================
-- 4. ALERTAS OPERACIONAIS
-- =====================================================

-- Alertas de Atraso
SELECT 
  'Atraso' as tipo,
  CONCAT('Entrega ', e.codigo, ' com atraso de ', 
    TIMESTAMPDIFF(HOUR, e.data_entrega_estimada, NOW()), 'h') as descricao,
  'alta' as criticidade,
  e.id as referencia_id,
  'entrega' as tipo_referencia
FROM entregas e
WHERE e.status = 'atrasada' 
  AND e.data_entrega_estimada < NOW()
  AND e.data_entrega_real IS NULL;

-- Alertas de Tempo Parado
SELECT 
  'Tempo Parado' as tipo,
  CONCAT('Veículo ', v.placa, ' parado há ', 
    TIMESTAMPDIFF(HOUR, j.data_atualizacao, NOW()), 'h') as descricao,
  CASE 
    WHEN TIMESTAMPDIFF(HOUR, j.data_atualizacao, NOW()) > 6 THEN 'alta'
    WHEN TIMESTAMPDIFF(HOUR, j.data_atualizacao, NOW()) > 3 THEN 'media'
    ELSE 'baixa'
  END as criticidade,
  j.id as referencia_id,
  'jornada' as tipo_referencia
FROM jornadas j
JOIN veiculos v ON j.veiculo_id = v.id
WHERE j.status = 'em_transito'
  AND j.data_atualizacao < DATE_SUB(NOW(), INTERVAL 2 HOUR);

-- Alertas de Ocorrências Críticas
SELECT 
  o.tipo,
  o.descricao,
  o.criticidade,
  o.id as referencia_id,
  'ocorrencia' as tipo_referencia
FROM ocorrencias o
WHERE o.status IN ('aberta', 'em_andamento')
  AND o.criticidade IN ('alta', 'critica')
ORDER BY o.data_ocorrencia DESC
LIMIT 5;

-- =====================================================
-- 5. DOCUMENTOS RECEBIDOS VIA CHAT
-- =====================================================

SELECT 
  d.tipo,
  COUNT(*) as total_documentos,
  COUNT(CASE WHEN DATE(d.data_upload) = CURDATE() THEN 1 END) as documentos_hoje,
  COUNT(CASE WHEN d.origem_upload = 'chat' THEN 1 END) as via_chat
FROM documentos d
WHERE d.data_upload >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY d.tipo
ORDER BY total_documentos DESC;

-- =====================================================
-- 6. ÚLTIMOS EMBARQUES/JORNADAS
-- =====================================================

SELECT 
  j.codigo as id_jornada,
  c.empresa as cliente,
  j.destino,
  CASE 
    WHEN j.status = 'em_transito' THEN 'Em Trânsito'
    WHEN j.status = 'entregue' THEN 'Entregue'
    WHEN j.status = 'aguardando' THEN 'Aguardando Doc'
    WHEN j.status = 'cancelada' THEN 'Cancelada'
    WHEN j.status = 'atrasada' THEN 'Atrasada'
  END as status,
  DATE(j.data_criacao) as data_criacao,
  j.progresso,
  t.nome as transportadora
FROM jornadas j
JOIN clientes c ON j.cliente_id = c.id
LEFT JOIN transportadoras t ON j.transportadora_id = t.id
ORDER BY j.data_criacao DESC
LIMIT 10;

-- =====================================================
-- 7. MÉTRICAS DE CRESCIMENTO (ÚLTIMOS 12 MESES)
-- =====================================================

SELECT 
  DATE_FORMAT(e.data_entrega_real, '%Y-%m') as mes,
  COUNT(*) as total_entregas,
  COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo,
  ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) as tempo_medio,
  ROUND(SUM(e.valor), 2) as valor_total
FROM entregas e
WHERE e.status = 'entregue'
  AND e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(e.data_entrega_real, '%Y-%m')
ORDER BY mes;

-- =====================================================
-- 8. TOP 5 TRANSPORTADORAS
-- =====================================================

SELECT 
  t.nome as transportadora,
  COUNT(j.id) as total_jornadas,
  ROUND(AVG(j.progresso), 1) as progresso_medio,
  COUNT(CASE WHEN j.status = 'entregue' THEN 1 END) as entregas_concluidas,
  ROUND(
    (COUNT(CASE WHEN j.status = 'entregue' THEN 1 END) * 100.0 / COUNT(*)), 1
  ) as taxa_sucesso
FROM transportadoras t
JOIN jornadas j ON t.id = j.transportadora_id
WHERE j.data_criacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY t.id, t.nome
ORDER BY taxa_sucesso DESC, total_jornadas DESC
LIMIT 5;

-- =====================================================
-- 9. MAPA DE CALOR - ATIVIDADE POR HORA
-- =====================================================

SELECT 
  HOUR(e.data_entrega_real) as hora,
  COUNT(*) as entregas,
  COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo
FROM entregas e
WHERE e.status = 'entregue'
  AND e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY HOUR(e.data_entrega_real)
ORDER BY hora;

-- =====================================================
-- 10. RESUMO FINANCEIRO
-- =====================================================

SELECT 
  ROUND(SUM(e.valor), 2) as receita_total,
  ROUND(AVG(e.valor), 2) as ticket_medio,
  COUNT(*) as total_entregas,
  ROUND(SUM(e.valor) / COUNT(*), 2) as receita_por_entrega
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND e.status = 'entregue';

-- =====================================================
-- 11. VIEW CONSOLIDADA PARA DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW vw_dashboard_completo AS
SELECT 
  -- KPIs Principais
  (SELECT ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) 
   FROM entregas e 
   WHERE e.status = 'entregue' 
   AND e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as tempo_medio_entrega,
  
  (SELECT ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(*)), 1
   )
   FROM entregas e
   WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as sla_atendido,
  
  (SELECT ROUND(AVG(c.nps), 1)
   FROM clientes c
   JOIN entregas e ON c.id = e.cliente_id
   WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as nps_medio,
  
  (SELECT COUNT(*)
   FROM ocorrencias o
   WHERE o.data_ocorrencia >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
   AND o.status IN ('aberta', 'em_andamento')) as total_incidentes,
  
  -- Contadores Gerais
  (SELECT COUNT(*) FROM jornadas WHERE data_criacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as total_jornadas,
  (SELECT COUNT(*) FROM entregas WHERE data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as total_entregas,
  (SELECT COUNT(*) FROM clientes WHERE status = 'ativo') as total_clientes,
  (SELECT COUNT(*) FROM transportadoras WHERE status = 'ativo') as total_transportadoras;

-- =====================================================
-- 12. PROCEDURE PARA ATUALIZAR MÉTRICAS EM TEMPO REAL
-- =====================================================

DELIMITER //

CREATE PROCEDURE sp_atualizar_metricas_dashboard()
BEGIN
  -- Atualizar score dos clientes
  UPDATE clientes c
  SET score = (
    SELECT 
      (COALESCE(entregas_score, 0) * 0.4 + 
       COALESCE(engajamento_score, 0) * 0.3 + 
       COALESCE(nps_score, 0) * 0.3)
    FROM (
      SELECT 
        CASE 
          WHEN COUNT(e.id) >= 50 THEN 100
          WHEN COUNT(e.id) >= 30 THEN 80
          WHEN COUNT(e.id) >= 15 THEN 60
          ELSE 40
        END as entregas_score,
        CASE 
          WHEN COUNT(cm.id) >= 100 THEN 100
          WHEN COUNT(cm.id) >= 50 THEN 80
          WHEN COUNT(cm.id) >= 20 THEN 60
          ELSE 40
        END as engajamento_score,
        COALESCE(c.nps, 0) * 10 as nps_score
      FROM clientes c
      LEFT JOIN entregas e ON c.id = e.cliente_id
      LEFT JOIN chat_mensagens cm ON c.id = cm.cliente_id
      WHERE c.id = c.id
      GROUP BY c.id, c.nps
    ) scores
  );
  
  -- Atualizar progresso das jornadas
  UPDATE jornadas j
  SET progresso = (
    SELECT ROUND((COUNT(CASE WHEN c.status = 'concluido' THEN 1 END) * 100.0 / COUNT(*)), 2)
    FROM checkpoints c
    WHERE c.jornada_id = j.id
  );
  
  -- Log da atualização
  INSERT INTO logs_sistema (nivel, categoria, mensagem, dados)
  VALUES ('info', 'dashboard', 'Métricas do dashboard atualizadas', 
    JSON_OBJECT('timestamp', NOW(), 'procedure', 'sp_atualizar_metricas_dashboard'));
END //

DELIMITER ;

-- =====================================================
-- 13. EVENT SCHEDULER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Habilitar event scheduler
SET GLOBAL event_scheduler = ON;

-- Criar evento para atualizar métricas a cada 5 minutos
CREATE EVENT ev_atualizar_dashboard
ON SCHEDULE EVERY 5 MINUTE
DO
  CALL sp_atualizar_metricas_dashboard();

-- =====================================================
-- 14. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices para queries do dashboard
CREATE INDEX idx_entregas_data_status ON entregas(data_entrega_real, status);
CREATE INDEX idx_jornadas_data_status ON jornadas(data_criacao, status);
CREATE INDEX idx_ocorrencias_data_status ON ocorrencias(data_ocorrencia, status);
CREATE INDEX idx_documentos_upload_tipo ON documentos(data_upload, tipo);
CREATE INDEX idx_chat_mensagens_data ON chat_mensagens(data_envio);

-- =====================================================
-- QUERIES PARA PÁGINA DE CLIENTES
-- =====================================================

-- 1. Lista completa de clientes com métricas
SELECT 
  c.id,
  u.nome,
  c.empresa,
  u.email,
  c.telefone,
  CONCAT(c.cidade, ', ', c.estado) as endereco,
  c.score,
  c.status,
  c.total_embarques,
  c.engajamento_chat,
  c.nps,
  CASE 
    WHEN c.ultima_atividade IS NULL THEN 'Nunca'
    WHEN c.ultima_atividade >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 'Agora'
    WHEN c.ultima_atividade >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN CONCAT(TIMESTAMPDIFF(HOUR, c.ultima_atividade, NOW()), 'h atrás')
    WHEN c.ultima_atividade >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN CONCAT(TIMESTAMPDIFF(DAY, c.ultima_atividade, NOW()), ' dias atrás')
    ELSE 'Há muito tempo'
  END as ultima_atividade_texto,
  c.data_criacao,
  c.data_atualizacao
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.status = 'ativo'
ORDER BY c.score DESC, c.total_embarques DESC;

-- 2. Métricas gerais de clientes
SELECT 
  COUNT(*) as total_clientes,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) as clientes_ativos,
  COUNT(CASE WHEN status = 'inativo' THEN 1 END) as clientes_inativos,
  COUNT(CASE WHEN status = 'pendente' THEN 1 END) as clientes_pendentes,
  ROUND(AVG(score), 1) as score_medio,
  ROUND(AVG(nps), 1) as nps_medio,
  SUM(total_embarques) as total_embarques_geral,
  ROUND(AVG(engajamento_chat), 1) as engajamento_medio
FROM clientes;

-- 3. Clientes com maior score
SELECT 
  c.id,
  u.nome,
  c.empresa,
  c.score,
  c.total_embarques,
  c.nps,
  c.engajamento_chat
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.status = 'ativo'
ORDER BY c.score DESC
LIMIT 10;

-- 4. Clientes com maior engajamento no chat
SELECT 
  c.id,
  u.nome,
  c.empresa,
  c.engajamento_chat,
  COUNT(cm.id) as total_mensagens,
  MAX(cm.data_envio) as ultima_mensagem
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN chat_mensagens cm ON c.id = cm.cliente_id
WHERE c.status = 'ativo'
GROUP BY c.id, u.nome, c.empresa, c.engajamento_chat
ORDER BY c.engajamento_chat DESC
LIMIT 10;

-- 5. NPS por cliente
SELECT 
  c.id,
  u.nome,
  c.empresa,
  c.nps,
  CASE 
    WHEN c.nps >= 9 THEN 'Promotor'
    WHEN c.nps >= 7 THEN 'Neutro'
    ELSE 'Detrator'
  END as categoria_nps
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.status = 'ativo' AND c.nps > 0
ORDER BY c.nps DESC;

-- 6. Alertas e incidentes por cliente
SELECT 
  c.id,
  u.nome,
  c.empresa,
  COUNT(o.id) as total_ocorrencias,
  COUNT(CASE WHEN o.status IN ('aberta', 'em_andamento') THEN 1 END) as ocorrencias_ativas,
  COUNT(CASE WHEN o.criticidade = 'alta' THEN 1 END) as ocorrencias_alta,
  MAX(o.data_ocorrencia) as ultima_ocorrencia
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN entregas e ON c.id = e.cliente_id
LEFT JOIN ocorrencias o ON e.id = o.entrega_id
WHERE c.status = 'ativo'
GROUP BY c.id, u.nome, c.empresa
HAVING total_ocorrencias > 0
ORDER BY ocorrencias_ativas DESC, total_ocorrencias DESC;

-- 7. Performance de entregas por cliente
SELECT 
  c.id,
  u.nome,
  c.empresa,
  COUNT(e.id) as total_entregas,
  COUNT(CASE WHEN e.status = 'entregue' THEN 1 END) as entregas_concluidas,
  COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as sla_percentual,
  ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) as tempo_medio_entrega
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN entregas e ON c.id = e.cliente_id
WHERE c.status = 'ativo'
  AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.id, u.nome, c.empresa
HAVING total_entregas > 0
ORDER BY sla_percentual DESC;

-- 8. Busca de clientes (para filtro)
SELECT 
  c.id,
  u.nome,
  c.empresa,
  u.email,
  c.telefone,
  c.status,
  c.score
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
WHERE (
  u.nome LIKE CONCAT('%', ?, '%') OR
  c.empresa LIKE CONCAT('%', ?, '%') OR
  u.email LIKE CONCAT('%', ?, '%')
)
ORDER BY c.score DESC;

-- =====================================================
-- QUERIES PARA PÁGINA DE RELATÓRIOS
-- =====================================================

-- 1. KPIs principais para relatórios
SELECT 
  COUNT(e.id) as total_entregas,
  COUNT(CASE WHEN e.status = 'entregue' THEN 1 END) as entregas_concluidas,
  COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as taxa_sucesso,
  ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) as tempo_medio_entrega,
  COUNT(DISTINCT j.id) as total_jornadas,
  COUNT(DISTINCT c.id) as total_clientes,
  COUNT(DISTINCT t.id) as total_transportadoras
FROM entregas e
LEFT JOIN jornadas j ON e.jornada_id = j.id
LEFT JOIN clientes c ON e.cliente_id = c.id
LEFT JOIN transportadoras t ON j.transportadora_id = t.id
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 2. Entregas por mês (últimos 12 meses)
SELECT 
  DATE_FORMAT(e.data_entrega_real, '%Y-%m') as mes,
  MONTHNAME(e.data_entrega_real) as nome_mes,
  COUNT(e.id) as total_entregas,
  COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo,
  COUNT(CASE WHEN e.data_entrega_real > e.data_entrega_estimada THEN 1 END) as entregas_atrasadas,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as sla_percentual,
  ROUND(SUM(e.valor), 2) as receita_total
FROM entregas e
WHERE e.status = 'entregue'
  AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(e.data_entrega_real, '%Y-%m'), MONTHNAME(e.data_entrega_real)
ORDER BY mes;

-- 3. Status das entregas (distribuição atual)
SELECT 
  CASE 
    WHEN e.status = 'entregue' THEN 'Entregues'
    WHEN e.status = 'em_transito' THEN 'Em Trânsito'
    WHEN e.status = 'atrasada' THEN 'Atrasadas'
    WHEN e.status = 'aguardando' THEN 'Pendentes'
    ELSE 'Outros'
  END as status_nome,
  COUNT(e.id) as quantidade,
  CASE 
    WHEN e.status = 'entregue' THEN '#22c55e'
    WHEN e.status = 'em_transito' THEN '#3b82f6'
    WHEN e.status = 'atrasada' THEN '#ef4444'
    WHEN e.status = 'aguardando' THEN '#f59e0b'
    ELSE '#6b7280'
  END as cor
FROM entregas e
WHERE e.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY e.status
ORDER BY quantidade DESC;

-- 4. Eficiência por rota/transportadora
SELECT 
  t.nome as transportadora,
  COUNT(j.id) as total_jornadas,
  COUNT(CASE WHEN j.status = 'entregue' THEN 1 END) as jornadas_concluidas,
  ROUND(
    (COUNT(CASE WHEN j.status = 'entregue' THEN 1 END) * 100.0 / COUNT(j.id)), 1
  ) as eficiencia_percentual,
  ROUND(AVG(j.progresso), 1) as progresso_medio,
  ROUND(AVG(DATEDIFF(j.data_conclusao, j.data_inicio)), 1) as tempo_medio_jornada
FROM transportadoras t
LEFT JOIN jornadas j ON t.id = j.transportadora_id
WHERE j.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY t.id, t.nome
HAVING total_jornadas > 0
ORDER BY eficiencia_percentual DESC;

-- 5. Indicadores de performance
SELECT 
  'Taxa de Entrega no Prazo' as indicador,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as valor,
  '%' as unidade,
  'Meta: 95%' as meta
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Tempo Médio de Entrega',
  ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1),
  'horas',
  'Meta: 2h'
FROM entregas e
WHERE e.status = 'entregue' 
  AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT 
  'Satisfação do Cliente (NPS)',
  ROUND(AVG(c.nps), 1),
  '/10',
  'Meta: 8.0'
FROM clientes c
WHERE c.nps > 0

UNION ALL

SELECT 
  'Custo por Entrega',
  ROUND(AVG(e.valor), 2),
  'R$',
  'Meta: R$ 8.00'
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 6. Metas vs Realizado
SELECT 
  'Entregas do Mês' as meta,
  2500 as meta_valor,
  COUNT(e.id) as realizado,
  ROUND((COUNT(e.id) * 100.0 / 2500), 1) as percentual_atingido
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 1 MONTH)

UNION ALL

SELECT 
  'Taxa de Sucesso',
  95.0,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ),
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)) / 95.0 * 100, 1
  )
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 1 MONTH)

UNION ALL

SELECT 
  'Redução de Custos',
  15.0,
  ROUND(
    ((AVG(e.valor) - LAG(AVG(e.valor)) OVER (ORDER BY DATE_FORMAT(e.data_entrega_real, '%Y-%m'))) / LAG(AVG(e.valor)) OVER (ORDER BY DATE_FORMAT(e.data_entrega_real, '%Y-%m')) * 100), 1
  ),
  ROUND(
    ((AVG(e.valor) - LAG(AVG(e.valor)) OVER (ORDER BY DATE_FORMAT(e.data_entrega_real, '%Y-%m'))) / LAG(AVG(e.valor)) OVER (ORDER BY DATE_FORMAT(e.data_entrega_real, '%Y-%m')) * 100) / 15.0 * 100, 1
  )
FROM entregas e
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
GROUP BY DATE_FORMAT(e.data_entrega_real, '%Y-%m')
ORDER BY DATE_FORMAT(e.data_entrega_real, '%Y-%m') DESC
LIMIT 1;

-- 7. Tendência de entregas (dados para gráfico de linha)
SELECT 
  DATE(e.data_entrega_real) as data,
  COUNT(e.id) as entregas_realizadas,
  COUNT(CASE WHEN e.data_entrega_real > e.data_entrega_estimada THEN 1 END) as entregas_atrasadas,
  ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1) as tempo_medio_horas
FROM entregas e
WHERE e.status = 'entregue'
  AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(e.data_entrega_real)
ORDER BY data;

-- 8. Top 10 clientes por volume de entregas
SELECT 
  c.id,
  u.nome,
  c.empresa,
  COUNT(e.id) as total_entregas,
  ROUND(SUM(e.valor), 2) as valor_total,
  ROUND(AVG(e.valor), 2) as ticket_medio,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as sla_percentual
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
JOIN entregas e ON c.id = e.cliente_id
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.id, u.nome, c.empresa
ORDER BY total_entregas DESC
LIMIT 10;

-- 9. Análise de custos por região
SELECT 
  c.estado,
  COUNT(e.id) as total_entregas,
  ROUND(AVG(e.valor), 2) as valor_medio,
  ROUND(SUM(e.valor), 2) as valor_total,
  ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1) as tempo_medio_horas
FROM clientes c
JOIN entregas e ON c.id = e.cliente_id
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.estado
ORDER BY valor_total DESC;

-- 10. Relatório de incidentes por período
SELECT 
  DATE(o.data_ocorrencia) as data,
  o.tipo,
  o.criticidade,
  COUNT(o.id) as quantidade,
  COUNT(CASE WHEN o.status = 'resolvida' THEN 1 END) as resolvidas,
  ROUND(
    (COUNT(CASE WHEN o.status = 'resolvida' THEN 1 END) * 100.0 / COUNT(o.id)), 1
  ) as taxa_resolucao
FROM ocorrencias o
WHERE o.data_ocorrencia >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(o.data_ocorrencia), o.tipo, o.criticidade
ORDER BY data DESC, quantidade DESC;

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View consolidada de performance de clientes
CREATE OR REPLACE VIEW vw_performance_clientes AS
SELECT 
  c.id,
  u.nome,
  c.empresa,
  c.score,
  c.nps,
  c.status,
  COUNT(e.id) as total_entregas,
  COUNT(CASE WHEN e.status = 'entregue' THEN 1 END) as entregas_concluidas,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as sla_percentual,
  ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) as tempo_medio_entrega,
  ROUND(SUM(e.valor), 2) as valor_total,
  c.engajamento_chat,
  c.ultima_atividade
FROM clientes c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN entregas e ON c.id = e.cliente_id
WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 30 DAY) OR e.id IS NULL
GROUP BY c.id, u.nome, c.empresa, c.score, c.nps, c.status, c.engajamento_chat, c.ultima_atividade;

-- View de métricas mensais
CREATE OR REPLACE VIEW vw_metricas_mensais AS
SELECT 
  DATE_FORMAT(e.data_entrega_real, '%Y-%m') as mes,
  COUNT(e.id) as total_entregas,
  COUNT(CASE WHEN e.status = 'entregue' THEN 1 END) as entregas_concluidas,
  COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo,
  ROUND(
    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
  ) as sla_percentual,
  ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1) as tempo_medio_horas,
  ROUND(SUM(e.valor), 2) as receita_total,
  ROUND(AVG(e.valor), 2) as ticket_medio
FROM entregas e
WHERE e.status = 'entregue'
  AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(e.data_entrega_real, '%Y-%m')
ORDER BY mes;

-- =====================================================
-- PROCEDURES PARA RELATÓRIOS
-- =====================================================

DELIMITER //

-- Procedure para gerar relatório de performance
CREATE PROCEDURE sp_relatorio_performance(IN periodo_dias INT)
BEGIN
  SELECT 
    'Total de Entregas' as metrica,
    COUNT(e.id) as valor,
    'unidades' as unidade
  FROM entregas e
  WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL periodo_dias DAY)
  
  UNION ALL
  
  SELECT 
    'Taxa de Sucesso',
    ROUND(
      (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
    ),
    '%'
  FROM entregas e
  WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL periodo_dias DAY)
  
  UNION ALL
  
  SELECT 
    'Tempo Médio',
    ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1),
    'horas'
  FROM entregas e
  WHERE e.status = 'entregue' 
    AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL periodo_dias DAY)
  
  UNION ALL
  
  SELECT 
    'Receita Total',
    ROUND(SUM(e.valor), 2),
    'R$'
  FROM entregas e
  WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL periodo_dias DAY);
END //

-- Procedure para atualizar métricas de clientes
CREATE PROCEDURE sp_atualizar_metricas_clientes()
BEGIN
  -- Atualizar total de embarques
  UPDATE clientes c
  SET total_embarques = (
    SELECT COUNT(*)
    FROM entregas e
    WHERE e.cliente_id = c.id
  );
  
  -- Atualizar engajamento no chat
  UPDATE clientes c
  SET engajamento_chat = (
    SELECT COUNT(*)
    FROM chat_mensagens cm
    WHERE cm.cliente_id = c.id
      AND cm.data_envio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  );
  
  -- Atualizar última atividade
  UPDATE clientes c
  SET ultima_atividade = (
    SELECT MAX(cm.data_envio)
    FROM chat_mensagens cm
    WHERE cm.cliente_id = c.id
  );
  
  -- Recalcular scores
  CALL sp_calcular_score_cliente(0); -- 0 = todos os clientes
END //

DELIMITER ;

-- =====================================================
-- FIM DAS QUERIES
-- =====================================================
