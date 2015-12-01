import React from 'react'
import { render } from 'react-dom'

import { Router, Route } from 'react-router'

import App from './app.jsx'

// Views
import Map from './views/Map'

render((
  <Router>
    <Route path="/" component={App}>
      <Route path="map" component={Map}/>
    </Route>
  </Router>
), document.getElementById('app'))
