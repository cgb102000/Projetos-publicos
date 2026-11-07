// O Node 25+ removeu buffer.SlowBuffer, que a dependência buffer-equal-constant-time
// (usada pelo jsonwebtoken) ainda lê ao carregar. Sem isto a API não inicia no Node novo.
// Precisa ser importado antes de qualquer módulo que use jsonwebtoken.
const buffer = require('buffer');

if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
