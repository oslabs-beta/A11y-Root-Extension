import React, { useState } from 'react';
import { DisplayElementsProps } from '../types';

function DisplayElements({ title, children, aside }: DisplayElementsProps) {
  return (
    <section className=''>
      <h2>{title}</h2>
      <aside>{aside}</aside>
      <ul>{children}</ul>
    </section>
  );
}

export default DisplayElements;
