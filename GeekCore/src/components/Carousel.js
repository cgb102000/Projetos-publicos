import { useState, useRef, useEffect } from 'react';
import { Card } from './Card';

export const Carousel = ({ items, title }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(6);
  const trackRef = useRef(null);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerSlide(2);
      else if (width < 768) setItemsPerSlide(3);
      else if (width < 1024) setItemsPerSlide(4);
      else setItemsPerSlide(6);
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);

  if (!items?.length) return null;

  const chunks = items.reduce((acc, item, i) => {
    const chunkIndex = Math.floor(i / itemsPerSlide);
    if (!acc[chunkIndex]) acc[chunkIndex] = [];
    acc[chunkIndex].push(item);
    return acc;
  }, []);

  const nextSlide = () => {
    setCurrentSlide(curr => (curr + 1) % chunks.length);
  };

  const prevSlide = () => {
    setCurrentSlide(curr => (curr - 1 + chunks.length) % chunks.length);
  };

  return (
    <section className="mt-16 relative px-4 group">
      <h2 className="text-2xl font-bold mb-6 text-light pl-4 border-l-4 border-primary">
        {title || 'Sugestões'}
      </h2>
      
      <div className="relative overflow-hidden">
        <div 
          ref={trackRef}
          className="carousel-track"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {chunks.map((chunk, slideIndex) => (
            <div 
              key={slideIndex}
              className="carousel-slide"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {chunk.map((item, index) => (
                  <div key={item._id || index} className="carousel-item">
                    <Card item={item} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {chunks.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="carousel-nav-btn left-2 opacity-100"
              disabled={currentSlide === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button 
              onClick={nextSlide}
              className="carousel-nav-btn right-2 opacity-100"
              disabled={currentSlide === chunks.length - 1}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
};
