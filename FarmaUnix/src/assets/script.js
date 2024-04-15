let map;
let directionsService;
let directionsRenderer;
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 14
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

function calculateAndDisplayRoute() {
  const userAddress = document.getElementById('userAddress').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;

  directionsService.route({
    origin: userAddress,
    destination: deliveryAddress,
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
      displayDistance(response);
    } else {
      window.alert('Erro ao calcular a rota: ' + status);
    }
  });
}

function displayDistance(response) {
  const distanceElement = document.getElementById('distance');

  if (response.routes && response.routes.length > 0 && response.routes[0].legs) {
    const legs = response.routes[0].legs;
    let totalDistance = 0;

    for (let i = 0; i < legs.length; i++) {
      totalDistance += legs[i].distance.value;
    }

    const totalDistanceKm = (totalDistance / 1000).toFixed(2);

    distanceElement.innerHTML = `Distância Total: ${totalDistanceKm} km`;
    updateCartView(totalDistance); // Atualiza o carrinho após calcular a distância
  } else {
    distanceElement.innerHTML = 'Nenhuma informação de distância disponível.';
  }
}

function toggleCart() {
  const cart = document.querySelector('.cart');
  cart.style.display = (cart.style.display === 'none' || cart.style.display === '') ? 'block' : 'none';
}

function checkout() {
  const userAddress = document.getElementById('userAddress').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;

  // Criar mensagem para o WhatsApp com os dados da compra
  const message = `Olá, gostaria de realizar um pedido. \n Endereço da residência: ${userAddress}\nProdutos:\n${getCartItemsList()}\nTotal: R$${getTotalPrice().toFixed(2)}\nTaxa de Entrega: R$${calculateDeliveryFee().toFixed(2)}`;

  // Gerar link para o WhatsApp com a mensagem
  const whatsappLink = `https://wa.me/17992255791?text=${encodeURIComponent(message)}`;

  // Redirecionar para o WhatsApp
  window.location.href = whatsappLink;
}

function getCartItemsList() {
  return cartItems.map(item => `${item.productName} - R$${item.price.toFixed(2)}`).join('\n');
}

function getTotalPrice() {
  return cartItems.reduce((total, item) => total + item.price, 0);
}

function clearCart() {
  localStorage.removeItem('cartItems');
  cartItems = [];
  updateCartView(0); // Atualiza o carrinho após limpar
}

function calculateDeliveryFee(distance) {
  // Lógica para calcular a taxa de entrega com base na distância
  if (!distance) {
    distance = 0;
  }

  if (distance <= 5000) { // Até 5 km
    return 10.0;
  } else if (distance > 5000 && distance <= 10000) { // Mais de 5 km e até 10 km
    return 15.0;
  } else if (distance > 10000 && distance <= 15000) { // Mais de 10 km e até 15 km
    return 20.0;
  } else {
    return -1.0; // Mais de 15 km (não entregamos)
  }
}

function updateCartView(distance) {
  const cartItemsElement = document.getElementById('cart-items');
  const totalPriceElement = document.getElementById('total-price');
  const deliveryFeeElement = document.getElementById('delivery-fee');
  cartItemsElement.innerHTML = '';
  let total = 0;

  cartItems.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `<p>${item.productName} - R$${item.price.toFixed(2)}</p>`;
    cartItemsElement.appendChild(cartItem);

    total += item.price;
  });

  const deliveryFee = calculateDeliveryFee(distance);
  const totalWithDelivery = total + deliveryFee;

  totalPriceElement.innerHTML = `Total: R$${total.toFixed(2)}`;
  if (deliveryFee > 0) {
    deliveryFeeElement.innerHTML = `Taxa de Entrega: R$${deliveryFee.toFixed(2)}`;
  } else {
    deliveryFeeElement.innerHTML = 'Não entregamos nesta distância.';
  }
}

function addToCart(productName, price, quantity) {
  const cartItem = {
    productName: productName,
    price: price * quantity,
    quantity: quantity
  };

  cartItems.push(cartItem);
  localStorage.setItem('cartItems', JSON.stringify(cartItems));

  // Adiciona o produto ao carrinho e atualiza a visualização do carrinho
  updateCartView(0); // Atualiza o carrinho sem considerar a distância (passa 0 como distância)
}

// Adicione esta chamada após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function () {
  initMap();
});



