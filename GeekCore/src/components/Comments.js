import React from 'react';
import { DiscussionEmbed } from 'disqus-react';

export function Comments({ videoId, videoTitle }) {
  const disqusConfig = {
    url: `${window.location.origin}/detalhes/${videoId}`,
    identifier: videoId,
    title: videoTitle
  };

  return (
    <div className="mt-8 bg-darker p-6 rounded-lg">
      <h3 className="text-2xl font-bold mb-6">Comentários</h3>
      <DiscussionEmbed
        shortname="geekcore" // Substitua pelo seu shortname do Disqus
        config={disqusConfig}
      />
    </div>
  );
}
