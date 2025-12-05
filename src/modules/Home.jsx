import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import Sidebar from '../components/sidebar/Sidebar.jsx'

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  {/* <ActionIcon 
    onClick={() => setMobileOpen(true)}
     className="mobile-hamburger" 
     style={{ 
     position: "fixed", 
     top: 14, left: 14,
      zIndex: 3000,
       background: "#fff",
        border: "1px solid #ddd" }} >
         <IconMenu2 size={22} color="black" /> 
         </ActionIcon> */}

  // pages order for sidebar index
  const routeMap = [
    "/",
    "/users",
    "/stratergies",
    "/create-stratergy",
    "/trading-signal",
    "/plans-pricing",
    "/subscriptions",
    "/broker",
    "/trading-activity",
    "/reports",
   "/tutorials",
   "/notifications",
   "/settings"
  ];

  // detect active index from current URL
  const active = routeMap.indexOf(location.pathname);

  const handleSelect = (index) => {
    navigate(routeMap[index]);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        active={active}
        onSelect={handleSelect}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
 <ActionIcon
  onClick={() => setMobileOpen(true)}
  className="mobile-hamburger"
  hiddenFrom="sm"
  style={{
    position: "fixed",
    top: 14,
    left: 14,
    zIndex: 3000,
    background: "#fff",
    border: "1px solid #ddd",
  }}
>
  <IconMenu2 size={22} color="black" />
</ActionIcon>

      <div
        style={{
          flex: 1,
          padding: "20px",
          transition: "margin-left 0.25s ease",
          marginLeft:
            window.innerWidth > 768 ? (collapsed ? "80px" : "250px") : "0px",
        }}
      >
        {/* PAGE CONTENT VIA ROUTES */}
        <Outlet />
      </div>
    </div>
  );
}
 