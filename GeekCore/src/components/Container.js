import { Footer } from './Footer';

export function Container({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}
