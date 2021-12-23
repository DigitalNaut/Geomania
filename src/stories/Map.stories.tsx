import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Map from 'src/components/Map';

export default {
  title: 'Components/Map',
  component: Map,
} as ComponentMeta<typeof Map>;

const Template: ComponentStory<typeof Map> = () => <Map />;

export const Primary = Template.bind({});
