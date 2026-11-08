import { Footer } from './Footer';

export function Container({ children }) {
  return (
    <div className="gc-page">
      <main className="content-section animate-fadeIn">
        {children}
      </main>
      <Footer />
    </div>
  );
}
