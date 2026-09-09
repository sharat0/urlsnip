import React from 'react';
import { LinkList } from '../components/LinkList';

export const LinksView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <LinkList />
    </div>
  );
};
