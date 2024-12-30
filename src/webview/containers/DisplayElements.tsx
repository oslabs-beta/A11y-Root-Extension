import React, { useState } from 'react';
import { DisplayElementsProps } from '../../types/index.types';

function DisplayElements({ title, children, aside }: DisplayElementsProps) {
  return (
    <section className='dashboard-display'>
      <h2>{title}</h2>
      <aside>{aside}</aside>
      <ul>{children}</ul>
    </section>
  );
}

export default DisplayElements;
