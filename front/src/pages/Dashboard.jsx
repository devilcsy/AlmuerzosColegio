//pages/Dashboard
import React from "react";
import DashboardStudent from "./DashboardStudent";
import DashboardAdmin from "./DashboardAdmin";
import DashboardParent from "./DashboardParent";
import { getStoredUser } from "../utils/auth";

const Dashboard = () => {
  const user = getStoredUser();

  if (!user) {
    return <p>No autenticado</p>;
  }

  switch (user.role) {
    case "STUDENT":
      return <DashboardStudent />;
    case "ADMIN":
      return <DashboardAdmin />;
    case "PARENT":
      return <DashboardParent />;
    default:
      return (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página.</p>
        </div>
      );
  }
};

export default Dashboard;
