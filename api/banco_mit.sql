-- =====================================================
-- SISTEMA MITTRACKING - ESTRUTURA COMPLETA DO BANCO
-- =====================================================
-- Sistema de rastreamento logístico com dashboard dinâmico
-- Desenvolvido para otimizar operações logísticas
-- Versão: 1.0.0
-- =====================================================

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS `mit` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `mit`;

-- =====================================================
-- 1. TABELAS PRINCIPAIS (15 TABELAS)
-- =====================================================

-- 1.1. Tabela de usuários do sistema
CREATE TABLE `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo` ENUM('admin', 'operador', 'cliente') DEFAULT 'operador',
    `ativo` BOOLEAN DEFAULT TRUE,
    `ultimo_login` TIMESTAMP NULL,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2. Tabela de clientes
CREATE TABLE `clientes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `empresa` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `telefone` VARCHAR(20),
    `endereco` TEXT,
    `cidade` VARCHAR(50),
    `estado` VARCHAR(2),
    `cep` VARCHAR(10),
    `cnpj` VARCHAR(18) UNIQUE,
    `score` DECIMAL(3,1) DEFAULT 0.0,
    `nps` INT DEFAULT 0,
    `status` ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    `data_cadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ultima_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_empresa` (`empresa`),
    INDEX `idx_email` (`email`),
    INDEX `idx_cnpj` (`cnpj`),
    INDEX `idx_status` (`status`),
    INDEX `idx_score` (`score`),
    INDEX `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3. Tabela de funcionários
