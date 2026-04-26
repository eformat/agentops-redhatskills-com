'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './SideNav.css';

export interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

interface SideNavProps {
  sections: Record<string, NavItem[]>;
}

export function SideNav({ sections }: SideNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="SideNavRoot">
      <div className="SideNavViewport">
        {Object.entries(sections).map(([name, pages]) => (
          <div key={name} className="SideNavSection">
            <div className="SideNavHeading">{name}</div>
            <ul className="SideNavList">
              {pages.map((page) => {
                const active = pathname === page.href;
                const expanded =
                  page.children?.length && pathname.startsWith(page.href);

                return (
                  <li key={page.href} className="SideNavItem">
                    <Link
                      className="SideNavLink"
                      href={page.href}
                      aria-current={active ? 'page' : undefined}
                      data-active={active ? '' : undefined}
                    >
                      {page.title}
                    </Link>
                    {expanded && (
                      <ul className="SideNavChildList">
                        {page.children!.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <li key={child.href} className="SideNavItem">
                              <Link
                                className="SideNavLink SideNavChildLink"
                                href={child.href}
                                aria-current={
                                  childActive ? 'page' : undefined
                                }
                                data-active={childActive ? '' : undefined}
                              >
                                {child.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
