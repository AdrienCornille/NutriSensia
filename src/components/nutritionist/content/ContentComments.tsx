'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Trash2,
  Reply,
  Loader2,
  Shield,
} from 'lucide-react';
import {
  useContentComments,
  useReplyToComment,
  useDeleteComment,
} from '@/hooks/useContentInteractions';

interface ContentCommentsProps {
  contentId: string;
}

export function ContentComments({ contentId }: ContentCommentsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useContentComments(contentId, page);
  const replyMutation = useReplyToComment();
  const deleteMutation = useDeleteComment();

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = (parentId?: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      {
        contentId,
        body: replyText.trim(),
        parentId,
      },
      {
        onSuccess: () => {
          setReplyText('');
          setReplyToId(null);
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('Supprimer ce commentaire ?')) {
      deleteMutation.mutate({ contentId, commentId });
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
      </div>
    );
  }

  const comments = data?.comments || [];
  const pagination = data?.pagination;

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
        <MessageCircle className='w-4 h-4 text-[#1B998B]' />
        Commentaires ({pagination?.total || 0})
      </h3>

      {/* Write new reply (top-level) */}
      <div className='flex gap-2'>
        <input
          type='text'
          value={replyToId === null ? replyText : ''}
          onChange={e => {
            setReplyToId(null);
            setReplyText(e.target.value);
          }}
          placeholder='Écrire un commentaire...'
          className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20 focus:border-[#1B998B]'
          onKeyDown={e => {
            if (e.key === 'Enter' && !replyToId) handleReply();
          }}
        />
        <button
          onClick={() => handleReply()}
          disabled={!replyText.trim() || replyMutation.isPending || !!replyToId}
          className='p-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50 transition-colors'
        >
          <Send className='w-4 h-4' />
        </button>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-6'>
          Aucun commentaire pour le moment
        </p>
      ) : (
        <div className='space-y-3'>
          {comments.map(comment => (
            <div key={comment.id} className='space-y-2'>
              <div
                className={`p-3 rounded-lg ${
                  comment.isNutritionist
                    ? 'bg-[#1B998B]/5 border border-[#1B998B]/20'
                    : 'bg-gray-50'
                }`}
              >
                <div className='flex items-center gap-2 mb-1.5'>
                  <span className='text-xs font-medium text-gray-900'>
                    {comment.userName || 'Patient'}
                  </span>
                  {comment.isNutritionist && (
                    <span className='flex items-center gap-0.5 text-xs text-[#1B998B] bg-[#1B998B]/10 px-1.5 py-0.5 rounded-full'>
                      <Shield className='w-3 h-3' />
                      Nutritionniste
                    </span>
                  )}
                  <span className='text-xs text-gray-400'>
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className='text-sm text-gray-700'>{comment.body}</p>
                <div className='flex items-center gap-3 mt-2'>
                  <button
                    onClick={() =>
                      setReplyToId(replyToId === comment.id ? null : comment.id)
                    }
                    className='text-xs text-gray-500 hover:text-[#1B998B] flex items-center gap-1'
                  >
                    <Reply className='w-3.5 h-3.5' />
                    Répondre
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className='text-xs text-gray-400 hover:text-red-500 flex items-center gap-1'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Reply input */}
              {replyToId === comment.id && (
                <div className='flex gap-2 ml-6'>
                  <input
                    type='text'
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Répondre à ${comment.userName || 'Patient'}...`}
                    className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B]/20'
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleReply(comment.id);
                      if (e.key === 'Escape') setReplyToId(null);
                    }}
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className='p-2 bg-[#1B998B] text-white rounded-lg hover:bg-[#158578] disabled:opacity-50'
                  >
                    <Send className='w-4 h-4' />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center gap-2'>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className='px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50'
          >
            Précédent
          </button>
          <span className='text-xs text-gray-400 self-center'>
            {page}/{pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className='px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50'
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
