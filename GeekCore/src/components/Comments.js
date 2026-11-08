import React from 'react';
import { DiscussionEmbed } from 'disqus-react';

export function Comments({ videoId, videoTitle }) {
  const disqusConfig = {
    url: `${window.location.origin}/detalhes/${videoId}`,
    identifier: videoId,
    title: videoTitle
  };

  return (
    <div className="gc-panel gc-comments">
      <h2 className="gc-section-title">Comentários</h2>
      <DiscussionEmbed
        shortname="geekcore" // Substitua pelo seu shortname do Disqus
        config={disqusConfig}
      />
    </div>
  );
}
