import React, { useEffect, useState } from 'react';
import Element from './Element';
import {
  DisplayA11yTreeProps,
  AccessibilityNode,
  AccessibilityTree,
} from '../types';
import {
  //   h1Aside,
  headerAside,
  //   skipLinkFound,
  skipLinkAside,
  linksAside,
  treeAside,
  tabIndexAside,
  nonSemanticLinksAside,
} from '../components/AsideContent';
import { nanoid } from 'nanoid';
import DisplayElements from '../containers/DisplayElements';

function DisplayA11yTree({ a11yTree, activeTab }: DisplayA11yTreeProps) {
  //const skipLink = tree.skipLink;
  //const h1 = tree.h1;
  //handle addToPriorities here?
  const [elements, setElements] = useState<React.ReactElement[]>([]);
  const [links, setLinks] = useState<React.ReactElement[]>([]);
  const [headings, setHeadings] = useState<React.ReactElement[]>([]);

  function setNode(node: AccessibilityNode) {
    setElements((prev) => [...prev, <Element node={node} />]);
    switch (node.role) {
      case 'link':
        setLinks((prev) => [...prev, <Element node={node} />]);
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

  useEffect(() => {
    if (a11yTree) {
      setLinks([]); // Clear links
      setElements([]); // Clear elements
      treeCrawl(a11yTree);
    }
  }, [a11yTree]);

  //   const nonSemanticLinks = tree.nonSemanticLinks.map(({ text, link }) => {
  //     return <Link text={text} link={link} key={nanoid()} />;
  //   });

  //   const tabElements = tree.tabIndex.map(({ role, name, level, rating }) => {
  //     return (
  //       <Element
  //         role={role}
  //         name={name}
  //         level={level}
  //         rating={rating}
  //         key={nanoid()}
  //       />
  //     );
  //   });

  //   const h1Aside =
  //     h1 === false ? (
  //       <p>
  //         <span className='bad'>No h1 found! </span>The h1 tag is the main heading
  //         or title of a page, and it should match the page's title closely. This
  //         helps screen reader users understand what the page is about.
  //       </p>
  //     ) : (
  //       ''
  //     );

  //   const skipLinkFound = skipLink.text.length ? (
  //     <Link text={skipLink.text} link={skipLink.link} />
  //   ) : (
  //     <span className='bad tan'>No Skip Link Found</span>
  //   );

  return (
    <section id='tree'>
      <h2>Tree info...</h2>
      {activeTab === 'Full Tree' && (
        <DisplayElements key={nanoid()} aside={treeAside} title={'Full Tree'}>
          {elements}
        </DisplayElements>
      )}
      {activeTab === 'Headers' && (
        <DisplayElements key={nanoid()} aside={linksAside} title={'Headers'}>
          {headings}
        </DisplayElements>
      )}

      {activeTab === 'Links' && (
        <DisplayElements key={nanoid()} aside={linksAside} title={'Links'}>
          {links}
        </DisplayElements>
      )}
    </section>
  );
}

export default DisplayA11yTree;
