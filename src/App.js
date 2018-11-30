import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
} from 'reactstrap';

class App extends Component {
  render() {
    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand href="/">GitHub org stats</NavbarBrand>
        </Navbar>
      </div>
    );
  }
}

export default App;
