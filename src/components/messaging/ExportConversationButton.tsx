'use client';

import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useExportConversation } from '@/hooks/useConversations';

interface ExportConversationButtonProps {
  conversationId: string;
}

export function ExportConversationButton({
  conversationId,
}: ExportConversationButtonProps) {
  const exportMutation = useExportConversation(conversationId);

  return (
    <button
      onClick={() => exportMutation.mutate()}
      disabled={exportMutation.isPending || !conversationId}
      className='p-2 text-gray-400 hover:text-[#1B998B] hover:bg-[#1B998B]/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
      title='Exporter la conversation en PDF'
    >
      {exportMutation.isPending ? (
        <Loader2 className='w-4 h-4 animate-spin' />
      ) : (
        <Download className='w-4 h-4' />
      )}
    </button>
  );
}

export default ExportConversationButton;
