<?php
/**
 * API para Página de Relatórios - Sistema MitTracking
 * Fornece dados dinâmicos para a página de relatórios
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir arquivo de conexão
require_once 'database.php';

// Definir modo de desenvolvimento
define('DEVELOPMENT_MODE', true);

// Verificar se é uma requisição OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obter o endpoint solicitado
$endpoint = $_GET['endpoint'] ?? '';
$periodo = $_GET['periodo'] ?? '30'; // dias

// Função para obter período baseado no parâmetro
function getPeriodo($periodo) {
    switch ($periodo) {
        case '7days': return 7;
        case '30days': return 30;
        case '90days': return 90;
        case 'year': return 365;
        default: return 30;
    }
}

$dias = getPeriodo($periodo);

switch ($endpoint) {
    case 'kpis':
        // KPIs principais para relatórios
        $kpis = fetchOne("
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
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ", [$dias]);
        
        echo json_encode($kpis, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'entregas_mes':
        // Entregas por mês (últimos 12 meses)
        $entregasMes = fetchAll("
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
            ORDER BY mes
        ");
        
        echo json_encode($entregasMes, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'status_distribuicao':
        // Status das entregas (distribuição atual)
        $statusDist = fetchAll("
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
            WHERE e.data_criacao >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY e.status
            ORDER BY quantidade DESC
        ", [$dias]);
        
        echo json_encode($statusDist, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'eficiencia_rotas':
        // Eficiência por rota/transportadora
        $eficiencia = fetchAll("
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
            WHERE j.data_criacao >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY t.id, t.nome
            HAVING total_jornadas > 0
            ORDER BY eficiencia_percentual DESC
        ", [$dias]);
        
        echo json_encode($eficiencia, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'indicadores_performance':
        // Indicadores de performance
        $indicadores = fetchAll("
            SELECT 
                'Taxa de Entrega no Prazo' as indicador,
                ROUND(
                    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
                ) as valor,
                '%' as unidade,
                'Meta: 95%' as meta
            FROM entregas e
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
            
            UNION ALL
            
            SELECT 
                'Tempo Médio de Entrega',
                ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1),
                'horas',
                'Meta: 2h'
            FROM entregas e
            WHERE e.status = 'entregue' 
              AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
            
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
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ", [$dias, $dias, $dias]);
        
        echo json_encode($indicadores, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'metas_vs_realizado':
        // Metas vs Realizado
        $metas = fetchAll("
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
        ");
        
        echo json_encode($metas, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'tendencia_entregas':
        // Tendência de entregas (dados para gráfico de linha)
        $tendencia = fetchAll("
            SELECT 
                DATE(e.data_entrega_real) as data,
                COUNT(e.id) as entregas_realizadas,
                COUNT(CASE WHEN e.data_entrega_real > e.data_entrega_estimada THEN 1 END) as entregas_atrasadas,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1) as tempo_medio_horas
            FROM entregas e
            WHERE e.status = 'entregue'
              AND e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(e.data_entrega_real)
            ORDER BY data
        ", [$dias]);
        
        echo json_encode($tendencia, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'top_clientes':
        // Top 10 clientes por volume de entregas
        $topClientes = fetchAll("
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
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY c.id, u.nome, c.empresa
            ORDER BY total_entregas DESC
            LIMIT 10
        ", [$dias]);
        
        echo json_encode($topClientes, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'analise_regioes':
        // Análise de custos por região
        $regioes = fetchAll("
            SELECT 
                c.estado,
                COUNT(e.id) as total_entregas,
                ROUND(AVG(e.valor), 2) as valor_medio,
                ROUND(SUM(e.valor), 2) as valor_total,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1) as tempo_medio_horas
            FROM clientes c
            JOIN entregas e ON c.id = e.cliente_id
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY c.estado
            ORDER BY valor_total DESC
        ", [$dias]);
        
        echo json_encode($regioes, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'incidentes_periodo':
        // Relatório de incidentes por período
        $incidentes = fetchAll("
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
            WHERE o.data_ocorrencia >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(o.data_ocorrencia), o.tipo, o.criticidade
            ORDER BY data DESC, quantidade DESC
        ", [$dias]);
        
        echo json_encode($incidentes, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'resumo_financeiro':
        // Resumo financeiro
        $financeiro = fetchOne("
            SELECT 
                ROUND(SUM(e.valor), 2) as receita_total,
                ROUND(AVG(e.valor), 2) as ticket_medio,
                COUNT(e.id) as total_entregas,
                ROUND(SUM(e.valor) / COUNT(e.id), 2) as receita_por_entrega,
                ROUND(SUM(e.valor) / 30, 2) as receita_diaria_media
            FROM entregas e
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
              AND e.status = 'entregue'
        ", [$dias]);
        
        echo json_encode($financeiro, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'performance_detalhada':
        // Performance detalhada com comparações
        $performance = fetchOne("
            SELECT 
                -- Período atual
                COUNT(e.id) as entregas_atual,
                ROUND(
                    (COUNT(CASE WHEN e.data_entrega_real <= e.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e.id)), 1
                ) as sla_atual,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, e.data_criacao, e.data_entrega_real)), 1) as tempo_atual,
                ROUND(SUM(e.valor), 2) as receita_atual,
                
                -- Período anterior
                (SELECT COUNT(e2.id) 
                 FROM entregas e2 
                 WHERE e2.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY) 
                 AND e2.data_entrega_real < DATE_SUB(NOW(), INTERVAL ? DAY)) as entregas_anterior,
                
                (SELECT ROUND(
                    (COUNT(CASE WHEN e2.data_entrega_real <= e2.data_entrega_estimada THEN 1 END) * 100.0 / COUNT(e2.id)), 1
                 )
                 FROM entregas e2 
                 WHERE e2.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY) 
                 AND e2.data_entrega_real < DATE_SUB(NOW(), INTERVAL ? DAY)) as sla_anterior,
                
                (SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, e2.data_criacao, e2.data_entrega_real)), 1)
                 FROM entregas e2 
                 WHERE e2.status = 'entregue'
                 AND e2.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY) 
                 AND e2.data_entrega_real < DATE_SUB(NOW(), INTERVAL ? DAY)) as tempo_anterior,
                
                (SELECT ROUND(SUM(e2.valor), 2)
                 FROM entregas e2 
                 WHERE e2.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY) 
                 AND e2.data_entrega_real < DATE_SUB(NOW(), INTERVAL ? DAY)) as receita_anterior
                 
            FROM entregas e
            WHERE e.data_entrega_real >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ", [$dias * 2, $dias, $dias * 2, $dias, $dias * 2, $dias, $dias * 2, $dias, $dias]);
        
        // Calcular variações percentuais
        if ($performance) {
            $performance['variacao_entregas'] = $performance['entregas_anterior'] > 0 ? 
                round((($performance['entregas_atual'] - $performance['entregas_anterior']) / $performance['entregas_anterior']) * 100, 1) : 0;
            
            $performance['variacao_sla'] = $performance['sla_anterior'] > 0 ? 
                round($performance['sla_atual'] - $performance['sla_anterior'], 1) : 0;
            
            $performance['variacao_tempo'] = $performance['tempo_anterior'] > 0 ? 
                round($performance['tempo_atual'] - $performance['tempo_anterior'], 1) : 0;
            
            $performance['variacao_receita'] = $performance['receita_anterior'] > 0 ? 
                round((($performance['receita_atual'] - $performance['receita_anterior']) / $performance['receita_anterior']) * 100, 1) : 0;
        }
        
        echo json_encode($performance, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'exportar':
        // Exportar relatório (simulado)
        $tipo = $_GET['tipo'] ?? 'pdf';
        $formato = $_GET['formato'] ?? 'completo';
        
        // Simular geração de relatório
        $relatorio = [
            'id' => 'REL-' . date('YmdHis'),
            'tipo' => $tipo,
            'formato' => $formato,
            'periodo' => $dias . ' dias',
            'data_geracao' => date('Y-m-d H:i:s'),
            'status' => 'processando',
            'url_download' => '/reports/relatorio-' . date('YmdHis') . '.' . $tipo
        ];
        
        // Simular processamento assíncrono
        sleep(2);
        $relatorio['status'] = 'concluido';
        
        echo json_encode($relatorio, JSON_UNESCAPED_UNICODE);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado'], JSON_UNESCAPED_UNICODE);
        break;
}
?>
