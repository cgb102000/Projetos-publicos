import { AbasAmigos } from '../components/AbasAmigos';
import { Footer } from '../components/Footer';

export function Amigos() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Meus Amigos</h1>
            <AbasAmigos />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
