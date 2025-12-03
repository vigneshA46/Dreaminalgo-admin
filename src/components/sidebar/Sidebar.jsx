import { ActionIcon, Box, Flex, Group, Image, Text, ThemeIcon } from "@mantine/core";
import {
  IconGauge,
  IconChartLine,
  IconCreditCard,
  IconFileText,
  IconPlus,
  IconAntenna,
  IconUser,
  IconMenu2,
  IconCoinRupee,
  IconBook,
} from "@tabler/icons-react";
import classes from "./Sidebar.module.css";
import logowhite from "../../assets/logowhite.png"
import logo from "../../assets/logo.jpeg"
import { useState } from "react";


const menu = [
  { label: "Dashboard", icon: IconGauge },
  { label: "users", icon: IconAntenna },
  { label: "stratergies", icon: IconChartLine },
  { label: "subscriptions", icon: IconCreditCard },
  { label: "broker", icon: IconFileText },
  { label: "trading activity", icon: IconPlus },
  { label: "reports", icon: IconCoinRupee},
  { label: "education", icon: IconBook},
  { label: "notifications", icon: IconBook},
  { label: "settings", icon: IconBook},

];

export default function Sidebar({ active, onSelect, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {

  
/* const [collapsed, setCollapsed] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false); */

const toggleSidebar = () => {
  if (window.innerWidth <= 768) {
    setMobileOpen(!mobileOpen);
  } else {
    setCollapsed(!collapsed);
  }
};
  return (
<>
  {mobileOpen && (
    <div
      className={classes.overlay}
      onClick={() => setMobileOpen(false)}
    />
  )}
  <Box
    
    className={`${classes.sidebar} 
      ${collapsed ? classes.collapsed : ''} 
      ${mobileOpen ? classes.mobileOpen : ''}`}
  >
    {/* header */}
    <Flex align="center" justify="space-between" className={classes.header}>
      <Flex
        align="center"
        justify="center"
        gap="sm"
        direction={collapsed ? "column" : "row"}
      >
        <Image src={logo} alt="loading logo" w="2.8rem" radius="1rem" />

        <ActionIcon onClick={toggleSidebar} variant="subtle" className={classes.hamburgerInside}>
  <IconMenu2 size={22} color="black" />
     </ActionIcon>
      </Flex>
    </Flex>

    {/* menu */}
    <Box className={classes.menu}>
      {menu.map((item, i) => (
        <Box
          key={i}
          className={`${classes.menuItem} ${active === i ? classes.active : ""}`}
          onClick={() => {
            onSelect(i);
            setMobileOpen(false); // auto close if mobile
          }}
        >
          <item.icon size={22} />
          {!collapsed && <Text ml="sm">{item.label}</Text>}
        </Box>
      ))}
    </Box>
  </Box>

  {/* overlay - OUTSIDE SIDEBAR */}

</>

  );
}
