import * as React from "react";
import * as ReactDOM from "react-dom";
import { hot } from "react-hot-loader";

import Main from "./apps/main";

// tslint:disable-next-line
require("./styles/main.scss");

const App = hot(module)(Main);

ReactDOM.render(<App />, document.getElementById("app"));
