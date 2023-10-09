import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";

export const config = {
  // endpoint: `http://localhost:8082/api/v1`,
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (
    <div className="App">
          <Switch>
          <Route  path="/" exact>
             <Products /> 
            </Route>
            <Route  path="/register" exact>
             <Register />
            </Route>
            <Route  path="/login" exact>
              <Login />
            </Route>
        </Switch>
    </div>
  );
}

export default App;
