import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Auth0Provider
      domain="dev-0j0hy0c08w4lq86u.us.auth0.com"
      clientId="Ri455aa2LOFsgmzGxMep4bwvuxtZ1xBJ"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <UserProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </UserProvider>
    </Auth0Provider>
  </BrowserRouter>
);
