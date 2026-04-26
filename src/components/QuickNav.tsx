'use client';

import './QuickNav.css';

interface QuickNavItem {
  id: string;
  text: string;
  level: number;
}

export function QuickNavContainer({ children }: { children: React.ReactNode }) {
  return <div className="QuickNavContainer">{children}</div>;
}

export function QuickNav({ items }: { items: QuickNavItem[] }) {
  if (items.length === 0) return null;

  const renderItems = (items: QuickNavItem[]) => {
    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < items.length) {
      const item = items[i];
      const children: QuickNavItem[] = [];

      i++;
      while (i < items.length && items[i].level > item.level) {
        children.push(items[i]);
        i++;
      }

      result.push(
        <li key={item.id} className="QuickNavItem">
          <a className="QuickNavLink" href={`#${item.id}`}>
            {item.text}
          </a>
          {children.length > 0 && (
            <ul className="QuickNavList">{renderItems(children)}</ul>
          )}
        </li>,
      );
    }

    return result;
  };

  return (
    <nav className="QuickNavRoot" aria-label="On this page">
      <div className="QuickNavInner">
        <div className="QuickNavViewport">
          <ul className="QuickNavList">
            <li className="QuickNavItem">
              <a className="QuickNavLink" href="#">
                (Top)
              </a>
            </li>
            {renderItems(items)}
          </ul>
        </div>
      </div>
    </nav>
  );
}
