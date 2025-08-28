import React from 'react'
import { Navbar, NavbarButton, NavbarLogo, NavBody, NavItems } from '@/components/ui/resizable-navbar';

const navLinks = [
  { name: "Sign Up", link: "/auth/signup" },
  { name: "Sign In", link: "/auth/login" },
  
];
const Navbars = () => {
  return (

    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={navLinks} />
      </NavBody>
    </Navbar>
  );
};

export default Navbars