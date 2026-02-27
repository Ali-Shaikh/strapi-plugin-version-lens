'use strict';

const React = require('react');
const iconAsset = require('../assets/version-lens-icon.png');

const VersionLensIcon = () => {
  const iconSrc = iconAsset && iconAsset.default ? iconAsset.default : iconAsset;

  return React.createElement(
    'img',
    {
      src: iconSrc,
      alt: '',
      'aria-hidden': 'true',
      style: {
        width: '1rem',
        height: '1rem',
        objectFit: 'contain',
      },
    },
    null
  );
};

module.exports = VersionLensIcon;
