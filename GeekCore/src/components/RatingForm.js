import React, { useState } from 'react';
import { ratingService } from '../services/api';

export function RatingForm({ itemId, onRatingSubmit }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setSubmitting(true);
      const data = await ratingService.submitRating(itemId, rating);
      onRatingSubmit?.(data);
      setRating(0);
    } catch (error) {
      alert('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star);
              // Submeter automaticamente ao clicar na estrela
              ratingService.submitRating(itemId, star)
                .then(onRatingSubmit)
                .catch(() => alert('Erro ao enviar avaliação'));
            }}
            className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'} transition-colors hover:scale-110`}
          >
            ★
          </button>
        ))}
      </div>
    </form>
  );
}
