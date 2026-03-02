import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ContentBlock({ contentKey, defaultValue, className = '', as: Component = 'div', ...props }) {
  const { data: content } = useQuery({
    queryKey: ['site-content', contentKey],
    queryFn: async () => {
      const items = await base44.entities.SiteContent.filter({ key: contentKey });
      return items[0];
    },
    enabled: !!contentKey,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const value = content?.value || defaultValue;
  const type = content?.type || 'text';

  if (type === 'image') {
    return <img src={value} alt={content?.label || 'Content Image'} className={className} {...props} />;
  }

  if (type === 'rich_text') {
    return <div className={className} dangerouslySetInnerHTML={{ __html: value }} {...props} />;
  }

  return (
    <Component className={className} {...props}>
      {value}
    </Component>
  );
}