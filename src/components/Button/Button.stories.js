import React from 'react';
import Button, { PrimaryButton, SecondaryButton } from '.';

export default {
  title: 'Button',
};

export const Default = () => <Button>text</Button>;

export const Primary = () => <PrimaryButton>text</PrimaryButton>;

export const Secondary = () => <SecondaryButton>text</SecondaryButton>;