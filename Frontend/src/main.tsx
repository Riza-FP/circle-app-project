// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";

import { WebSocketProvider } from "./contexts/WebSocketContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </Provider>
);
