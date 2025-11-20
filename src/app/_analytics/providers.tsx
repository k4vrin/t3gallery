// app/providers.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useAuth, useUser } from "@clerk/nextjs";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/relay-60in",
      ui_host: 'https://us.posthog.com'
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogWrapper>{children}</PostHogWrapper>
    </PHProvider>
  );
}

function PostHogWrapper({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const userInfo = useUser();

  useEffect(() => {
    if (userInfo.user) {
      posthog.identify(userInfo.user.id, {
        email: userInfo.user.emailAddresses[0]?.emailAddress,
        name: userInfo.user.firstName,
      });
    } else if (!auth.isSignedIn) {
      posthog.reset();
    }
  }, [auth]);

  return children;
}
