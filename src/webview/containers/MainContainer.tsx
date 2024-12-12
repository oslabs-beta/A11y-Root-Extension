import React, { useState } from 'react';
import URLInputForm from '../components/URLInputForm';
import TabNavigation from '../components/TabNavigation';
import DisplayA11yTree from '../components/DisplayA11yTree';
import { PageResults, MainContainerProps } from '../types';

function MainContainer({ user }: MainContainerProps) {
  const [pageResults, setPageResults] = useState<PageResults | null>(null);
  const [activeTab, setActiveTab] = useState('Full Tree');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <main id='main'>
      <URLInputForm setPageResults={setPageResults} user={user} />
      <TabNavigation activeTab={activeTab} handleTabChange={handleTabChange} />
      <DisplayA11yTree activeTab={activeTab} pageResults={pageResults} />
    </main>
  );
}

export default MainContainer;
