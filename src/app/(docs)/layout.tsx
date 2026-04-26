import '@/css/globals.css';
import './layout.css';
import { Header } from '@/components/Header';
import { SideNav } from '@/components/SideNav';
import { QuickNavContainer } from '@/components/QuickNav';

const navigation = {
  'Red Hat AI AgentOps': [
    { title: 'Security', href: '/security' },
    {
      title: 'Tracing',
      href: '/tracing',
      children: [
        { title: 'Connect to MLFlow', href: '/tracing/connect-to-mlflow' },
      ],
    },
    { title: 'Evaluation', href: '/evaluation' },
    {
      title: 'Identity',
      href: '/identity',
      children: [
        { title: 'Using SPIFFE/SPIRE', href: '/identity/using-spiffe-spire' },
      ],
    },
    { title: 'Observability', href: '/observability' },
    { title: 'Catalog', href: '/catalog' },
    { title: 'Lifecycle', href: '/lifecycle' },
  ],
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="RootLayout">
      <div className="RootLayoutContainer">
        <div className="RootLayoutContent">
          <div className="ContentLayoutRoot">
            <Header />
            <SideNav sections={navigation} />
            <main className="ContentLayoutMain">
              <QuickNavContainer>{children}</QuickNavContainer>
            </main>
          </div>
        </div>
        <span className="RootLayoutFooter" />
      </div>
    </div>
  );
}
