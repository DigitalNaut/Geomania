import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Title from 'src/components/Title';

export default {
  title: 'Components/Title',
  component: Title,
} as ComponentMeta<typeof Title>;

const Template: ComponentStory<typeof Title> = () => <Title>Title</Title>;

export const Primary = Template.bind({});
