import React, { useState } from 'react';
import URLInputForm from '../components/URLInputForm';
import TabNavigation from '../components/TabNavigation';
import DisplayA11yTree from '../components/DisplayA11yTree';
import { PageResults, MainContainerProps } from '../../types/index.types';
import URLSelectionForm from '../components/URLSelectionForm';

function MainContainer({ user }: MainContainerProps) {
  const [pageResults, setPageResults] = useState<PageResults | null>(null);
  const [activeTab, setActiveTab] = useState('Non Compliance');
  const [url, setUrl] = useState<string>('http://127.0.0.1:5500');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <main id='main'>
      <URLInputForm
        setPageResults={setPageResults}
        user={user}
        url={url}
        setUrl={setUrl}
      />
      <URLSelectionForm
        setPageResults={setPageResults}
        user={user}
        url={url}
        setUrl={setUrl}
      />
      {pageResults && (
        <TabNavigation
          activeTab={activeTab}
          handleTabChange={handleTabChange}
        />
      )}
      {pageResults && (
        <DisplayA11yTree activeTab={activeTab} pageResults={pageResults} />
      )}
    </main>
  );
}

export default MainContainer;