CREATE TABLE `funcionarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `telefone` VARCHAR(20),
    `cargo` VARCHAR(50),
    `departamento` VARCHAR(50),
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_admissao` DATE,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_cargo` (`cargo`),
    INDEX `idx_departamento` (`departamento`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4. Tabela de transportadoras
CREATE TABLE `transportadoras` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `cnpj` VARCHAR(18) UNIQUE NOT NULL,
    `email` VARCHAR(100),
    `telefone` VARCHAR(20),
    `endereco` TEXT,
    `cidade` VARCHAR(50),
    `estado` VARCHAR(2),
    `cep` VARCHAR(10),
    `avaliacao` DECIMAL(3,1) DEFAULT 0.0,
    `status` ENUM('ativa', 'inativa', 'suspensa') DEFAULT 'ativa',
    `data_cadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_cnpj` (`cnpj`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_status` (`status`),
    INDEX `idx_avaliacao` (`avaliacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5. Tabela de motoristas
CREATE TABLE `motoristas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) UNIQUE NOT NULL,
    `cnh` VARCHAR(20) UNIQUE NOT NULL,
    `telefone` VARCHAR(20),
    `email` VARCHAR(100),
    `transportadora_id` INT,
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_cadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`transportadora_id`) REFERENCES `transportadoras`(`id`) ON DELETE SET NULL,
    INDEX `idx_cpf` (`cpf`),
    INDEX `idx_cnh` (`cnh`),
    INDEX `idx_transportadora` (`transportadora_id`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.6. Tabela de veículos
CREATE TABLE `veiculos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `placa` VARCHAR(10) UNIQUE NOT NULL,
    `modelo` VARCHAR(50),
    `marca` VARCHAR(50),
    `ano` YEAR,
    `capacidade_carga` DECIMAL(10,2),
    `tipo` ENUM('caminhao', 'van', 'carreta', 'outro') DEFAULT 'caminhao',
    `transportadora_id` INT,
    `motorista_id` INT,
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_cadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`transportadora_id`) REFERENCES `transportadoras`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`motorista_id`) REFERENCES `motoristas`(`id`) ON DELETE SET NULL,
    INDEX `idx_placa` (`placa`),
    INDEX `idx_transportadora` (`transportadora_id`),
    INDEX `idx_motorista` (`motorista_id`),
    INDEX `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.7. Tabela de jornadas (viagens/logísticas)
CREATE TABLE `jornadas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(20) UNIQUE NOT NULL,
    `origem` VARCHAR(100) NOT NULL,
    `destino` VARCHAR(100) NOT NULL,
    `cliente_id` INT,
    `transportadora_id` INT,
    `veiculo_id` INT,
    `motorista_id` INT,
    `data_inicio` TIMESTAMP NULL,
    `data_fim` TIMESTAMP NULL,
    `status` ENUM('agendada', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'agendada',
    `progresso` DECIMAL(5,2) DEFAULT 0.00,
    `distancia_km` DECIMAL(10,2),
    `tempo_estimado_horas` DECIMAL(5,2),
    `observacoes` TEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`transportadora_id`) REFERENCES `transportadoras`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`motorista_id`) REFERENCES `motoristas`(`id`) ON DELETE SET NULL,
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_cliente` (`cliente_id`),
    INDEX `idx_transportadora` (`transportadora_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_data_inicio` (`data_inicio`),
    INDEX `idx_progresso` (`progresso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.8. Tabela de checkpoints (pontos de controle)
CREATE TABLE `checkpoints` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `jornada_id` INT NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `endereco` TEXT,
    `ordem` INT NOT NULL,
    `data_prevista` TIMESTAMP NULL,
    `data_realizada` TIMESTAMP NULL,
    `status` ENUM('pendente', 'em_andamento', 'concluido', 'atrasado') DEFAULT 'pendente',
    `observacoes` TEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`jornada_id`) REFERENCES `jornadas`(`id`) ON DELETE CASCADE,
    INDEX `idx_jornada` (`jornada_id`),
    INDEX `idx_ordem` (`ordem`),
    INDEX `idx_status` (`status`),
    INDEX `idx_data_prevista` (`data_prevista`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.9. Tabela de entregas
CREATE TABLE `entregas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(20) UNIQUE NOT NULL,
    `jornada_id` INT,
    `cliente_id` INT NOT NULL,
    `destinatario` VARCHAR(100),
    `endereco_entrega` TEXT NOT NULL,
    `cidade` VARCHAR(50),
    `estado` VARCHAR(2),
    `cep` VARCHAR(10),
    `valor` DECIMAL(10,2),
    `peso` DECIMAL(8,2),
    `volume` INT DEFAULT 1,
    `data_prevista` TIMESTAMP NULL,
    `data_entregue` TIMESTAMP NULL,
    `status` ENUM('aguardando', 'em_transito', 'entregue', 'atrasada', 'devolvida') DEFAULT 'aguardando',
    `observacoes` TEXT,
    `assinatura_digital` TEXT,
    `foto_entrega` VARCHAR(255),
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`jornada_id`) REFERENCES `jornadas`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE,
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_jornada` (`jornada_id`),
    INDEX `idx_cliente` (`cliente_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_data_prevista` (`data_prevista`),
    INDEX `idx_data_entregue` (`data_entregue`),
    INDEX `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.10. Tabela de documentos
CREATE TABLE `documentos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tipo` ENUM('cte', 'nfe', 'bl', 'awb', 'outro') NOT NULL,
    `numero` VARCHAR(50) NOT NULL,
    `jornada_id` INT,
    `entrega_id` INT,
    `cliente_id` INT,
    `arquivo_path` VARCHAR(255),
    `data_emissao` DATE,
    `data_vencimento` DATE,
    `valor` DECIMAL(10,2),
    `status` ENUM('pendente', 'aprovado', 'rejeitado', 'vencido') DEFAULT 'pendente',
    `observacoes` TEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`jornada_id`) REFERENCES `jornadas`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`entrega_id`) REFERENCES `entregas`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL,
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_numero` (`numero`),
    INDEX `idx_jornada` (`jornada_id`),
    INDEX `idx_entrega` (`entrega_id`),
    INDEX `idx_cliente` (`cliente_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.11. Tabela de ocorrências (incidentes e problemas)
CREATE TABLE `ocorrencias` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tipo` ENUM('atraso', 'avaria', 'perda', 'roubo', 'acidente', 'outro') NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descricao` TEXT NOT NULL,
    `jornada_id` INT,
    `entrega_id` INT,
    `cliente_id` INT,
    `severidade` ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
    `status` ENUM('aberta', 'em_andamento', 'resolvida', 'cancelada') DEFAULT 'aberta',
    `data_ocorrencia` TIMESTAMP NOT NULL,
    `data_resolucao` TIMESTAMP NULL,
    `responsavel_id` INT,
    `observacoes` TEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`jornada_id`) REFERENCES `jornadas`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`entrega_id`) REFERENCES `entregas`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`responsavel_id`) REFERENCES `funcionarios`(`id`) ON DELETE SET NULL,
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_jornada` (`jornada_id`),
    INDEX `idx_entrega` (`entrega_id`),
    INDEX `idx_cliente` (`cliente_id`),
    INDEX `idx_severidade` (`severidade`),
    INDEX `idx_status` (`status`),
    INDEX `idx_data_ocorrencia` (`data_ocorrencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.12. Tabela de mensagens do chat
