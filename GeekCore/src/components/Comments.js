import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { commentService } from '../services/api';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export function Comments({ videoId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentInputType, setCurrentInputType] = useState(null);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const data = await commentService.getComments(videoId);
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Você precisa estar logado para comentar');
      return;
    }

    try {
      const response = await commentService.addComment(videoId, newComment);
      setComments([response, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    }
  };

  const handleReply = async (commentId) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para responder');
      return;
    }

    try {
      await commentService.addComment(videoId, replyContent, commentId);
      await loadComments();
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Erro ao responder comentário:', error);
    }
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para curtir');
      return;
    }

    try {
      const response = await commentService.likeComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      try {
        await commentService.deleteComment(commentId);
        await loadComments();
      } catch (error) {
        console.error('Erro ao excluir comentário:', error);
      }
    }
  };

  const onEmojiSelect = (emoji) => {
    if (currentInputType === 'newComment') {
      setNewComment(prev => prev + emoji.native);
    } else if (currentInputType === 'reply') {
      setReplyContent(prev => prev + emoji.native);
    }
    setShowEmojiPicker(false);
  };

  const handleEmojiButtonClick = (inputType) => {
    setCurrentInputType(inputType);
    setShowEmojiPicker(prev => !prev);
  };

  return (
    <div className="mt-8 relative">
      <h3 className="text-2xl font-bold mb-4">Comentários</h3>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="w-full p-3 rounded bg-darker text-light border border-gray-700 focus:border-primary resize-none"
              rows="3"
              required
            />
            <button
              type="button"
              onClick={() => handleEmojiButtonClick('newComment')}
              className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-primary"
            >
              😊
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-hover transition-colors"
            >
              Comentar
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-400 mb-6">
          Faça login para comentar
        </p>
      )}

      {showEmojiPicker && (
        <div className="absolute right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1"
            >
              ✕
            </button>
            <Picker 
              data={data}
              onEmojiSelect={onEmojiSelect}
              theme="dark"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment._id} className="bg-darker p-4 rounded">
            <div className="flex items-start gap-3">
              <img
                src={comment.usuario.foto || '/images/default-avatar.png'}
                alt={comment.usuario.nome}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{comment.usuario.nome}</span>
                    <span className="text-sm text-gray-400 ml-2">
                      {new Date(comment.data_criacao).toLocaleDateString()}
                    </span>
                  </div>
                  {user && comment.usuario._id === user._id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="mt-1 text-light whitespace-pre-wrap">{comment.conteudo}</p>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className={`flex items-center gap-1 text-sm ${
                      comment.likes.includes(user?._id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-400 hover:text-red-500'
                    } transition-colors duration-200`}
                  >
                    <svg 
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        comment.likes.includes(user?._id) ? 'scale-110' : ''
                      }`} 
                      fill={comment.likes.includes(user?._id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{comment.likes.length}</span>
                  </button>
                  <button
                    onClick={() => setReplyingTo(comment._id)}
                    className="text-sm text-gray-400 hover:text-primary"
                  >
                    Responder
                  </button>
                </div>

                {replyingTo === comment._id && (
                  <div className="mt-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      className="w-full p-2 rounded bg-dark text-light border border-gray-700 focus:border-primary resize-none"
                      rows="2"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleReply(comment._id)}
                        className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-hover"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {comment.respostas?.length > 0 && (
                  <div className="ml-8 mt-4 space-y-4">
                    {comment.respostas.map(reply => (
                      <div key={reply._id} className="bg-dark p-3 rounded">
                        <div className="flex items-start gap-3">
                          <img
                            src={reply.usuario.foto || '/images/default-avatar.png'}
                            alt={reply.usuario.nome}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{reply.usuario.nome}</span>
                              <span className="text-sm text-gray-400">
                                {new Date(reply.data_criacao).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-light">{reply.conteudo}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <button
                                onClick={() => handleLike(reply._id)}
                                className={`flex items-center gap-1 text-sm ${
                                  reply.likes.includes(user?._id)
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-gray-400 hover:text-red-500'
                                } transition-colors duration-200`}
                              >
                                <svg 
                                  className={`w-4 h-4 transform transition-transform duration-200 ${
                                    reply.likes.includes(user?._id) ? 'scale-110' : ''
                                  }`} 
                                  fill={reply.likes.includes(user?._id) ? 'currentColor' : 'none'} 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                                <span>{reply.likes.length}</span>
                              </button>
                              {user && reply.usuario._id === user._id && (
                                <button
                                  onClick={() => handleDelete(reply._id)}
                                  className="text-red-500 hover:text-red-600 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
