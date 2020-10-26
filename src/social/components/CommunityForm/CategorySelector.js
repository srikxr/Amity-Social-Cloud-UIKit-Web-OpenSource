import React, { useState } from 'react';

import { MenuItem } from '~/core/components/Menu';
import { customizableComponent } from '~/core/hocs/customization';
import { getCategories, getCategory } from '~/mock';
import { backgroundImage as CategoryImage } from '~/icons/Category';

import { Avatar, Selector, SelectorPopover, SelectorList, SelectIcon } from './styles';

const Category = ({ category }) => (
  <>
    <Avatar size="tiny" avatar={category.avatar} backgroundImage={CategoryImage} />
    {` ${category.name}`}
  </>
);

const CategorySelector = ({ value: categoryId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const categories = getCategories();

  const currentCategory = getCategory(categoryId);

  const list = (
    <SelectorList>
      {/* TODO empty state */}
      {categories.map(category => (
        <MenuItem
          key={category.id}
          onClick={() => {
            close();
            onChange(category.id);
          }}
        >
          <Category key={category.id} category={category} />
        </MenuItem>
      ))}
    </SelectorList>
  );

  return (
    <SelectorPopover isOpen={isOpen} onClickOutside={close} content={list}>
      <Selector onClick={open}>
        {categoryId && <Category category={currentCategory} />} <SelectIcon />
      </Selector>
    </SelectorPopover>
  );
};

export default customizableComponent('CategorySelector', CategorySelector);