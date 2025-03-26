const checkServerConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001');
    if (!response.ok) throw new Error('Servidor não está respondendo');
    console.log('Servidor conectado com sucesso');
  } catch (error) {
    console.error('Erro de conexão com o servidor:', error);
    alert('Erro de conexão com o servidor. Verifique se o servidor está rodando na porta 3001.');
  }
};

document.addEventListener('DOMContentLoaded', checkServerConnection);
