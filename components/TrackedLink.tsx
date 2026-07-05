"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type UmamiWindow = Window & {
  umami?: {
    track?: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
  };
};

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  eventName: string;
  eventData?: Record<string, string | number | boolean>;
};

export function trackEvent(eventName: string, eventData?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  (window as UmamiWindow).umami?.track?.(eventName, eventData);
}

export default function TrackedLink({ href, children, eventName, eventData, ...props }: Props) {
  function handleClick(_event: MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, { href, ...eventData });
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...props} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
