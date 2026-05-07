import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => (
      <h1 className="MdH1" {...props} />
    ),
    h2: (props: ComponentPropsWithoutRef<'h2'>) => {
      const text = typeof props.children === 'string' ? props.children : '';
      const id = props.id ?? slugify(text);
      return <h2 className="MdH2" id={id} {...props} />;
    },
    h3: (props: ComponentPropsWithoutRef<'h3'>) => {
      const text = typeof props.children === 'string' ? props.children : '';
      const id = props.id ?? slugify(text);
      return <h3 className="MdH3" id={id} {...props} />;
    },
    p: (props: ComponentPropsWithoutRef<'p'>) => (
      <p className="MdP" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="MdUl" {...props} />
    ),
    a: ({ href, ...props }: ComponentPropsWithoutRef<'a'>) => {
      const isExternal = href && /^https?:\/\//.test(href);
      return (
        <a
          className="MdLink"
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener' } : {})}
          {...props}
        />
      );
    },
    code: (props: ComponentPropsWithoutRef<'code'>) => (
      <code className="MdCode" {...props} />
    ),
    strong: (props: ComponentPropsWithoutRef<'strong'>) => (
      <strong className="MdStrong" {...props} />
    ),
    table: (props: ComponentPropsWithoutRef<'table'>) => (
      <div className="ApiTable">
        <table {...props} />
      </div>
    ),
    ...components,
  };
}
