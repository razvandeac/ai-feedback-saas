'use client';

import { useState } from 'react';
import BlockRenderer from '@/src/components/studio/BlockRenderer';

export default function ClientPreview({ 
  published, 
  draft, 
  hasDraft 
}: { 
  published: any
  draft: any
  hasDraft: boolean 
}) {
  const [showDraft, setShowDraft] = useState(false);
  
  // Determine which config to show
  const config = showDraft ? draft : published;
  
  return (
    <>
      <div className="rounded-2xl border bg-white p-6">
        <BlockRenderer blocks={config?.blocks ?? []} previewOnly={true} />
      </div>
      
      {hasDraft && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showDraft}
              onChange={(e) => setShowDraft(e.target.checked)}
              className="rounded"
            />
            <span>View draft (unpublished)</span>
          </label>
        </div>
      )}
      
      {showDraft ? (
        <div className="rounded-2xl border p-3 bg-amber-50 text-amber-800 text-xs">
          ⚠️ <b>Viewing draft:</b> This is the unpublished version. Publish in Studio to make this live.
        </div>
      ) : (
        <div className="rounded-2xl border p-3 bg-blue-50 text-blue-800 text-xs">
          This preview renders the <b>published</b> version. Edit in Studio and click Publish to update.
        </div>
      )}
    </>
  );
}