CREATE TABLE `chat_mensagens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cliente_id` INT,
    `funcionario_id` INT,
    `jornada_id` INT,
    `entrega_id` INT,
    `tipo` ENUM('texto', 'imagem', 'documento', 'sistema') DEFAULT 'texto',
    `conteudo` TEXT NOT NULL,
    `arquivo_path` VARCHAR(255),
    `lida` BOOLEAN DEFAULT FALSE,
    `data_leitura` TIMESTAMP NULL,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`jornada_id`) REFERENCES `jornadas`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`entrega_id`) REFERENCES `entregas`(`id`) ON DELETE SET NULL,
    INDEX `idx_cliente` (`cliente_id`),
    INDEX `idx_funcionario` (`funcionario_id`),
    INDEX `idx_jornada` (`jornada_id`),
    INDEX `idx_entrega` (`entrega_id`),
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.13. Tabela de relatórios
CREATE TABLE `relatorios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(200) NOT NULL,
    `tipo` ENUM('dashboard', 'clientes', 'entregas', 'performance', 'financeiro') NOT NULL,
    `parametros` JSON,
    `filtros` JSON,
    `periodo_inicio` DATE,
    `periodo_fim` DATE,
    `status` ENUM('gerando', 'concluido', 'erro') DEFAULT 'gerando',
    `arquivo_path` VARCHAR(255),
    `criado_por` INT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `concluido_em` TIMESTAMP NULL,
    FOREIGN KEY (`criado_por`) REFERENCES `funcionarios`(`id`) ON DELETE SET NULL,
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_status` (`status`),
    INDEX `idx_criado_por` (`criado_por`),
    INDEX `idx_periodo` (`periodo_inicio`, `periodo_fim`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.14. Tabela de configurações do sistema
CREATE TABLE `configuracoes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `chave` VARCHAR(100) UNIQUE NOT NULL,
    `valor` TEXT,
    `tipo` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    `descricao` TEXT,
    `categoria` VARCHAR(50),
    `editavel` BOOLEAN DEFAULT TRUE,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_chave` (`chave`),
    INDEX `idx_categoria` (`categoria`),
    INDEX `idx_editavel` (`editavel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.15. Tabela de logs do sistema
CREATE TABLE `logs_sistema` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nivel` ENUM('debug', 'info', 'warning', 'error', 'critical') NOT NULL,
    `categoria` VARCHAR(50),
    `mensagem` TEXT NOT NULL,
    `contexto` JSON,
    `usuario_id` INT,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL,
    INDEX `idx_nivel` (`nivel`),
    INDEX `idx_categoria` (`categoria`),
    INDEX `idx_usuario` (`usuario_id`),
    INDEX `idx_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX `idx_jornadas_cliente_status` ON `jornadas` (`cliente_id`, `status`);
CREATE INDEX `idx_entregas_cliente_status` ON `entregas` (`cliente_id`, `status`);
CREATE INDEX `idx_entregas_data_status` ON `entregas` (`data_entregue`, `status`);
CREATE INDEX `idx_ocorrencias_cliente_status` ON `ocorrencias` (`cliente_id`, `status`);
CREATE INDEX `idx_chat_cliente_data` ON `chat_mensagens` (`cliente_id`, `criado_em`);

-- Índices para consultas de relatórios
CREATE INDEX `idx_entregas_periodo` ON `entregas` (`data_entregue`, `status`, `cliente_id`);
CREATE INDEX `idx_jornadas_periodo` ON `jornadas` (`data_inicio`, `status`, `cliente_id`);
CREATE INDEX `idx_ocorrencias_periodo` ON `ocorrencias` (`data_ocorrencia`, `status`, `tipo`);

-- =====================================================
-- 3. VIEWS ÚTEIS
-- =====================================================

-- 3.1. View consolidada do dashboard
CREATE VIEW `vw_dashboard_completo` AS
SELECT 
    (SELECT COUNT(*) FROM `entregas` WHERE `status` = 'entregue') as total_entregas,
    (SELECT COUNT(*) FROM `entregas` WHERE `status` = 'entregue' AND `data_entregue` >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as entregas_mes,
    (SELECT AVG(TIMESTAMPDIFF(HOUR, `data_prevista`, `data_entregue`)) FROM `entregas` WHERE `status` = 'entregue' AND `data_entregue` IS NOT NULL) as tempo_medio_entrega,
    (SELECT COUNT(*) FROM `entregas` WHERE `status` = 'entregue' AND `data_entregue` <= `data_prevista`) / 
    (SELECT COUNT(*) FROM `entregas` WHERE `status` = 'entregue') * 100 as sla_percentual,
    (SELECT AVG(`nps`) FROM `clientes` WHERE `nps` > 0) as nps_medio,
    (SELECT COUNT(*) FROM `ocorrencias` WHERE `status` = 'aberta' AND `severidade` IN ('alta', 'critica')) as incidentes_criticos,
    (SELECT COUNT(*) FROM `clientes` WHERE `status` = 'ativo') as total_clientes,
    (SELECT COUNT(*) FROM `jornadas` WHERE `status` = 'em_andamento') as jornadas_ativas;

-- 3.2. View de performance dos clientes
CREATE VIEW `vw_performance_clientes` AS
SELECT 
    c.`id`,
    c.`nome`,
    c.`empresa`,
    c.`score`,
    c.`nps`,
    COUNT(DISTINCT e.`id`) as total_entregas,
    COUNT(DISTINCT CASE WHEN e.`status` = 'entregue' THEN e.`id` END) as entregas_concluidas,
    COUNT(DISTINCT CASE WHEN e.`status` = 'atrasada' THEN e.`id` END) as entregas_atrasadas,
    AVG(CASE WHEN e.`status` = 'entregue' AND e.`data_entregue` IS NOT NULL 
        THEN TIMESTAMPDIFF(HOUR, e.`data_prevista`, e.`data_entregue`) END) as tempo_medio_entrega,
    COUNT(DISTINCT o.`id`) as total_ocorrencias,
    COUNT(DISTINCT cm.`id`) as total_mensagens_chat,
    c.`data_cadastro`,
    c.`ultima_atualizacao`
FROM `clientes` c
LEFT JOIN `entregas` e ON c.`id` = e.`cliente_id`
LEFT JOIN `ocorrencias` o ON c.`id` = o.`cliente_id`
LEFT JOIN `chat_mensagens` cm ON c.`id` = cm.`cliente_id`
WHERE c.`status` = 'ativo'
GROUP BY c.`id`, c.`nome`, c.`empresa`, c.`score`, c.`nps`, c.`data_cadastro`, c.`ultima_atualizacao`;

-- 3.3. View de métricas mensais
CREATE VIEW `vw_metricas_mensais` AS
SELECT 
    DATE_FORMAT(e.`data_entregue`, '%Y-%m') as mes,
    COUNT(*) as total_entregas,
    COUNT(CASE WHEN e.`data_entregue` <= e.`data_prevista` THEN 1 END) as entregas_no_prazo,
    AVG(TIMESTAMPDIFF(HOUR, e.`data_prevista`, e.`data_entregue`)) as tempo_medio_horas,
    SUM(e.`valor`) as receita_total,
    AVG(e.`valor`) as ticket_medio,
    COUNT(DISTINCT e.`cliente_id`) as clientes_ativos,
    COUNT(DISTINCT o.`id`) as total_ocorrencias
FROM `entregas` e
LEFT JOIN `ocorrencias` o ON e.`id` = o.`entrega_id`
WHERE e.`status` = 'entregue' AND e.`data_entregue` IS NOT NULL
GROUP BY DATE_FORMAT(e.`data_entregue`, '%Y-%m')
ORDER BY mes DESC;

-- =====================================================
-- 4. STORED PROCEDURES
-- =====================================================

-- 4.1. Procedure para calcular score do cliente
DELIMITER //
CREATE PROCEDURE `sp_calcular_score_cliente`(IN cliente_id INT)
BEGIN
    DECLARE score DECIMAL(3,1) DEFAULT 0.0;
    DECLARE entregas_total INT DEFAULT 0;
    DECLARE entregas_pontuais INT DEFAULT 0;
    DECLARE nps_cliente INT DEFAULT 0;
    DECLARE ocorrencias_total INT DEFAULT 0;
    
    -- Calcular entregas pontuais
    SELECT COUNT(*), 
           COUNT(CASE WHEN `data_entregue` <= `data_prevista` THEN 1 END)
    INTO entregas_total, entregas_pontuais
    FROM `entregas` 
    WHERE `cliente_id` = cliente_id AND `status` = 'entregue';
    
    -- Obter NPS do cliente
    SELECT `nps` INTO nps_cliente FROM `clientes` WHERE `id` = cliente_id;
    
    -- Contar ocorrências
    SELECT COUNT(*) INTO ocorrencias_total
    FROM `ocorrencias` 
    WHERE `cliente_id` = cliente_id AND `data_ocorrencia` >= DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Calcular score (0-100)
    IF entregas_total > 0 THEN
        SET score = (entregas_pontuais / entregas_total) * 50; -- 50% pontualidade
        SET score = score + (nps_cliente * 0.3); -- 30% NPS
        SET score = score + GREATEST(0, 20 - (ocorrencias_total * 2)); -- 20% - ocorrências
        SET score = LEAST(100, GREATEST(0, score));
    END IF;
    
    -- Atualizar score do cliente
    UPDATE `clientes` SET `score` = score WHERE `id` = cliente_id;
    
    SELECT score as novo_score;
END //
DELIMITER ;

-- 4.2. Procedure para calcular progresso da jornada
DELIMITER //
CREATE PROCEDURE `sp_calcular_progresso_jornada`(IN jornada_id INT)
BEGIN
    DECLARE total_checkpoints INT DEFAULT 0;
    DECLARE checkpoints_concluidos INT DEFAULT 0;
    DECLARE progresso DECIMAL(5,2) DEFAULT 0.00;
    
    -- Contar checkpoints
    SELECT COUNT(*), 
           COUNT(CASE WHEN `status` = 'concluido' THEN 1 END)
    INTO total_checkpoints, checkpoints_concluidos
    FROM `checkpoints` 
    WHERE `jornada_id` = jornada_id;
    
    -- Calcular progresso
    IF total_checkpoints > 0 THEN
        SET progresso = (checkpoints_concluidos / total_checkpoints) * 100;
    END IF;
    
    -- Atualizar progresso da jornada
    UPDATE `jornadas` SET `progresso` = progresso WHERE `id` = jornada_id;
    
    -- Atualizar status se necessário
    IF progresso = 100 THEN
        UPDATE `jornadas` SET `status` = 'concluida' WHERE `id` = jornada_id;
    ELSEIF progresso > 0 THEN
        UPDATE `jornadas` SET `status` = 'em_andamento' WHERE `id` = jornada_id;
    END IF;
    
    SELECT progresso as novo_progresso;
END //
DELIMITER ;

-- 4.3. Procedure para gerar relatório de performance
DELIMITER //
CREATE PROCEDURE `sp_relatorio_performance`(
    IN data_inicio DATE,
    IN data_fim DATE,
    IN cliente_id INT
)
BEGIN
    SELECT 
        c.`nome` as cliente,
        c.`empresa`,
        COUNT(e.`id`) as total_entregas,
        COUNT(CASE WHEN e.`status` = 'entregue' THEN 1 END) as entregas_concluidas,
        COUNT(CASE WHEN e.`status` = 'atrasada' THEN 1 END) as entregas_atrasadas,
        AVG(CASE WHEN e.`status` = 'entregue' AND e.`data_entregue` IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, e.`data_prevista`, e.`data_entregue`) END) as tempo_medio_horas,
        SUM(e.`valor`) as receita_total,
        AVG(e.`valor`) as ticket_medio,
        COUNT(o.`id`) as total_ocorrencias,
        c.`score`,
        c.`nps`
    FROM `clientes` c
    LEFT JOIN `entregas` e ON c.`id` = e.`cliente_id` 
        AND e.`data_entregue` BETWEEN data_inicio AND data_fim
    LEFT JOIN `ocorrencias` o ON c.`id` = o.`cliente_id` 
        AND o.`data_ocorrencia` BETWEEN data_inicio AND data_fim
    WHERE (cliente_id IS NULL OR c.`id` = cliente_id)
        AND c.`status` = 'ativo'
    GROUP BY c.`id`, c.`nome`, c.`empresa`, c.`score`, c.`nps`
    ORDER BY c.`score` DESC, total_entregas DESC;
END //
DELIMITER ;

-- 4.4. Procedure para atualizar métricas dos clientes
DELIMITER //
CREATE PROCEDURE `sp_atualizar_metricas_clientes`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cliente_id INT;
    DECLARE cliente_cursor CURSOR FOR SELECT `id` FROM `clientes` WHERE `status` = 'ativo';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cliente_cursor;
    
    read_loop: LOOP
        FETCH cliente_cursor INTO cliente_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL `sp_calcular_score_cliente`(cliente_id);
    END LOOP;
    
    CLOSE cliente_cursor;
    
    SELECT 'Métricas atualizadas com sucesso' as resultado;
END //
DELIMITER ;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- 5.1. Trigger para atualizar score quando entrega é concluída
DELIMITER //
CREATE TRIGGER `tr_entrega_concluida_score`
AFTER UPDATE ON `entregas`
FOR EACH ROW
BEGIN
    IF NEW.`status` = 'entregue' AND OLD.`status` != 'entregue' THEN
        CALL `sp_calcular_score_cliente`(NEW.`cliente_id`);
    END IF;
END //
DELIMITER ;

-- 5.2. Trigger para atualizar progresso quando checkpoint é concluído
DELIMITER //
CREATE TRIGGER `tr_checkpoint_concluido_progresso`
AFTER UPDATE ON `checkpoints`
FOR EACH ROW
BEGIN
    IF NEW.`status` = 'concluido' AND OLD.`status` != 'concluido' THEN
        CALL `sp_calcular_progresso_jornada`(NEW.`jornada_id`);
    END IF;
END //
DELIMITER ;

-- 5.3. Trigger para log de auditoria
DELIMITER //
CREATE TRIGGER `tr_log_auditoria_entregas`
AFTER UPDATE ON `entregas`
FOR EACH ROW
BEGIN
    IF NEW.`status` != OLD.`status` THEN
        INSERT INTO `logs_sistema` (`nivel`, `categoria`, `mensagem`, `contexto`)
        VALUES ('info', 'entrega', 'Status da entrega alterado', 
                JSON_OBJECT('entrega_id', NEW.`id`, 'status_anterior', OLD.`status`, 'status_novo', NEW.`status`));
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 6. DADOS INICIAIS DO SISTEMA
-- =====================================================

-- 6.1. Inserir usuário administrador padrão
INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo`, `ativo`) VALUES
('Administrador', 'admin@mittracking.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE);

-- 6.2. Inserir configurações padrão do sistema
INSERT INTO `configuracoes` (`chave`, `valor`, `tipo`, `descricao`, `categoria`) VALUES
('sistema_nome', 'MitTracking', 'string', 'Nome do sistema', 'geral'),
('sistema_versao', '1.0.0', 'string', 'Versão do sistema', 'geral'),
('sla_padrao_horas', '72', 'number', 'SLA padrão em horas', 'operacional'),
('nps_meta', '8', 'number', 'Meta de NPS', 'qualidade'),
('score_meta', '85', 'number', 'Meta de score dos clientes', 'qualidade'),
('atualizacao_automatica', 'true', 'boolean', 'Atualização automática do dashboard', 'sistema'),
('intervalo_atualizacao', '300', 'number', 'Intervalo de atualização em segundos', 'sistema'),
('notificacoes_email', 'true', 'boolean', 'Enviar notificações por email', 'notificacoes'),
('backup_automatico', 'true', 'boolean', 'Backup automático do banco', 'sistema'),
('manutencao_ativa', 'false', 'boolean', 'Sistema em manutenção', 'sistema');

-- 6.3. Inserir funcionário padrão
INSERT INTO `funcionarios` (`nome`, `email`, `telefone`, `cargo`, `departamento`, `ativo`, `data_admissao`) VALUES
('Operador Sistema', 'operador@mittracking.com', '(11) 99999-9999', 'Operador', 'Logística', TRUE, CURDATE());

-- =====================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Este arquivo contém a estrutura completa do banco de dados do sistema MitTracking
-- Inclui: 15 tabelas, índices otimizados, views úteis, procedures e triggers
-- Sistema desenvolvido para rastreamento logístico com dashboard dinâmico
-- Versão: 1.0.0
-- Data de criação: 2024

-- =====================================================
-- FIM DA ESTRUTURA DO BANCO DE DADOS
-- =====================================================
