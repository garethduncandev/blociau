import { html } from 'lit-html';
import './blociau-element'; // Ensure the correct path to your component
import { Meta } from '@storybook/web-components';
import { Options } from '../lib/models/options';

const meta = {
  title: 'Blociau Element',
  component: 'blociau-element',
  argTypes: {
    canvasHeight: { control: 'number' },
    canvasWidth: { control: 'number' },
  },
} satisfies Meta<Options>;

export default meta;

export const Default = () => html`<blociau-element></blociau-element>`;
