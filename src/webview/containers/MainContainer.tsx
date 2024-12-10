import React, { useState } from 'react';
import URLInputForm from '../components/URLInputForm';
import TabNavigation from '../components/TabNavigation';
import DisplayA11yTree from '../components/DisplayA11yTree';
import { PageResults } from '../types';

function MainContainer() {
  const [pageResults, setPageResults] = useState<PageResults | null>(null);
  const [activeTab, setActiveTab] = useState('Full Tree');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <h2>Accessability Tree Checker !</h2>
      <URLInputForm setPageResults={setPageResults} />
      <TabNavigation activeTab={activeTab} handleTabChange={handleTabChange} />
      <DisplayA11yTree activeTab={activeTab} pageResults={pageResults} />
    </>
  );
}

export default MainContainer;
