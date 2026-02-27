'use strict';

const createIcon = (React) =>
  React.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '1em',
      height: '1em',
      viewBox: '0 0 24 24',
      fill: 'none',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    React.createElement('circle', {
      cx: '10',
      cy: '10',
      r: '6.1',
      stroke: 'currentColor',
      strokeWidth: '1.6',
    }),
    React.createElement('circle', {
      cx: '10',
      cy: '10',
      r: '4.5',
      stroke: 'currentColor',
      strokeWidth: '1.1',
      opacity: '0.55',
    }),
    React.createElement('path', {
      d: 'M14.5 14.5L19.2 19.2',
      stroke: 'currentColor',
      strokeWidth: '1.8',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
    React.createElement('path', {
      d: 'M7.6 8.3L10 12.2L12.4 8.3',
      stroke: 'currentColor',
      strokeWidth: '1.6',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    })
  );

const VersionLensIcon = () => {
  let React;

  try {
    React = require('react');
  } catch {
    return null;
  }

  return createIcon(React);
};

module.exports = VersionLensIcon;
