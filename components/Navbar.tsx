import React from "react";
import Image from "next/image";
import { suiPayImg } from "@/images";
import { ConnectButton } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import Link from "next/link";

export default function NavbarBody() {
  const account = useCurrentAccount();
  const user = account?.address;

  // Helper function to generate dark random colors
  function getRandomDarkColor() {
    const r = Math.floor(Math.random() * 100); // 0-99 for dark tones
    const g = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <div className="nav_div">
      <Navbar fluid rounded className="max-w-screen-xl mx-auto p-4 nav_div">
        <NavbarBrand href="/">
          <Image src={suiPayImg} alt="SuiPlay Logo" width={30} height={30} />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            SuiPlay
          </span>
        </NavbarBrand>

        <div className="flex md:order-2">
          {user ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                  style={{
                    backgroundColor: getRandomDarkColor(),
                  }}
                >
                  {user.slice(0, 2).toUpperCase()}
                </div>
              }
              className="Dropdown_Div"
            >
              <DropdownHeader>
                <span className="block truncate text-sm font-medium">
                  {user.length > 6
                    ? `${user.slice(0, 4)}........${user.slice(-4)}`
                    : user}
                </span>
              </DropdownHeader>
              <div className="Dropdown_Div_link">
                <Link href="/profile">Dashboard</Link>
              </div>
              <div className="Dropdown_Div_link">
                <Link href="/profile">Settings</Link>
              </div>
              <DropdownDivider />
            </Dropdown>
          ) : (
            ""
          )}

          <NavbarToggle />
        </div>

        <NavbarCollapse className="navbar_collapse">
          <NavbarLink
            href="/"
            className="block py-2 px-3 text-white rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"
          >
            Customer
          </NavbarLink>
          <NavbarLink href="/merchant">Merchant</NavbarLink>
          <NavbarLink href="/faucet" target="_blank">
            Claim Faucet
          </NavbarLink>
          <ConnectButton />
        </NavbarCollapse>
      </Navbar>
    </div>
  );
}
