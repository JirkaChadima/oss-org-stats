import React, { Component } from 'react';
import {
  Alert,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import list from './assets/list';

class App extends Component {
  state = {
    datasource: null,
  };

  constructor(props) {
    super(props);
    this.onDataSourceChange = this.onDataSourceChange.bind(this);
  }

  onDataSourceChange (e) {
    fetch(e.target.value)
      .then((d) => d.json())
      .then((d) => {
        this.setState({
          datasource: d,
        });
      });
  }

  render() {
    const { datasource } = this.state;
    const options = list.map((l) => {
      return (<option key={l.name} value={l.link}>{l.name}</option>);
    });
    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand href="/">GitHub org stats</NavbarBrand>
          <Nav className="ml-auto" navbar>
          <NavItem>
            <Form inline>
              <FormGroup>
                <Label className="mr-sm-2" for="datasource">Source</Label>
                <Input type="select" name="datasource" id="datasource" onChange={this.onDataSourceChange}>
                {options}
                </Input>
              </FormGroup>
            </Form>
            </NavItem>
          </Nav>
        </Navbar>
        <div>
        {! datasource && (<Alert color="info">Select data source first.</Alert>)}
        {datasource && (<p>BODY HERE {JSON.stringify(datasource)}</p>)}
        </div>
      </div>
    );
  }
}

export default App;
