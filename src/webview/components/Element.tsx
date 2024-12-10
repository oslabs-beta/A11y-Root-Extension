import React from 'react';
import { ElementProps } from '../types';

function Element({ node }: ElementProps) {
  return (
    <li>
      <span>{`role : ${node.role} | `}</span>
      <span>{node.level && `level:${node.level} | `}</span>
      <span>{`name: ${node.name} `}</span>
      <span>
        {!node.compliance && `| compliance issue: ${node.complianceDetails}`}
      </span>
    </li>
  );
}

export default Element;
