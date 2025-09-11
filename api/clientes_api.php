<?php
/**
 * API para Página de Clientes - Sistema MitTracking
 * Fornece dados dinâmicos para a página de clientes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

switch ($endpoint) {
    case 'lista':
        // Lista completa de clientes com métricas
        $clientes = fetchAll("
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
            ORDER BY c.score DESC, c.total_embarques DESC
        ");
        
        echo json_encode($clientes, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'metricas':
        // Métricas gerais de clientes
        $metricas = fetchOne("
            SELECT 
                COUNT(*) as total_clientes,
                COUNT(CASE WHEN status = 'ativo' THEN 1 END) as clientes_ativos,
                COUNT(CASE WHEN status = 'inativo' THEN 1 END) as clientes_inativos,
                COUNT(CASE WHEN status = 'pendente' THEN 1 END) as clientes_pendentes,
                ROUND(AVG(score), 1) as score_medio,
                ROUND(AVG(nps), 1) as nps_medio,
                SUM(total_embarques) as total_embarques_geral,
                ROUND(AVG(engajamento_chat), 1) as engajamento_medio
            FROM clientes
        ");
        
        echo json_encode($metricas, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'top_score':
        // Clientes com maior score
        $topScore = fetchAll("
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
            LIMIT 10
        ");
        
        echo json_encode($topScore, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'engajamento':
        // Clientes com maior engajamento no chat
        $engajamento = fetchAll("
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
            LIMIT 10
        ");
        
        echo json_encode($engajamento, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'nps':
        // NPS por cliente
        $nps = fetchAll("
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
            ORDER BY c.nps DESC
        ");
        
        echo json_encode($nps, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'alertas':
        // Alertas e incidentes por cliente
        $alertas = fetchAll("
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
            ORDER BY ocorrencias_ativas DESC, total_ocorrencias DESC
        ");
        
        echo json_encode($alertas, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'performance':
        // Performance de entregas por cliente
        $performance = fetchAll("
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
            ORDER BY sla_percentual DESC
        ");
        
        echo json_encode($performance, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'buscar':
        // Busca de clientes (para filtro)
        $termo = $_GET['termo'] ?? '';
        $clientes = fetchAll("
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
            ORDER BY c.score DESC
        ", [$termo, $termo, $termo]);
        
        echo json_encode($clientes, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'criar':
        // Criar novo cliente
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Criar usuário primeiro
            $usuarioId = insert("
                INSERT INTO usuarios (nome, email, senha, perfil, status) 
                VALUES (?, ?, ?, 'cliente', 'ativo')
            ", [
                $data['nome'],
                $data['email'],
                password_hash('123456', PASSWORD_DEFAULT) // Senha padrão
            ]);
            
            // Criar cliente
            $clienteId = insert("
                INSERT INTO clientes (usuario_id, empresa, telefone, endereco, cidade, estado, cep) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ", [
                $usuarioId,
                $data['empresa'],
                $data['telefone'],
                $data['endereco'],
                $data['cidade'] ?? 'São Paulo',
                $data['estado'] ?? 'SP',
                $data['cep'] ?? '00000-000'
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Cliente criado com sucesso',
                'cliente_id' => $clienteId
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        break;
        
    case 'atualizar':
        // Atualizar cliente
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $clienteId = $data['id'] ?? null;
        
        if (!$clienteId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID do cliente é obrigatório'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        try {
            // Atualizar dados do cliente
            update("
                UPDATE clientes 
                SET empresa = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cep = ?
                WHERE id = ?
            ", [
                $data['empresa'],
                $data['telefone'],
                $data['endereco'],
                $data['cidade'],
                $data['estado'],
                $data['cep'],
                $clienteId
            ]);
            
            // Atualizar dados do usuário
            update("
                UPDATE usuarios u
                JOIN clientes c ON u.id = c.usuario_id
                SET u.nome = ?, u.email = ?
                WHERE c.id = ?
            ", [
                $data['nome'],
                $data['email'],
                $clienteId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Cliente atualizado com sucesso'
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        break;
        
    case 'deletar':
        // Deletar cliente
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        $clienteId = $_GET['id'] ?? null;
        
        if (!$clienteId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID do cliente é obrigatório'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        try {
            // Deletar cliente (cascade deletará o usuário também)
            delete("DELETE FROM clientes WHERE id = ?", [$clienteId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Cliente deletado com sucesso'
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
        break;
        
    case 'detalhes':
        // Detalhes completos de um cliente
        $clienteId = $_GET['id'] ?? null;
        
        if (!$clienteId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID do cliente é obrigatório'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        $cliente = fetchOne("
            SELECT 
                c.*,
                u.nome,
                u.email,
                u.ultimo_login,
                COUNT(e.id) as total_entregas,
                COUNT(CASE WHEN e.status = 'entregue' THEN 1 END) as entregas_concluidas,
                ROUND(AVG(e.valor), 2) as ticket_medio,
                ROUND(SUM(e.valor), 2) as receita_total
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            LEFT JOIN entregas e ON c.id = e.cliente_id
            WHERE c.id = ?
            GROUP BY c.id
        ", [$clienteId]);
        
        if (!$cliente) {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente não encontrado'], JSON_UNESCAPED_UNICODE);
            break;
        }
        
        echo json_encode($cliente, JSON_UNESCAPED_UNICODE);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado'], JSON_UNESCAPED_UNICODE);
        break;
}
?>
