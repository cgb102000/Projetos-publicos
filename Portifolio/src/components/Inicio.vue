<template>
<Portifolio/>

</template>

<script>

import Cabecalho from './Cabecalho.vue'
import Portifolio from './Portifolio.vue'

export default{
    name:'Inicio',
    data(){
        return{
            urlTeste:'./public/imagens/eu.jpg'
        };
    },
    components:{
        Portifolio,
    }
}
</script>   

<style scoped>



</style>


