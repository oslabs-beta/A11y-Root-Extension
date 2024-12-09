import React, { useState } from 'react';
import URLInputForm from '../components/URLInputForm';
import TabNavigation from '../components/TabNavigation';
import DisplayA11yTree from '../components/DisplayA11yTree';
import { AccessibilityNode, AccessibilityTree } from '../types';

function MainContainer() {
  const [a11yTree, setA11yTree] = useState<AccessibilityTree | null>(null);
  const [activeTab, setActiveTab] = useState('Full Tree');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <h2>Accessability Tree Checker !</h2>
      <URLInputForm setA11yTree={setA11yTree} />
      <TabNavigation activeTab={activeTab} handleTabChange={handleTabChange} />
      <DisplayA11yTree activeTab={activeTab} a11yTree={a11yTree} />
    </>
  );
}

export default MainContainer;
