import React from 'react';
import './Sections.css';

const Categories = ({ selectedCategory }) => {
  return (
    <div className='sections'>
      <h2>Categoria: {selectedCategory}</h2>
    </div>
  );
};

export default Categories;
