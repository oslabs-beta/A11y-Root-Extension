import React from 'react';

const headerAside = (
  <p>
    <a
      href='https://www.w3.org/WAI/tutorials/page-structure/headings/'
      className='good'
    >
      Header ranking
    </a>
    , making sure that only one h1 is on a page and that the h1-h6 element
    hierarchy is semantic and not stylistically driven.
  </p>
);

const skipLinkAside = (
  <>
    <p>
      A{' '}
      <a className='good' href='https://webaim.org/techniques/skipnav/'>
        skip link
      </a>{' '}
      is an essential accessibility feature that allows users, especially those
      relying on assistive technologies like screen readers and keyboard
      navigation, to bypass repetitive navigation and jump directly to the main
      content of a page. This improves navigation efficiency, reduces cognitive
      load, and aligns with Web Content Accessibility Guidelines (WCAG). Skip
      links enhance usability for all users by minimizing the need to repeatedly
      tab or scroll through the same elements, creating a more inclusive and
      user-friendly experience.
    </p>
  </>
);

const linksAside = (
  <p>
    Looking for{' '}
    <a
      className='good'
      href='https://digital.accessibility.princeton.edu/how/content/links'
    >
      Meaningful
    </a>{' '}
    link text that provide context to the links content or purpose.
  </p>
);
const treeAside = (
  <p>
    This is a breakdown of the meaningful elements found in the{' '}
    <a
      className='good'
      href='https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree'
    >
      Accessability Tree
    </a>
  </p>
);

const tabIndexAside = (
  <p>
    This is an ordered list of the{' '}
    <a
      className='good'
      href='https://www.a11y-collective.com/blog/tabindex-accessibility/'
    >
      tabindex
    </a>
    , it is important that the order is meaningful.
  </p>
);
const nonSemanticLinksAside = (
  <p>
    When a link has{' '}
    <a
      className='good'
      href='https://stevenmouret.github.io/web-accessibility-guidelines/accessibility/links/empty-link.html#:~:text=Explanation,text%20link%20for%20each%20link.'
    >
      no text (empty link)
    </a>
    , it is not read in the technical assistance or indicated as empty.
  </p>
);

export {
  headerAside,
  skipLinkAside,
  linksAside,
  treeAside,
  tabIndexAside,
  nonSemanticLinksAside,
};
