<template>
    <header>
      <nav>
        <div class="nav-wrapper">
          <a href="App.vue" class="brand-logo center">
            <img :src="urlLogo" alt="Logo">
          </a>
          <!-- Ícone de menu para dispositivos móveis -->
          <a href="#" data-target="mobile-nav" class="sidenav-trigger right">
            <i class="material-icons">menu</i>
          </a>
          <ul id="nav-mobile" class="left hide-on-med-and-down">
            
            <li class="menu-cabecalho"><a href="#" id="inicio">Inicio</a></li>
            <li class="menu-cabecalho"><a href="#">Projetos</a></li>
            <li class="menu-cabecalho"><a href="#">Contato</a></li>
          </ul>
        </div>
      </nav>      
      <!-- Menu lateral para dispositivos móveis -->
      <ul id="mobile-nav" class="sidenav">
  
        <li class="mobile-nav-itens"><a href="inicio.html">Início</a></li>        
        <li class="mobile-nav-itens"><a href="projetos.html">Projetos</a></li>        
        <li class="mobile-nav-itens"><a href="contato.html">Contato</a></li>
      </ul>
      
      
    </header>
    
  </template>
  
  <script>

  export default {
    name: 'Cabecalho',
    data() {
      return {
        urlLogo: './imagens/giphy.gif',
      };
    },
    mounted() {
      // Inicializa o componente de navegação
      M.Sidenav.init(document.querySelectorAll('.sidenav'));
    },
  };
  </script>
  
  <style scoped>
  .nav-wrapper {
    background-color:black;
    color: white;
    backdrop-filter: blur(10px);
    height: 10vh;
    
    
   
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    
  }
  
  .brand-logo img {
    width: 10vh;
    
  }
  
  a {
    color: white;
    font-size:3vh;
  }
  a:hover{
    color: var(--verde-claro);
  }

.mobile-nav-itens{
    margin: 20%;
    

  }

header{
    margin-bottom: 10%;
    backdrop-filter: blur(10px);
    
    background-color: rgb(245, 7, 7);
   

}
#inicio{
    margin-left: 200px;
    
}
.menu-cabecalho{
  font-size: 7vh;
}


  </style>
  