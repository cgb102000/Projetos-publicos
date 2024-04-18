<template>
    <main>
  <img :src="imgUrl" alt="">
  <h1 id="meuNome">Caio Gabriel</h1>
  <h2>São José do Rio preto - São Paulo</h2>
  <p><b>Programador</b>
  </p>
  <menu>
    <li class="links"><a href="https://github.com/cgb102000" target="_blank">GitHub</a></li>
   
    <li class="links"><a href="https://www.linkedin.com/in/caio-g-42626a134/" target="_blank">LinkedIn</a></li>
    <li class="links"><a href="" target="_blank">Twitter</a></li>
    <li class="links"><a href="" target="_blank">Instagram</a></li>
  </menu>
  
</main>
</template>

<script>
export default{
    name:'Portifolio',
    data(){
        return{
            imgUrl:'./imagens/eu.jpg',
        }
    }
}
</script>

<style lang="css" scoped>
@font-face {
  font-family: "inter";
  src: url("./assets/fonts/Inter-VariableFont_slnt\,wght.ttf");
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}



html,
body {
  width: 100%;
  min-height: 100vh;
  background-color: var(--secondary-dark);
  display: flex;
  justify-content: center;
  align-items: center;
}

main {
  width: 100%;
  max-width: 375px;
  margin: auto;
  padding: 3rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0.85rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  

}

img {
  width: 100%;
  max-width: 100px;
  aspect-ratio: 1 / 1;
  border-radius: 100%;
  margin: auto;
  display: block;
  object-fit: cover;
  
}
img:hover{
    scale: 1.2;
    border: 2px solid var(--primary-color);
}

h1,
h2,
p,
li {
  text-align: center;
}

h1,
p,
li {
  color: var(--white);
}

h1 {
  margin-top: 2rem;
  font-size: 1.9rem;
  font-weight: 700;
}

h2 {
  color: var(--verde-claro);
}

h2 {
  font-size: 1.1rem;
  font-weight: 600;
}

p {
  margin: 1rem 0 1.5rem;
}

menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.8rem 0;
  background-color: var(--secondary);
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

li:not(:last-child) {
  margin-bottom: 1rem;
}

li:hover {
  background-color: var(--primary-color);
  color: var(--secondary);
}
#meuNome:hover{
    
}
a{
    color: white;
}
a:hover{
    color: var(--verde-claro);
    
}

</style>