<?php
/**
 * Setup Automático do Dashboard - Sistema MitTracking
 * Este arquivo executa a configuração automática do dashboard
 */

// Configurações
$config = [
    'database' => [
        'host' => 'localhost',
        'user' => 'root',
        'pass' => '',
        'name' => 'mit'
    ],
    'files' => [
        'banco_mit.sql',
        'dados_exemplo.sql'
    ]
];

echo "<h1>🚀 Setup Automático do Dashboard MitTracking</h1>";

// Função para executar SQL
function executeSQL($sql, $config) {
    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};charset=utf8mb4",
            $config['user'],
            $config['pass'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Dividir o SQL em comandos individuais
        $commands = explode(';', $sql);
        
        foreach ($commands as $command) {
            $command = trim($command);
            if (!empty($command)) {
                $pdo->exec($command);
            }
        }
        
        return true;
    } catch (PDOException $e) {
        echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
        return false;
    }
}

// Função para ler arquivo SQL
function readSQLFile($filename) {
    if (!file_exists($filename)) {
        echo "<p style='color: red;'>❌ Arquivo não encontrado: $filename</p>";
        return false;
    }
    
    $content = file_get_contents($filename);
    if ($content === false) {
        echo "<p style='color: red;'>❌ Erro ao ler arquivo: $filename</p>";
        return false;
    }
    
    return $content;
}

// Verificar se os arquivos existem
echo "<h2>📁 Verificando Arquivos</h2>";
$filesExist = true;
foreach ($config['files'] as $file) {
    if (file_exists($file)) {
        echo "<p style='color: green;'>✅ $file encontrado</p>";
    } else {
        echo "<p style='color: red;'>❌ $file não encontrado</p>";
        $filesExist = false;
    }
}

if (!$filesExist) {
    echo "<p style='color: red;'><strong>❌ Alguns arquivos não foram encontrados. Verifique se todos os arquivos SQL estão na pasta api/</strong></p>";
    exit;
}

// Testar conexão com banco
echo "<h2>🔌 Testando Conexão com Banco</h2>";
try {
    $pdo = new PDO(
        "mysql:host={$config['database']['host']};charset=utf8mb4",
        $config['database']['user'],
        $config['database']['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "<p style='color: green;'>✅ Conexão com MySQL estabelecida</p>";
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Erro de conexão: " . $e->getMessage() . "</p>";
    echo "<p><strong>Verifique se o WAMP/XAMPP está rodando e as credenciais estão corretas.</strong></p>";
    exit;
}

// Executar script de estrutura do banco
echo "<h2>🏗️ Criando Estrutura do Banco</h2>";
$bancoSQL = readSQLFile($config['files'][0]);
if ($bancoSQL) {
    if (executeSQL($bancoSQL, $config['database'])) {
        echo "<p style='color: green;'>✅ Estrutura do banco criada com sucesso</p>";
    } else {
        echo "<p style='color: red;'>❌ Erro ao criar estrutura do banco</p>";
        exit;
    }
}

// Executar script de dados de exemplo
echo "<h2>📊 Inserindo Dados de Exemplo</h2>";
$dadosSQL = readSQLFile($config['files'][1]);
if ($dadosSQL) {
    if (executeSQL($dadosSQL, $config['database'])) {
        echo "<p style='color: green;'>✅ Dados de exemplo inseridos com sucesso</p>";
    } else {
        echo "<p style='color: red;'>❌ Erro ao inserir dados de exemplo</p>";
        exit;
    }
}

// Testar API do dashboard
echo "<h2>🧪 Testando API do Dashboard</h2>";
$apiUrl = 'http://localhost/MIT/api/dashboard_api.php?endpoint=dashboard_summary';
$response = @file_get_contents($apiUrl);

if ($response !== false) {
    $data = json_decode($response, true);
    if ($data && !isset($data['error'])) {
        echo "<p style='color: green;'>✅ API do dashboard funcionando</p>";
        echo "<p><strong>Dados encontrados:</strong></p>";
        echo "<ul>";
        foreach ($data as $key => $value) {
            echo "<li><strong>$key:</strong> $value</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color: red;'>❌ Erro na API: " . ($data['error'] ?? 'Resposta inválida') . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Não foi possível acessar a API do dashboard</p>";
    echo "<p><strong>Verifique se o servidor web está rodando e acesse:</strong></p>";
    echo "<p><a href='$apiUrl' target='_blank'>$apiUrl</a></p>";
}

// Verificar se o React está rodando
echo "<h2>⚛️ Verificando Frontend React</h2>";
$reactUrl = 'http://localhost:8081/';
$reactResponse = @get_headers($reactUrl);

if ($reactResponse && strpos($reactResponse[0], '200') !== false) {
    echo "<p style='color: green;'>✅ Frontend React está rodando</p>";
    echo "<p><strong>Dashboard disponível em:</strong> <a href='$reactUrl' target='_blank'>$reactUrl</a></p>";
} else {
    echo "<p style='color: orange;'>⚠️ Frontend React não está rodando</p>";
    echo "<p><strong>Para iniciar o frontend, execute:</strong></p>";
    echo "<code>npm run dev</code>";
}

// Resumo final
echo "<h2>🎉 Setup Concluído!</h2>";
echo "<div style='background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
echo "<h3>📋 Próximos Passos:</h3>";
echo "<ol>";
echo "<li><strong>Iniciar o Frontend React:</strong> <code>npm run dev</code></li>";
echo "<li><strong>Acessar o Dashboard:</strong> <a href='http://localhost:8081/' target='_blank'>http://localhost:8081/</a></li>";
echo "<li><strong>Testar a API:</strong> <a href='http://localhost/MIT/api/dashboard_api.php?endpoint=kpis' target='_blank'>http://localhost/MIT/api/dashboard_api.php?endpoint=kpis</a></li>";
echo "<li><strong>Verificar Banco:</strong> <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
echo "</ol>";
echo "</div>";

echo "<h3>🔗 Links Úteis:</h3>";
echo "<ul>";
echo "<li><a href='http://localhost:8081/' target='_blank'>Dashboard Frontend</a></li>";
echo "<li><a href='http://localhost/MIT/api/dashboard_api.php?endpoint=dashboard_summary' target='_blank'>API Summary</a></li>";
echo "<li><a href='http://localhost/MIT/api/dashboard_api.php?endpoint=kpis' target='_blank'>API KPIs</a></li>";
echo "<li><a href='http://localhost/phpmyadmin' target='_blank'>phpMyAdmin</a></li>";
echo "</ul>";

echo "<h3>📚 Documentação:</h3>";
echo "<p>Consulte o arquivo <code>README_DASHBOARD.md</code> para mais informações sobre o sistema.</p>";

echo "<hr>";
echo "<p><em>Setup executado em: " . date('d/m/Y H:i:s') . "</em></p>";
?>
