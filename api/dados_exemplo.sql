-- =====================================================
-- DADOS DE EXEMPLO PARA DASHBOARD - SISTEMA MITTRACKING
-- =====================================================
-- Este arquivo contém dados de exemplo para popular
-- o banco e testar o dashboard
-- =====================================================

USE `mit`;

-- =====================================================
-- 1. DADOS DE EXEMPLO - USUÁRIOS
-- =====================================================

-- Inserir usuários de exemplo
INSERT INTO `usuarios` (`nome`, `email`, `senha`, `perfil`, `status`) VALUES
('João Silva', 'joao@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Maria Santos', 'maria@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Carlos Lima', 'carlos@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Ana Costa', 'ana@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Pedro Oliveira', 'pedro@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'funcionario', 'ativo'),
('Lucia Ferreira', 'lucia@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'funcionario', 'ativo');

-- =====================================================
-- 2. DADOS DE EXEMPLO - CLIENTES
-- =====================================================

INSERT INTO `clientes` (`usuario_id`, `empresa`, `cnpj`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `score`, `status`, `total_embarques`, `engajamento_chat`, `nps`, `ultima_atividade`) VALUES
(2, 'Tech Corp Ltda', '12.345.678/0001-90', '(11) 99999-9999', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 92.5, 'ativo', 45, 78, 9, NOW()),
(3, 'Global Logistics S.A', '23.456.789/0001-80', '(21) 88888-8888', 'Rua das Flores, 500', 'Rio de Janeiro', 'RJ', '20000-000', 87.2, 'ativo', 32, 65, 8, NOW()),
(4, 'Import Express Ltda', '34.567.890/0001-70', '(31) 77777-7777', 'Av. Afonso Pena, 2000', 'Belo Horizonte', 'MG', '30130-000', 75.8, 'ativo', 18, 45, 7, NOW()),
(5, 'Export Solutions Ltd', '45.678.901/0001-60', '(81) 66666-6666', 'Rua da Aurora, 300', 'Recife', 'PE', '50000-000', 88.9, 'ativo', 28, 72, 9, NOW());

-- =====================================================
-- 3. DADOS DE EXEMPLO - FUNCIONÁRIOS
-- =====================================================

INSERT INTO `funcionarios` (`usuario_id`, `cargo`, `departamento`, `matricula`, `telefone`, `endereco`, `data_admissao`, `status`) VALUES
(6, 'Analista de Logística', 'Operações', 'FUNC001', '(11) 55555-5555', 'Rua das Palmeiras, 100', '2023-01-15', 'ativo'),
(7, 'Gerente de Operações', 'Operações', 'FUNC002', '(11) 44444-4444', 'Av. das Nações, 200', '2022-06-01', 'ativo');

-- =====================================================
-- 4. DADOS DE EXEMPLO - TRANSPORTADORAS
-- =====================================================

INSERT INTO `transportadoras` (`nome`, `cnpj`, `razao_social`, `email`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `status`, `score`) VALUES
('Express Log Transportes', '56.789.012/0001-50', 'Express Log Transportes Ltda', 'contato@expresslog.com', '(11) 33333-3333', 'Rua dos Transportes, 1000', 'São Paulo', 'SP', '01000-000', 'ativo', 95.2),
('Rápido Trans Ltda', '67.890.123/0001-40', 'Rápido Trans Logística Ltda', 'contato@rapidotrans.com', '(21) 22222-2222', 'Av. dos Caminhões, 500', 'Rio de Janeiro', 'RJ', '20000-000', 'ativo', 88.7),
('Norte Log Express', '78.901.234/0001-30', 'Norte Log Express Ltda', 'contato@nortelog.com', '(81) 11111-1111', 'Rua das Cargas, 300', 'Recife', 'PE', '50000-000', 'ativo', 91.5);

-- =====================================================
-- 5. DADOS DE EXEMPLO - MOTORISTAS
-- =====================================================

INSERT INTO `motoristas` (`nome`, `cpf`, `cnh`, `categoria_cnh`, `validade_cnh`, `telefone`, `email`, `endereco`, `transportadora_id`, `status`) VALUES
('Carlos Santos', '123.456.789-00', '12345678901', 'C', '2025-12-31', '(11) 99999-1111', 'carlos@expresslog.com', 'Rua dos Motoristas, 100', 1, 'ativo'),
('Pedro Oliveira', '234.567.890-11', '23456789012', 'C', '2025-06-30', '(21) 88888-2222', 'pedro@rapidotrans.com', 'Av. dos Condutores, 200', 2, 'ativo'),
('José Lima', '345.678.901-22', '34567890123', 'C', '2025-03-15', '(81) 77777-3333', 'jose@nortelog.com', 'Rua dos Caminhoneiros, 300', 3, 'ativo');

-- =====================================================
-- 6. DADOS DE EXEMPLO - VEÍCULOS
-- =====================================================

INSERT INTO `veiculos` (`placa`, `modelo`, `marca`, `ano`, `cor`, `tipo`, `capacidade`, `transportadora_id`, `motorista_id`, `status`) VALUES
('ABC-1234', 'Volvo FH 540', 'Volvo', 2022, 'Branco', 'caminhao', 25000.00, 1, 1, 'ativo'),
('XYZ-5678', 'Mercedes Actros', 'Mercedes', 2021, 'Azul', 'caminhao', 20000.00, 2, 2, 'ativo'),
('DEF-9012', 'Scania R500', 'Scania', 2023, 'Vermelho', 'caminhao', 30000.00, 3, 3, 'ativo');

-- =====================================================
-- 7. DADOS DE EXEMPLO - JORNADAS
-- =====================================================

INSERT INTO `jornadas` (`codigo`, `cliente_id`, `transportadora_id`, `motorista_id`, `veiculo_id`, `origem`, `destino`, `origem_lat`, `origem_lng`, `destino_lat`, `destino_lng`, `status`, `progresso`, `data_inicio`, `data_estimada`, `data_conclusao`, `observacoes`) VALUES
('JOR-001', 1, 1, 1, 1, 'São Paulo/SP', 'Rio de Janeiro/RJ', -23.5505, -46.6333, -22.9068, -43.1729, 'em_transito', 65.00, '2024-01-15 08:00:00', '2024-01-16 14:00:00', NULL, 'Carga especial - manuseio cuidadoso'),
('JOR-002', 2, 2, 2, 2, 'Rio de Janeiro/RJ', 'Belo Horizonte/MG', -22.9068, -43.1729, -19.9167, -43.9345, 'entregue', 100.00, '2024-01-14 10:00:00', '2024-01-15 16:00:00', '2024-01-15 15:30:00', 'Entrega realizada com sucesso'),
('JOR-003', 3, 3, 3, 3, 'Belo Horizonte/MG', 'Recife/PE', -19.9167, -43.9345, -8.0476, -34.8770, 'aguardando', 0.00, NULL, '2024-01-17 10:00:00', NULL, 'Aguardando documentação'),
('JOR-004', 4, 1, 1, 1, 'São Paulo/SP', 'Salvador/BA', -23.5505, -46.6333, -12.9714, -38.5014, 'atrasada', 45.00, '2024-01-13 07:00:00', '2024-01-14 17:00:00', NULL, 'Atraso devido a problemas na estrada'),
('JOR-005', 1, 2, 2, 2, 'São Paulo/SP', 'Brasília/DF', -23.5505, -46.6333, -15.7801, -47.9292, 'em_transito', 30.00, '2024-01-16 09:00:00', '2024-01-17 18:00:00', NULL, 'Carga em trânsito normal');

-- =====================================================
-- 8. DADOS DE EXEMPLO - CHECKPOINTS
-- =====================================================

-- Checkpoints para JOR-001
INSERT INTO `checkpoints` (`jornada_id`, `nome`, `descricao`, `ordem`, `status`, `data_estimada`, `data_realizada`, `lat`, `lng`, `observacoes`) VALUES
(1, 'Origem', 'Coleta na origem', 1, 'concluido', '2024-01-15 08:00:00', '2024-01-15 08:15:00', -23.5505, -46.6333, 'Coleta realizada com sucesso'),
(1, 'Porto Santos', 'Passagem pelo porto', 2, 'concluido', '2024-01-15 12:00:00', '2024-01-15 12:30:00', -23.9608, -46.3331, 'Passagem pelo porto concluída'),
(1, 'CD Rio', 'Centro de distribuição Rio', 3, 'atual', '2024-01-15 18:00:00', NULL, -22.9068, -43.1729, 'Em trânsito para o CD'),
(1, 'Entrega', 'Entrega final', 4, 'pendente', '2024-01-16 14:00:00', NULL, -22.9068, -43.1729, 'Aguardando chegada ao destino');

-- Checkpoints para JOR-002
INSERT INTO `checkpoints` (`jornada_id`, `nome`, `descricao`, `ordem`, `status`, `data_estimada`, `data_realizada`, `lat`, `lng`, `observacoes`) VALUES
(2, 'Origem', 'Coleta na origem', 1, 'concluido', '2024-01-14 10:00:00', '2024-01-14 10:20:00', -22.9068, -43.1729, 'Coleta realizada'),
(2, 'Hub Central', 'Hub de distribuição', 2, 'concluido', '2024-01-14 14:00:00', '2024-01-14 14:15:00', -20.3155, -40.3128, 'Passagem pelo hub'),
(2, 'CD Belo Horizonte', 'Centro de distribuição', 3, 'concluido', '2024-01-15 11:00:00', '2024-01-15 11:30:00', -19.9167, -43.9345, 'Chegada ao CD'),
(2, 'Entrega', 'Entrega final', 4, 'concluido', '2024-01-15 16:00:00', '2024-01-15 15:30:00', -19.9167, -43.9345, 'Entrega realizada com sucesso');

-- =====================================================
-- 9. DADOS DE EXEMPLO - ENTREGAS
-- =====================================================

INSERT INTO `entregas` (`codigo`, `jornada_id`, `cliente_id`, `destinatario`, `endereco_entrega`, `lat`, `lng`, `status`, `data_entrega_estimada`, `hora_estimada`, `data_entrega_real`, `valor`, `peso`, `volumes`, `observacoes`, `comprovante_foto`, `assinatura`) VALUES
('ENT-001', 1, 1, 'João Silva', 'Av. Paulista, 1000 - São Paulo/SP', -22.9068, -43.1729, 'em_transito', '2024-01-16', '14:00:00', NULL, 2500.00, 150.00, 3, 'Entrega especial', NULL, NULL),
('ENT-002', 2, 2, 'Maria Santos', 'Rua das Flores, 500 - Rio de Janeiro/RJ', -19.9167, -43.9345, 'entregue', '2024-01-15', '16:00:00', '2024-01-15 15:30:00', 1800.00, 85.00, 2, 'Entrega realizada', 'entrega-002.jpg', 'Maria Santos'),
('ENT-003', 3, 3, 'Ana Costa', 'Av. Afonso Pena, 2000 - Belo Horizonte/MG', -8.0476, -34.8770, 'aguardando', '2024-01-17', '10:00:00', NULL, 3200.00, 220.00, 5, 'Aguardando documentação', NULL, NULL),
('ENT-004', 4, 4, 'Pedro Oliveira', 'Rua da Aurora, 300 - Recife/PE', -12.9714, -38.5014, 'atrasada', '2024-01-14', '17:00:00', NULL, 2100.00, 120.00, 2, 'Atraso devido a problemas na estrada', NULL, NULL),
('ENT-005', 5, 1, 'Carlos Lima', 'Esplanada dos Ministérios, 100 - Brasília/DF', -15.7801, -47.9292, 'em_transito', '2024-01-17', '18:00:00', NULL, 1900.00, 95.00, 1, 'Carga em trânsito', NULL, NULL);

-- =====================================================
-- 10. DADOS DE EXEMPLO - DOCUMENTOS
-- =====================================================

INSERT INTO `documentos` (`codigo`, `numero`, `tipo`, `jornada_id`, `cliente_id`, `origem`, `destino`, `data_emissao`, `data_upload`, `status`, `arquivo_path`, `tamanho`, `versao`, `upload_por`, `origem_upload`, `visualizacoes`, `ultima_visualizacao`, `observacoes`) VALUES
('DOC-001', 'CTE-2024-001234', 'CT-e', 1, 1, 'São Paulo/SP', 'Rio de Janeiro/RJ', '2024-01-15 06:00:00', '2024-01-15 08:00:00', 'validado', '/uploads/cte-001234.pdf', 2560000, 1, 'Sistema IA', 'chat', 12, '2024-01-15 10:30:00', 'CT-e validado automaticamente'),
('DOC-002', 'NF-2024-567890', 'NF-e', 2, 2, 'Rio de Janeiro/RJ', 'Belo Horizonte/MG', '2024-01-14 12:00:00', '2024-01-14 14:30:00', 'validado', '/uploads/nfe-567890.pdf', 1800000, 1, 'João Silva', 'manual', 5, '2024-01-14 16:45:00', 'NF-e validada'),
('DOC-003', 'AWL-2024-789012', 'AWB', 3, 3, 'Belo Horizonte/MG', 'Recife/PE', '2024-01-13 07:00:00', '2024-01-13 09:15:00', 'pendente', '/uploads/awl-789012.pdf', 3200000, 1, 'API Integration', 'api', 8, '2024-01-13 11:20:00', 'Aguardando validação'),
('DOC-004', 'BL-2024-345678', 'BL', 4, 4, 'São Paulo/SP', 'Salvador/BA', '2024-01-12 16:00:00', '2024-01-12 18:00:00', 'validado', '/uploads/bl-345678.pdf', 2100000, 1, 'Sistema IA', 'chat', 6, '2024-01-12 20:30:00', 'BL validado'),
('DOC-005', 'CTE-2024-901234', 'CT-e', 5, 1, 'São Paulo/SP', 'Brasília/DF', '2024-01-16 08:00:00', '2024-01-16 09:00:00', 'em_analise', '/uploads/cte-901234.pdf', 1950000, 1, 'Maria Santos', 'manual', 3, '2024-01-16 11:15:00', 'Em análise pelo sistema');

-- =====================================================
-- 11. DADOS DE EXEMPLO - OCORRÊNCIAS
-- =====================================================

INSERT INTO `ocorrencias` (`tipo`, `descricao`, `jornada_id`, `entrega_id`, `criticidade`, `status`, `data_ocorrencia`, `data_resolucao`, `responsavel`, `acoes_tomadas`) VALUES
('atraso', 'Entrega ENT-004 com atraso de 2h devido a problemas na estrada', 4, 4, 'alta', 'aberta', '2024-01-14 19:00:00', NULL, 'Carlos Santos', 'Contato com cliente informando o atraso'),
('tempo_parado', 'Veículo ABC-1234 parado há 4h no CD Rio', 1, 1, 'alta', 'em_andamento', '2024-01-15 20:00:00', NULL, 'Pedro Oliveira', 'Verificação de problemas mecânicos'),
('falha', 'Sistema de rastreamento offline por 30 minutos', NULL, NULL, 'media', 'resolvida', '2024-01-15 14:00:00', '2024-01-15 14:30:00', 'Lucia Ferreira', 'Reinicialização do sistema de rastreamento'),
('acidente', 'Acidente leve na BR-116, veículo XYZ-5678', 2, 2, 'critica', 'resolvida', '2024-01-14 15:00:00', '2024-01-14 16:00:00', 'José Lima', 'Veículo encaminhado para oficina, carga transferida');

-- =====================================================
-- 12. DADOS DE EXEMPLO - CHAT MENSAGENS
-- =====================================================

INSERT INTO `chat_mensagens` (`cliente_id`, `usuario_id`, `mensagem`, `tipo`, `status`, `data_envio`, `data_leitura`, `arquivo_anexo`, `jornada_id`, `entrega_id`) VALUES
(1, NULL, 'Olá, gostaria de saber o status da minha entrega ENT-001', 'cliente', 'lida', '2024-01-15 10:00:00', '2024-01-15 10:05:00', NULL, 1, 1),
(1, 6, 'Olá! Sua entrega ENT-001 está em trânsito, com previsão de chegada para amanhã às 14h.', 'funcionario', 'lida', '2024-01-15 10:05:00', '2024-01-15 10:10:00', NULL, 1, 1),
(2, NULL, 'A entrega foi realizada com sucesso, obrigado!', 'cliente', 'lida', '2024-01-15 16:00:00', '2024-01-15 16:02:00', NULL, 2, 2),
(3, NULL, 'Quando será a coleta da minha carga?', 'cliente', 'enviada', '2024-01-16 09:00:00', NULL, NULL, 3, 3),
(4, NULL, 'Estou preocupado com o atraso da entrega', 'cliente', 'enviada', '2024-01-14 20:00:00', NULL, NULL, 4, 4);

-- =====================================================
-- 13. DADOS DE EXEMPLO - RELATÓRIOS
-- =====================================================

INSERT INTO `relatorios` (`tipo`, `nome`, `descricao`, `parametros`, `usuario_id`, `status`, `arquivo_gerado`, `data_solicitacao`, `data_conclusao`, `observacoes`) VALUES
('entregas', 'Relatório de Entregas - Janeiro 2024', 'Relatório mensal de entregas', '{"periodo": "2024-01", "cliente": "todos"}', 6, 'concluido', '/reports/entregas-jan-2024.pdf', '2024-01-16 08:00:00', '2024-01-16 08:15:00', 'Relatório gerado com sucesso'),
('jornadas', 'Relatório de Jornadas - Semana Atual', 'Relatório semanal de jornadas', '{"periodo": "2024-01-15", "tipo": "semanal"}', 7, 'processando', NULL, '2024-01-16 10:00:00', NULL, 'Processando dados...'),
('clientes', 'Relatório de Performance de Clientes', 'Análise de performance dos clientes', '{"periodo": "2024-01", "metricas": ["sla", "nps", "entregas"]}', 6, 'pendente', NULL, '2024-01-16 11:00:00', NULL, 'Aguardando processamento');

-- =====================================================
-- 14. ATUALIZAR MÉTRICAS DOS CLIENTES
-- =====================================================

-- Atualizar engajamento no chat
UPDATE `clientes` SET `engajamento_chat` = (
  SELECT COUNT(*) FROM `chat_mensagens` 
  WHERE `cliente_id` = `clientes`.`id` 
  AND `data_envio` >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- Atualizar última atividade
UPDATE `clientes` SET `ultima_atividade` = (
  SELECT MAX(`data_envio`) FROM `chat_mensagens` 
  WHERE `cliente_id` = `clientes`.`id`
);

-- =====================================================
-- 15. ATUALIZAR SCORES DAS TRANSPORTADORAS
-- =====================================================

UPDATE `transportadoras` SET `score` = (
  SELECT AVG(
    CASE 
      WHEN j.status = 'entregue' THEN 100
      WHEN j.status = 'em_transito' THEN 80
      WHEN j.status = 'atrasada' THEN 60
      ELSE 40
    END
  )
  FROM `jornadas` j 
  WHERE j.transportadora_id = `transportadoras`.`id`
  AND j.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- =====================================================
-- 16. INSERIR LOGS DO SISTEMA
-- =====================================================

INSERT INTO `logs_sistema` (`nivel`, `categoria`, `mensagem`, `dados`, `usuario_id`, `ip`) VALUES
('info', 'dashboard', 'Dados de exemplo inseridos com sucesso', '{"tabelas": ["usuarios", "clientes", "jornadas", "entregas"], "registros": 50}', 1, '127.0.0.1'),
('info', 'sistema', 'Sistema inicializado', '{"versao": "1.0.0", "ambiente": "desenvolvimento"}', 1, '127.0.0.1'),
('warning', 'operacao', 'Veículo ABC-1234 parado há mais de 2 horas', '{"veiculo": "ABC-1234", "jornada": "JOR-001", "tempo_parado": "4h"}', 6, '127.0.0.1');

-- =====================================================
-- DADOS ADICIONAIS PARA CLIENTES E RELATÓRIOS
-- =====================================================

-- Inserir mais clientes para testes
INSERT INTO `usuarios` (`nome`, `email`, `senha`, `perfil`, `status`) VALUES
('Roberto Alves', 'roberto@empresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Fernanda Costa', 'fernanda@logistica.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Marcos Silva', 'marcos@transportes.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Patricia Lima', 'patricia@comercio.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo'),
('Ricardo Santos', 'ricardo@industria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'ativo');

INSERT INTO `clientes` (`usuario_id`, `empresa`, `cnpj`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `score`, `status`, `total_embarques`, `engajamento_chat`, `nps`, `ultima_atividade`) VALUES
(8, 'Empresa ABC Ltda', '56.789.012/0001-50', '(11) 55555-5555', 'Rua das Empresas, 100', 'São Paulo', 'SP', '01000-000', 88.5, 'ativo', 25, 65, 8, NOW()),
(9, 'Logística Global S.A', '67.890.123/0001-40', '(21) 44444-4444', 'Av. dos Negócios, 200', 'Rio de Janeiro', 'RJ', '20000-000', 82.3, 'ativo', 18, 55, 7, NOW()),
(10, 'Transportes Rápido', '78.901.234/0001-30', '(31) 33333-3333', 'Rua da Velocidade, 300', 'Belo Horizonte', 'MG', '30000-000', 91.2, 'ativo', 35, 85, 9, NOW()),
(11, 'Comércio Express', '89.012.345/0001-20', '(81) 22222-2222', 'Av. do Comércio, 400', 'Recife', 'PE', '50000-000', 76.8, 'ativo', 12, 40, 6, NOW()),
(12, 'Indústria Moderna', '90.123.456/0001-10', '(51) 11111-1111', 'Rua Industrial, 500', 'Porto Alegre', 'RS', '90000-000', 89.7, 'ativo', 28, 70, 8, NOW());

-- Inserir mais transportadoras
INSERT INTO `transportadoras` (`nome`, `cnpj`, `razao_social`, `email`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `status`, `score`) VALUES
('Logística Nacional', '12.345.678/0001-90', 'Logística Nacional Ltda', 'contato@logisticanacional.com', '(11) 99999-0000', 'Rua da Logística, 1000', 'São Paulo', 'SP', '01000-000', 'ativo', 88.5),
('Transporte Sul', '23.456.789/0001-80', 'Transporte Sul Ltda', 'contato@transportesul.com', '(51) 88888-0000', 'Av. do Sul, 2000', 'Porto Alegre', 'RS', '90000-000', 'ativo', 85.2),
('Cargas Rápidas', '34.567.890/0001-70', 'Cargas Rápidas Ltda', 'contato@cargasrapidas.com', '(21) 77777-0000', 'Rua das Cargas, 3000', 'Rio de Janeiro', 'RJ', '20000-000', 'ativo', 92.1);

-- Inserir mais motoristas
INSERT INTO `motoristas` (`nome`, `cpf`, `cnh`, `categoria_cnh`, `validade_cnh`, `telefone`, `email`, `endereco`, `transportadora_id`, `status`) VALUES
('Roberto Silva', '456.789.012-34', '45678901234', 'C', '2025-08-15', '(11) 99999-0001', 'roberto@logisticanacional.com', 'Rua dos Motoristas, 200', 4, 'ativo'),
('Carlos Oliveira', '567.890.123-45', '56789012345', 'C', '2025-09-20', '(51) 88888-0001', 'carlos@transportesul.com', 'Av. dos Condutores, 300', 5, 'ativo'),
('Paulo Santos', '678.901.234-56', '67890123456', 'C', '2025-10-10', '(21) 77777-0001', 'paulo@cargasrapidas.com', 'Rua dos Caminhoneiros, 400', 6, 'ativo');

-- Inserir mais veículos
INSERT INTO `veiculos` (`placa`, `modelo`, `marca`, `ano`, `cor`, `tipo`, `capacidade`, `transportadora_id`, `motorista_id`, `status`) VALUES
('GHI-5678', 'Iveco Tector', 'Iveco', 2021, 'Branco', 'caminhao', 18000.00, 4, 4, 'ativo'),
('JKL-9012', 'Volkswagen Constellation', 'Volkswagen', 2022, 'Azul', 'caminhao', 22000.00, 5, 5, 'ativo'),
('MNO-3456', 'Ford Cargo', 'Ford', 2023, 'Vermelho', 'caminhao', 16000.00, 6, 6, 'ativo');

-- Inserir mais jornadas para relatórios
INSERT INTO `jornadas` (`codigo`, `cliente_id`, `transportadora_id`, `motorista_id`, `veiculo_id`, `origem`, `destino`, `origem_lat`, `origem_lng`, `destino_lat`, `destino_lng`, `status`, `progresso`, `data_inicio`, `data_estimada`, `data_conclusao`, `observacoes`) VALUES
('JOR-006', 5, 4, 4, 4, 'São Paulo/SP', 'Curitiba/PR', -23.5505, -46.6333, -25.4244, -49.2654, 'entregue', 100.00, '2024-01-10 08:00:00', '2024-01-11 16:00:00', '2024-01-11 15:30:00', 'Entrega realizada com sucesso'),
('JOR-007', 6, 5, 5, 5, 'Porto Alegre/RS', 'Florianópolis/SC', -30.0346, -51.2177, -27.5954, -48.5480, 'em_transito', 75.00, '2024-01-12 09:00:00', '2024-01-13 18:00:00', NULL, 'Em trânsito normal'),
('JOR-008', 7, 6, 6, 6, 'Rio de Janeiro/RJ', 'Vitória/ES', -22.9068, -43.1729, -20.3155, -40.3128, 'entregue', 100.00, '2024-01-08 07:00:00', '2024-01-09 14:00:00', '2024-01-09 13:45:00', 'Entrega antecipada'),
('JOR-009', 8, 1, 1, 1, 'São Paulo/SP', 'Goiânia/GO', -23.5505, -46.6333, -16.6864, -49.2643, 'aguardando', 0.00, NULL, '2024-01-18 10:00:00', NULL, 'Aguardando documentação'),
('JOR-010', 9, 2, 2, 2, 'Rio de Janeiro/RJ', 'Brasília/DF', -22.9068, -43.1729, -15.7801, -47.9292, 'atrasada', 60.00, '2024-01-11 06:00:00', '2024-01-12 20:00:00', NULL, 'Atraso devido a problemas na estrada');

-- Inserir mais entregas
INSERT INTO `entregas` (`codigo`, `jornada_id`, `cliente_id`, `destinatario`, `endereco_entrega`, `lat`, `lng`, `status`, `data_entrega_estimada`, `hora_estimada`, `data_entrega_real`, `valor`, `peso`, `volumes`, `observacoes`, `comprovante_foto`, `assinatura`) VALUES
('ENT-006', 6, 5, 'Roberto Alves', 'Rua das Empresas, 100 - Curitiba/PR', -25.4244, -49.2654, 'entregue', '2024-01-11', '16:00:00', '2024-01-11 15:30:00', 3200.00, 180.00, 4, 'Entrega realizada', 'entrega-006.jpg', 'Roberto Alves'),
('ENT-007', 7, 6, 'Fernanda Costa', 'Av. dos Negócios, 200 - Florianópolis/SC', -27.5954, -48.5480, 'em_transito', '2024-01-13', '18:00:00', NULL, 2800.00, 160.00, 3, 'Em trânsito', NULL, NULL),
('ENT-008', 8, 7, 'Marcos Silva', 'Rua da Velocidade, 300 - Vitória/ES', -20.3155, -40.3128, 'entregue', '2024-01-09', '14:00:00', '2024-01-09 13:45:00', 2100.00, 120.00, 2, 'Entrega antecipada', 'entrega-008.jpg', 'Marcos Silva'),
('ENT-009', 9, 8, 'Patricia Lima', 'Av. do Comércio, 400 - Goiânia/GO', -16.6864, -49.2643, 'aguardando', '2024-01-18', '10:00:00', NULL, 1900.00, 95.00, 1, 'Aguardando documentação', NULL, NULL),
('ENT-010', 10, 9, 'Ricardo Santos', 'Rua Industrial, 500 - Brasília/DF', -15.7801, -47.9292, 'atrasada', '2024-01-12', '20:00:00', NULL, 2500.00, 140.00, 3, 'Atraso devido a problemas na estrada', NULL, NULL);

-- Inserir mais documentos
INSERT INTO `documentos` (`codigo`, `numero`, `tipo`, `jornada_id`, `cliente_id`, `origem`, `destino`, `data_emissao`, `data_upload`, `status`, `arquivo_path`, `tamanho`, `versao`, `upload_por`, `origem_upload`, `visualizacoes`, `ultima_visualizacao`, `observacoes`) VALUES
('DOC-006', 'CTE-2024-006789', 'CT-e', 6, 5, 'São Paulo/SP', 'Curitiba/PR', '2024-01-10 06:00:00', '2024-01-10 08:00:00', 'validado', '/uploads/cte-006789.pdf', 2100000, 1, 'Sistema IA', 'chat', 8, '2024-01-10 10:30:00', 'CT-e validado'),
('DOC-007', 'NF-2024-789012', 'NF-e', 7, 6, 'Porto Alegre/RS', 'Florianópolis/SC', '2024-01-12 12:00:00', '2024-01-12 14:30:00', 'pendente', '/uploads/nfe-789012.pdf', 1950000, 1, 'Fernanda Costa', 'manual', 3, '2024-01-12 16:45:00', 'Aguardando validação'),
('DOC-008', 'BL-2024-456789', 'BL', 8, 7, 'Rio de Janeiro/RJ', 'Vitória/ES', '2024-01-08 16:00:00', '2024-01-08 18:00:00', 'validado', '/uploads/bl-456789.pdf', 1800000, 1, 'Sistema IA', 'chat', 5, '2024-01-08 20:30:00', 'BL validado'),
('DOC-009', 'CTE-2024-123456', 'CT-e', 9, 8, 'São Paulo/SP', 'Goiânia/GO', '2024-01-17 08:00:00', '2024-01-17 09:00:00', 'em_analise', '/uploads/cte-123456.pdf', 2200000, 1, 'Patricia Lima', 'manual', 2, '2024-01-17 11:15:00', 'Em análise'),
('DOC-010', 'AWB-2024-987654', 'AWB', 10, 9, 'Rio de Janeiro/RJ', 'Brasília/DF', '2024-01-11 14:00:00', '2024-01-11 16:00:00', 'validado', '/uploads/awb-987654.pdf', 1650000, 1, 'API Integration', 'api', 4, '2024-01-11 18:20:00', 'AWB validado');

-- Inserir mais ocorrências
INSERT INTO `ocorrencias` (`tipo`, `descricao`, `jornada_id`, `entrega_id`, `criticidade`, `status`, `data_ocorrencia`, `data_resolucao`, `responsavel`, `acoes_tomadas`) VALUES
('atraso', 'Entrega ENT-010 com atraso de 3h devido a problemas na estrada', 10, 10, 'alta', 'aberta', '2024-01-12 23:00:00', NULL, 'Paulo Santos', 'Contato com cliente informando o atraso'),
('falha', 'Sistema de rastreamento offline por 1 hora', NULL, NULL, 'media', 'resolvida', '2024-01-13 10:00:00', '2024-01-13 11:00:00', 'Lucia Ferreira', 'Reinicialização do sistema'),
('tempo_parado', 'Veículo GHI-5678 parado há 2h no CD Curitiba', 6, 6, 'baixa', 'resolvida', '2024-01-11 14:00:00', '2024-01-11 16:00:00', 'Roberto Silva', 'Problema mecânico resolvido'),
('acidente', 'Acidente leve na BR-101, veículo JKL-9012', 7, 7, 'critica', 'em_andamento', '2024-01-13 15:00:00', NULL, 'Carlos Oliveira', 'Veículo encaminhado para oficina');

-- Inserir mais mensagens de chat
INSERT INTO `chat_mensagens` (`cliente_id`, `usuario_id`, `mensagem`, `tipo`, `status`, `data_envio`, `data_leitura`, `arquivo_anexo`, `jornada_id`, `entrega_id`) VALUES
(5, NULL, 'Preciso de informações sobre a entrega ENT-006', 'cliente', 'lida', '2024-01-11 10:00:00', '2024-01-11 10:05:00', NULL, 6, 6),
(5, 6, 'Sua entrega ENT-006 está em trânsito, previsão de chegada para hoje às 16h.', 'funcionario', 'lida', '2024-01-11 10:05:00', '2024-01-11 10:10:00', NULL, 6, 6),
(6, NULL, 'A entrega foi realizada com sucesso, obrigado!', 'cliente', 'lida', '2024-01-11 16:00:00', '2024-01-11 16:02:00', NULL, 6, 6),
(7, NULL, 'Quando será a coleta da minha carga?', 'cliente', 'enviada', '2024-01-12 09:00:00', NULL, NULL, 7, 7),
(8, NULL, 'Estou preocupado com o atraso da entrega', 'cliente', 'enviada', '2024-01-12 20:00:00', NULL, NULL, 10, 10),
(9, NULL, 'Preciso de ajuda com a documentação', 'cliente', 'enviada', '2024-01-17 11:00:00', NULL, NULL, 9, 9);

-- Inserir mais relatórios
INSERT INTO `relatorios` (`tipo`, `nome`, `descricao`, `parametros`, `usuario_id`, `status`, `arquivo_gerado`, `data_solicitacao`, `data_conclusao`, `observacoes`) VALUES
('clientes', 'Relatório de Performance de Clientes - Janeiro 2024', 'Análise de performance dos clientes', '{"periodo": "2024-01", "metricas": ["sla", "nps", "entregas"]}', 6, 'concluido', '/reports/clientes-jan-2024.pdf', '2024-01-16 12:00:00', '2024-01-16 12:15:00', 'Relatório gerado com sucesso'),
('financeiro', 'Relatório Financeiro - Q1 2024', 'Análise financeira do primeiro trimestre', '{"periodo": "2024-Q1", "metricas": ["receita", "custos", "margem"]}', 7, 'processando', NULL, '2024-01-16 14:00:00', NULL, 'Processando dados financeiros...'),
('operacional', 'Relatório Operacional - Semana Atual', 'Análise operacional da semana', '{"periodo": "2024-01-15", "tipo": "semanal"}', 6, 'pendente', NULL, '2024-01-16 15:00:00', NULL, 'Aguardando processamento');

-- Atualizar métricas dos novos clientes
UPDATE `clientes` SET `engajamento_chat` = (
  SELECT COUNT(*) FROM `chat_mensagens` 
  WHERE `cliente_id` = `clientes`.`id` 
  AND `data_envio` >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);

UPDATE `clientes` SET `ultima_atividade` = (
  SELECT MAX(`data_envio`) FROM `chat_mensagens` 
  WHERE `cliente_id` = `clientes`.`id`
);

-- Atualizar scores das novas transportadoras
UPDATE `transportadoras` SET `score` = (
  SELECT AVG(
    CASE 
      WHEN j.status = 'entregue' THEN 100
      WHEN j.status = 'em_transito' THEN 80
      WHEN j.status = 'atrasada' THEN 60
      ELSE 40
    END
  )
  FROM `jornadas` j 
  WHERE j.transportadora_id = `transportadoras`.`id`
  AND j.data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- Inserir logs adicionais
INSERT INTO `logs_sistema` (`nivel`, `categoria`, `mensagem`, `dados`, `usuario_id`, `ip`) VALUES
('info', 'clientes', 'Novos clientes adicionados ao sistema', '{"quantidade": 5, "empresas": ["Empresa ABC", "Logística Global", "Transportes Rápido", "Comércio Express", "Indústria Moderna"]}', 1, '127.0.0.1'),
('info', 'relatorios', 'Relatório de performance gerado', '{"tipo": "clientes", "periodo": "2024-01", "arquivo": "clientes-jan-2024.pdf"}', 6, '127.0.0.1'),
('warning', 'operacao', 'Veículo JKL-9012 envolvido em acidente', '{"veiculo": "JKL-9012", "jornada": "JOR-007", "tipo": "acidente", "criticidade": "critica"}', 5, '127.0.0.1');

-- =====================================================
-- FIM DOS DADOS DE EXEMPLO
-- =====================================================

-- Para executar este script:
-- 1. Execute primeiro o script banco_mit.sql
-- 2. Execute este script para popular com dados de exemplo
-- 3. Acesse o dashboard para ver os dados
