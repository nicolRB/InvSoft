const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Simula backup criando um arquivo .txt com data e hora
function executarBackup() {
  const data = new Date().toISOString();
  const conteudo = `Backup realizado em: ${data}\n`;
  const destino = path.join(__dirname, 'backups');

  if (!fs.existsSync(destino)) {
    fs.mkdirSync(destino);
  }

  fs.writeFileSync(path.join(destino, `backup-${Date.now()}.txt`), conteudo);
  console.log('Backup feito com sucesso:', data);
}

// Agendamento: a cada 1 hora
cron.schedule('0 * * * *', executarBackup);

// Executa imediatamente ao iniciar
executarBackup();
