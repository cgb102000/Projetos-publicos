class Carousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.carousel-track');
    if (!this.track) return;
    
    this.cards = Array.from(this.track.children);
    this.prevBtn = container.querySelector('.carousel-prev');
    this.nextBtn = container.querySelector('.carousel-next');
    
    this.cardWidth = 220; // Width + gap
    this.cardsToScroll = 4;
    this.position = 0;
    
    this.init();
  }

  init() {
    if (!this.track || !this.prevBtn || !this.nextBtn) return;
    
    this.prevBtn.addEventListener('click', () => this.move('prev'));
    this.nextBtn.addEventListener('click', () => this.move('next'));
    this.updateButtons();
  }

  move(direction) {
    const trackWidth = this.track.offsetWidth;
    const maxScroll = this.track.scrollWidth - trackWidth;
    const moveAmount = this.cardWidth * this.cardsToScroll;

    if (direction === 'prev') {
      this.position = Math.max(this.position - moveAmount, 0);
    } else {
      this.position = Math.min(this.position + moveAmount, maxScroll);
    }

    this.track.style.transform = `translateX(-${this.position}px)`;
    this.updateButtons();
  }

  updateButtons() {
    this.prevBtn.classList.toggle('hidden', this.position <= 0);
    this.nextBtn.classList.toggle('hidden', 
      this.position >= this.track.scrollWidth - this.track.offsetWidth);
  }
}

// Initialize carousels
document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel-container');
  carousels.forEach(container => new Carousel(container));
});
