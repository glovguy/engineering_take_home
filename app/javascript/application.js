// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './components/RootComponent';

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('react-root');
  if (node) {
    ReactDOM.render(<RootComponent />, node);
  }
});
