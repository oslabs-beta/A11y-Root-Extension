import React, { useEffect, useState } from 'react';
import Element from './Element';
import {
  DisplayA11yTreeProps,
  AccessibilityNode,
  AccessibilityTree,
  TabIndexEntry,
} from '../types';
import {
  headerAside,
  skipLinkAside,
  linksAside,
  treeAside,
  tabIndexAside,
  nonSemanticLinksAside,
} from '../components/AsideContent';
import { nanoid } from 'nanoid';
import DisplayElements from '../containers/DisplayElements';

function DisplayA11yTree({ pageResults, activeTab }: DisplayA11yTreeProps) {
  //const skipLink = tree.skipLink;
  //const h1 = tree.h1;
  //handle addToPriorities here?
  const [elements, setElements] = useState<React.ReactElement[]>([]);
  const [links, setLinks] = useState<React.ReactElement[]>([]);
  const [headings, setHeadings] = useState<React.ReactElement[]>([]);
  const [tabIndex, setTabIndex] = useState<React.ReactElement[]>([]);
  const [nonContextualLinks, setNonContextualLinks] = useState<
    React.ReactElement[]
  >([]);
  const [skipLink, setSkipLink] = useState<React.ReactElement | null>(
    pageResults && pageResults.skipLink ? (
      <Element node={pageResults.skipLink} />
    ) : null
  );

  function setNode(node: AccessibilityNode) {
    setElements((prev) => [...prev, <Element node={node} />]);
    switch (node.role) {
      case 'link':
        setLinks((prev) => [...prev, <Element node={node} />]);
        if (!node.compliance) {
          setNonContextualLinks((prev) => [...prev, <Element node={node} />]);
        }
        break;
      case 'button':
        break;
      case 'heading':
        setHeadings((prev) => [...prev, <Element node={node} />]);
        break;
      case 'StaticText':
        break;
      default:
        node.compliance = true;
        node.complianceDetails = '';
        break;
    }
  }

  function treeCrawl(node: AccessibilityTree | AccessibilityNode): void {
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        treeCrawl(child);
      }
    } else {
      setNode(node);
    }
  }

  // would be nice if tabIndex elements were regular a11y nodes

  function buildTabIndexElements(tabIndex: AccessibilityNode[]) {
    return tabIndex.map((node) => {
      return <Element node={node} />;
    });
  }

  useEffect(() => {
    if (pageResults) {
      setLinks([]); // Clear links
      setElements([]); // Clear elements
      setHeadings([]);
      if (pageResults.tree) {
        treeCrawl(pageResults.tree);
      }

      if (pageResults.skipLink) {
        const skipLinkElement = <Element node={pageResults.skipLink} />;
        setSkipLink(skipLinkElement);
      }

      setTabIndex(buildTabIndexElements(pageResults.tabIndex));
    }
  }, [pageResults]);

  //   const nonSemanticLinks = tree.nonSemanticLinks.map(({ text, link }) => {
  //     return <Link text={text} link={link} key={nanoid()} />;
  //   });

  //   const skipLinkFound = skipLink.text.length ? (
  //     <Link text={skipLink.text} link={skipLink.link} />
  //   ) : (
  //     <span className='bad tan'>No Skip Link Found</span>
  //   );

  return (
    <section id='tree'>
      {activeTab === 'Full Tree' && (
        <DisplayElements key={nanoid()} aside={treeAside} title={'Full Tree'}>
          {elements}
        </DisplayElements>
      )}
      {activeTab === 'Headers' && (
        <DisplayElements key={nanoid()} aside={headerAside} title={'Headers'}>
          {headings}
        </DisplayElements>
      )}

      {activeTab === 'Links' && (
        <DisplayElements key={nanoid()} aside={linksAside} title={'Links'}>
          {links}
        </DisplayElements>
      )}
      {activeTab === 'Tab Index' && (
        <DisplayElements
          key={nanoid()}
          aside={tabIndexAside}
          title={'Tab Index'}
        >
          {tabIndex}
        </DisplayElements>
      )}
      {activeTab === 'Non Contextual Links' && (
        <DisplayElements
          key={nanoid()}
          aside={tabIndexAside}
          title={'Non Contextual Links'}
        >
          {nonContextualLinks}
        </DisplayElements>
      )}
      {activeTab === 'Skip Link' && (
        <DisplayElements
          key={nanoid()}
          aside={skipLinkAside}
          title={'Skip Link'}
        >
          {skipLink ? (
            skipLink
          ) : (
            <Element node={{ name: 'N/A', role: 'link' }} />
          )}
        </DisplayElements>
      )}
    </section>
  );
}

//NonContextualLinks

export default DisplayA11yTree;
