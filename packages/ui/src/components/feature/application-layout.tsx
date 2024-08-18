/* eslint-disable @typescript-eslint/no-confusing-void-expression -- ok*/
"use client";

import { Navbar, NavbarSection, NavbarSpacer } from "../catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "../catalyst/sidebar";
import { SidebarLayout } from "../catalyst/sidebar-layout";
import {
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
} from "@heroicons/react/20/solid";

export interface SidebarItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function ApplicationLayout({
  children,
  pathname,
  profileItem,
  sideBarContent,
  items,
  title,
}: {
  children: React.ReactNode;
  pathname: string;
  profileItem: React.ReactNode;
  sideBarContent?: React.ReactNode;
  items: SidebarItem[];
  title: string;
}) {
  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>{profileItem}</NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="w-20 ml-3">
              <img src="./plinq.png" alt="plinq" />
            </div>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  current={pathname === item.href}
                >
                  {item.icon}
                  <SidebarLabel>{item.label}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>

            {sideBarContent}

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="#">
                <QuestionMarkCircleIcon />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <SparklesIcon />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            {/* <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src="/users/erica.jpg"
                    className="size-10"
                    square
                    alt=""
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      Erica
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      erica@example.com
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown> */}
            {profileItem}
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
