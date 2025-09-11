<?php
/**
 * API para Dashboard - Sistema MitTracking
 * Fornece dados dinâmicos para o dashboard
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir arquivo de conexão
require_once 'database.php';

// Definir modo de desenvolvimento
define('DEVELOPMENT_MODE', true);

// Função para executar query e retornar JSON
function executeQueryAndReturnJSON($sql, $params = []) {
    try {
        $stmt = executeQuery($sql, $params);
        $result = $stmt->fetchAll();
        return json_encode($result, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        return json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

// Função para executar query e retornar um único valor
function executeQueryAndReturnSingle($sql, $params = []) {
    try {
        $result = fetchOne($sql, $params);
        return json_encode($result, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        return json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

// Verificar se é uma requisição OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obter o endpoint solicitado
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'kpis':
        // KPIs principais
        $kpis = [];
        
        // Tempo Médio de Entrega
        $tempo_medio = fetchOne("
            SELECT 
                ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)), 1) as tempo_medio_entrega,
                ROUND(AVG(DATEDIFF(e.data_entrega_real, e.data_criacao)) - 
                    (SELECT AVG(DATEDIFF(e2.data_entrega_real, e2.data_criacao)) 
                     FROM entregas e2 
                     WHERE e2.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                     AND e2.data_entrega_real < DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 1) as variacao_tempo
            FROM entregas e
            WHERE e.status = 'entregue' 
              AND e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ");
        
        $kpis[] = [
            'title' => 'Tempo Médio de Entrega',
            'value' => ($tempo_medio['tempo_medio_entrega'] ?? 0) . ' dias',
            'change' => ($tempo_medio['variacao_tempo'] ?? 0) >= 0 ? '+' . ($tempo_medio['variacao_tempo'] ?? 0) : ($tempo_medio['variacao_tempo'] ?? 0),
            'trend' => ($tempo_medio['variacao_tempo'] ?? 0) >= 0 ? 'up' : 'down',
            'icon' => 'Clock'
        ];
        
        // SLA Atendido
        $sla = fetchOne("
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
            WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ");
        
        $kpis[] = [
            'title' => 'SLA Atendido',
            'value' => ($sla['sla_atendido'] ?? 0) . '%',
            'change' => ($sla['variacao_sla'] ?? 0) >= 0 ? '+' . ($sla['variacao_sla'] ?? 0) : ($sla['variacao_sla'] ?? 0),
            'trend' => ($sla['variacao_sla'] ?? 0) >= 0 ? 'up' : 'down',
            'icon' => 'Target'
        ];
        
        // NPS Médio
        $nps = fetchOne("
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
            WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ");
        
        $kpis[] = [
            'title' => 'NPS',
            'value' => $nps['nps_medio'] ?? 0,
            'change' => ($nps['variacao_nps'] ?? 0) >= 0 ? '+' . ($nps['variacao_nps'] ?? 0) : ($nps['variacao_nps'] ?? 0),
            'trend' => ($nps['variacao_nps'] ?? 0) >= 0 ? 'up' : 'down',
            'icon' => 'TrendingUp'
        ];
        
        // Total de Incidentes
        $incidentes = fetchOne("
            SELECT 
                COUNT(*) as total_incidentes,
                COUNT(*) - 
                (SELECT COUNT(*) 
                 FROM ocorrencias o2 
                 WHERE o2.data_ocorrencia >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                 AND o2.data_ocorrencia < DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as variacao_incidentes
            FROM ocorrencias o
            WHERE o.data_ocorrencia >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              AND o.status IN ('aberta', 'em_andamento')
        ");
        
        $kpis[] = [
            'title' => 'Incidentes',
            'value' => $incidentes['total_incidentes'] ?? 0,
            'change' => ($incidentes['variacao_incidentes'] ?? 0) >= 0 ? '+' . ($incidentes['variacao_incidentes'] ?? 0) : ($incidentes['variacao_incidentes'] ?? 0),
            'trend' => ($incidentes['variacao_incidentes'] ?? 0) >= 0 ? 'up' : 'down',
            'icon' => 'AlertTriangle'
        ];
        
        echo json_encode($kpis, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'status_distribution':
        // Distribuição de status das cargas
        $statusData = fetchAll("
            SELECT 
                CASE 
                    WHEN j.status = 'em_transito' THEN 'Em Trânsito'
                    WHEN j.status = 'entregue' THEN 'Entregue'
                    WHEN j.status = 'aguardando' THEN 'Aguardando Doc'
                    WHEN j.status = 'cancelada' THEN 'Cancelada'
                    WHEN j.status = 'atrasada' THEN 'Atrasada'
                END as status,
                COUNT(*) as value,
                CASE 
                    WHEN j.status = 'em_transito' THEN 'hsl(var(--chart-1))'
                    WHEN j.status = 'entregue' THEN 'hsl(var(--chart-2))'
                    WHEN j.status = 'aguardando' THEN 'hsl(var(--chart-3))'
                    WHEN j.status = 'cancelada' THEN 'hsl(var(--chart-4))'
                    WHEN j.status = 'atrasada' THEN 'hsl(var(--chart-5))'
                END as color
            FROM jornadas j
            WHERE j.data_criacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY j.status
            ORDER BY value DESC
        ");
        
        echo json_encode($statusData, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'client_performance':
        // Performance por cliente
        $clientData = fetchAll("
            SELECT 
                c.empresa as name,
                COUNT(e.id) as entregas,
                ROUND(
                    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(*)), 1
                ) as sla,
                c.score as score_cliente
            FROM clientes c
            LEFT JOIN entregas e ON c.id = e.cliente_id
            WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              OR e.data_entrega_real IS NULL
            GROUP BY c.id, c.empresa, c.score
            HAVING entregas > 0
            ORDER BY entregas DESC
            LIMIT 10
        ");
        
        echo json_encode($clientData, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'alerts':
        // Alertas operacionais
        $alerts = [];
        
        // Alertas de Atraso
        $atrasos = fetchAll("
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
              AND e.data_entrega_real IS NULL
            LIMIT 3
        ");
        
        $alerts = array_merge($alerts, $atrasos);
        
        // Alertas de Tempo Parado
        $tempo_parado = fetchAll("
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
              AND j.data_atualizacao < DATE_SUB(NOW(), INTERVAL 2 HOUR)
            LIMIT 3
        ");
        
        $alerts = array_merge($alerts, $tempo_parado);
        
        // Alertas de Ocorrências Críticas
        $ocorrencias = fetchAll("
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
            LIMIT 3
        ");
        
        $alerts = array_merge($alerts, $ocorrencias);
        
        echo json_encode($alerts, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'documents_chat':
        // Documentos recebidos via chat
        $documents = fetchAll("
            SELECT 
                d.tipo,
                COUNT(*) as quantidade,
                COUNT(CASE WHEN DATE(d.data_upload) = CURDATE() THEN 1 END) as hoje,
                COUNT(CASE WHEN d.origem_upload = 'chat' THEN 1 END) as via_chat
            FROM documentos d
            WHERE d.data_upload >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY d.tipo
            ORDER BY quantidade DESC
        ");
        
        echo json_encode($documents, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'recent_shipments':
        // Últimos embarques/jornadas
        $shipments = fetchAll("
            SELECT 
                j.codigo as id,
                c.empresa as cliente,
                j.destino,
                CASE 
                    WHEN j.status = 'em_transito' THEN 'Em Trânsito'
                    WHEN j.status = 'entregue' THEN 'Entregue'
                    WHEN j.status = 'aguardando' THEN 'Aguardando Doc'
                    WHEN j.status = 'cancelada' THEN 'Cancelada'
                    WHEN j.status = 'atrasada' THEN 'Atrasada'
                END as status,
                DATE(j.data_criacao) as data,
                j.progresso,
                t.nome as transportadora
            FROM jornadas j
            JOIN clientes c ON j.cliente_id = c.id
            LEFT JOIN transportadoras t ON j.transportadora_id = t.id
            ORDER BY j.data_criacao DESC
            LIMIT 10
        ");
        
        echo json_encode($shipments, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'growth_metrics':
        // Métricas de crescimento (últimos 12 meses)
        $growth = fetchAll("
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
            ORDER BY mes
        ");
        
        echo json_encode($growth, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'top_transporters':
        // Top 5 transportadoras
        $transporters = fetchAll("
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
            LIMIT 5
        ");
        
        echo json_encode($transporters, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'heatmap':
        // Mapa de calor - atividade por hora
        $heatmap = fetchAll("
            SELECT 
                HOUR(e.data_entrega_real) as hora,
                COUNT(*) as entregas,
                COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) as entregas_no_prazo
            FROM entregas e
            WHERE e.status = 'entregue'
              AND e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY HOUR(e.data_entrega_real)
            ORDER BY hora
        ");
        
        echo json_encode($heatmap, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'financial_summary':
        // Resumo financeiro
        $financial = fetchOne("
            SELECT 
                ROUND(SUM(e.valor), 2) as receita_total,
                ROUND(AVG(e.valor), 2) as ticket_medio,
                COUNT(*) as total_entregas,
                ROUND(SUM(e.valor) / COUNT(*), 2) as receita_por_entrega
            FROM entregas e
            WHERE e.data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              AND e.status = 'entregue'
        ");
        
        echo json_encode($financial, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'dashboard_summary':
        // Resumo completo do dashboard
        $summary = fetchOne("
            SELECT 
                (SELECT COUNT(*) FROM jornadas WHERE data_criacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as total_jornadas,
                (SELECT COUNT(*) FROM entregas WHERE data_entrega_real >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as total_entregas,
                (SELECT COUNT(*) FROM clientes WHERE status = 'ativo') as total_clientes,
                (SELECT COUNT(*) FROM transportadoras WHERE status = 'ativo') as total_transportadoras,
                (SELECT COUNT(*) FROM ocorrencias WHERE status IN ('aberta', 'em_andamento')) as total_ocorrencias_abertas
        ");
        
        echo json_encode($summary, JSON_UNESCAPED_UNICODE);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado'], JSON_UNESCAPED_UNICODE);
        break;
}
?>
