import React from 'react'
import { render } from 'react-dom'

import { Router, Route, Redirect } from 'react-router'

import App from './app.jsx'

// Views
import Map from './views/Map'
import About from './views/About'

render((
  <Router>
    <Route component={App}>
      <Route path="map" component={Map}/>
      <Route path="about" component={About}/>
      <Redirect from="/" to="/about"/>
    </Route>
  </Router>
), document.getElementById('app'))
