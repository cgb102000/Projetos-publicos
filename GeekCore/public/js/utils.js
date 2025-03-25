// Função para validar URLs
export function isValidUrl(url) {
  try {
    const regex = /^(https?:\/\/)/;
    return regex.test(url);
  } catch {
    return false;
  }
}

// Função para obter parâmetros da URL
export function getUrlParams() {
  return new URLSearchParams(window.location.search);
}
