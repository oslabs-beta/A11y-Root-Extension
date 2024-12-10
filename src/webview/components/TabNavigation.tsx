import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  handleTabChange: (activeTab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  handleTabChange,
}) => {
  return (
    <section id='tabs'>
      <button
        className={activeTab === 'Full Tree' ? 'active' : ''}
        onClick={() => handleTabChange('Full Tree')}
      >
        Full Tree
      </button>
      <button
        className={activeTab === 'Tab Index' ? 'active' : ''}
        onClick={() => handleTabChange('Tab Index')}
      >
        Tab Index
      </button>
      <button
        className={activeTab === 'Headers' ? 'active' : ''}
        onClick={() => handleTabChange('Headers')}
      >
        Headers
      </button>
      <button
        className={activeTab === 'Links' ? 'active' : ''}
        onClick={() => handleTabChange('Links')}
      >
        Links
      </button>
      <button
        className={activeTab === 'Non Contextual Links' ? 'active' : ''}
        onClick={() => handleTabChange('Non Contextual Links')}
      >
        Non Semantic Links
      </button>
      <button
        className={activeTab === 'Skip Link' ? 'active' : ''}
        onClick={() => handleTabChange('Skip Link')}
      >
        Skip Link
      </button>
    </section>
  );
};

export default TabNavigation;
