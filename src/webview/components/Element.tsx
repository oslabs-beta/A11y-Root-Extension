import React from 'react';
import { ElementProps } from '../../types/index.types';

function Element({ node }: ElementProps) {
  return (
    <li className='element'>
      <span className='role'>{`role : ${node.role}  `}</span>
      <span
        className={
          node.level
            ? `${
                !node.compliance ? 'non-compliant-header' : 'compliant-header'
              }`
            : ''
        }
      >
        {node.level && `level:${node.level} `}
      </span>
      <span className={node.role}>{`name: ${node.name} `}</span>
      <span className={!node.compliance ? 'non-compliance' : ''}>
        {!node.compliance && ` compliance issue: ${node.complianceDetails}`}
      </span>
    </li>
  );
}

export default Element;
