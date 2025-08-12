module.exports = function Image(props) {
  const React = require('react');
  return React.createElement('img', { ...props, alt: props.alt || '' });
};


