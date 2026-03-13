'use client';

import React, { useState } from 'react';
import { MessageSquare, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  useModificationRequests,
  useRespondModificationRequest,
} from '@/hooks/useNutritionistMealPlans';
import type { ModificationRequest } from '@/hooks/useNutritionistMealPlans';

// ============================================================================
// Types
// ============================================================================

interface ModificationRequestsBannerProps {
  patientId: string;
  planId: string;
}

// ============================================================================
// Single Request Card
// ============================================================================

function RequestCard({
  request,
  patientId,
  planId,
}: {
  request: ModificationRequest;
  patientId: string;
  planId: string;
}) {
  const [responseText, setResponseText] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const respond = useRespondModificationRequest(patientId, planId);

  const createdAt = new Date(request.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  function handleApprove() {
    respond.mutate({
      requestId: request.id,
      data: { status: 'approved', response: responseText || undefined },
    });
  }

  function handleReject() {
    if (!responseText.trim()) {
      setShowResponse(true);
      return;
    }
    respond.mutate({
      requestId: request.id,
      data: { status: 'rejected', response: responseText },
    });
  }

  if (request.status !== 'pending') {
    return null;
  }

  return (
    <div className='bg-white rounded-lg p-3 border border-amber-200'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-gray-700 mb-0.5'>
            {request.title}
          </p>
          <p className='text-sm text-gray-600'>&quot;{request.description}&quot;</p>
          {request.suggested_alternative && (
            <p className='text-xs text-gray-500 mt-1'>
              Suggestion : {request.suggested_alternative}
            </p>
          )}
          <p className='text-xs text-gray-400 mt-1'>{createdAt}</p>
        </div>
      </div>

      {showResponse && (
        <div className='mt-2'>
          <textarea
            value={responseText}
            onChange={e => setResponseText(e.target.value)}
            placeholder='Votre réponse au patient...'
            rows={2}
            className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B998B] resize-none'
          />
        </div>
      )}

      <div className='flex items-center gap-2 mt-2'>
        {!showResponse && (
          <button
            onClick={() => setShowResponse(true)}
            className='text-xs text-gray-500 hover:text-gray-700'
          >
            Répondre...
          </button>
        )}
        <div className='flex-1' />
        <button
          onClick={handleApprove}
          disabled={respond.isPending}
          className='flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50'
        >
          {respond.isPending ? (
            <Loader2 className='w-3 h-3 animate-spin' />
          ) : (
            <Check className='w-3 h-3' />
          )}
          Approuver
        </button>
        <button
          onClick={handleReject}
          disabled={respond.isPending}
          className='flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
        >
          <X className='w-3 h-3' />
          Refuser
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Banner
// ============================================================================

export function ModificationRequestsBanner({ patientId, planId }: ModificationRequestsBannerProps) {
  const { data: requests } = useModificationRequests(patientId, planId);
  const [expanded, setExpanded] = useState(true);

  const pendingRequests = (requests || []).filter(r => r.status === 'pending');

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='p-6 flex items-center justify-between border-b border-gray-100'>
        <div>
          <h3 className='font-semibold text-gray-800'>
            Demandes de modification
          </h3>
          <p className='text-sm text-gray-500 mt-1'>
            Signalements d&apos;aliments par le patient.
          </p>
        </div>
        {pendingRequests.length > 0 && (
          <span className='flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200'>
            <MessageSquare className='w-3.5 h-3.5' />
            {pendingRequests.length} en attente
          </span>
        )}
      </div>

      {/* Pending requests list */}
      {pendingRequests.length > 0 && (
        <div className='p-4'>
          <button
            onClick={() => setExpanded(!expanded)}
            className='flex items-center justify-between w-full mb-3'
          >
            <p className='text-sm font-medium text-gray-700'>
              Demandes en attente ({pendingRequests.length})
            </p>
            {expanded ? (
              <ChevronUp className='w-4 h-4 text-gray-400' />
            ) : (
              <ChevronDown className='w-4 h-4 text-gray-400' />
            )}
          </button>
          {expanded && (
            <div className='space-y-2'>
              {pendingRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  patientId={patientId}
                  planId={planId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {pendingRequests.length === 0 && (
        <div className='p-6 text-center'>
          <p className='text-sm text-gray-500'>
            Aucune demande de modification en attente.
          </p>
        </div>
      )}
    </div>
  );
}
