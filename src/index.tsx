import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TalverinLaptop } from "./screens/TalverinLaptop";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <TalverinLaptop />
  </StrictMode>,
);
