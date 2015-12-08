var React = require('react');
var ReactDOM = require('react-dom');
var Inspector = require('react-json-inspector');

export function createInspector(pipboy, el) {
  pipboy.database
    .distinctUntilChanged()
    .throttle(1000)
    .subscribe(db => {
      ReactDOM.render(<Inspector data={ db } />, el);
    })
}
