export function Footer() {
  return (
    <footer className="bg-darker mt-auto py-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">GeekCore</h2>
            <p className="text-gray-400 mt-2">Sua plataforma de entretenimento geek</p>
          </div>
          
          <div className="text-center max-w-2xl">
            <h3 className="text-xl font-semibold text-light mb-2">Sobre Nós</h3>
            <p className="text-gray-400">
              GeekCore é sua plataforma para explorar os melhores filmes e animes. 
              Junte-se a nós e descubra um mundo de entretenimento!
            </p>
          </div>

          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GeekCore. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
