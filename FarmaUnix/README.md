# Farma Unix

Farmácia online de demonstração (projeto de estudo).

🌐 [Acessar](https://cgb102000.github.io/Projetos-publicos/FarmaUnix/src/)

## Funcionalidades

- Vitrine de produtos com busca
- Carrinho com quantidade por item, salvo no navegador
- Cálculo da distância e da taxa de entrega a partir do endereço do cliente
  - até 5 km: R$ 10 · até 10 km: R$ 15 · até 15 km: R$ 20 · acima disso não entrega
- Mapa com a rota até o cliente
- Envio do pedido pelo WhatsApp com itens, entrega e total

## Tecnologias

HTML, CSS e JavaScript puro. Mapa com [Leaflet](https://leafletjs.com) e OpenStreetMap, busca de endereço pelo Nominatim e rota pelo OSRM. Nenhum desses serviços precisa de chave de API.

## Configuração

No início de `src/assets/script.js`:

- `ENDERECO_LOJA` e `COORDENADAS_LOJA`: endereço e posição da loja
- `WHATSAPP`: número que recebe os pedidos (DDD + número)
- `PRODUTOS`: lista de produtos e preços
- `TAXAS`: faixas de distância e valor da entrega
