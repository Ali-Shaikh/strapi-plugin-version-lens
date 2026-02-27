'use strict';

const VersionLensIcon = () => {
  const React = require('react');

  return React.createElement(
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
      r: '6',
      stroke: 'currentColor',
      strokeWidth: '1.6',
    }),
    React.createElement('path', {
      d: 'M14.2 14.2L19 19',
      stroke: 'currentColor',
      strokeWidth: '1.8',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
    React.createElement('path', {
      d: 'M7.4 8.1L10 12.3L12.6 8.1',
      stroke: 'currentColor',
      strokeWidth: '1.6',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    })
  );
};

module.exports = VersionLensIcon;
