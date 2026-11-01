import { Suspense, type ReactNode } from "react";
import { EntrySheetLoader } from "@/components/entry/EntrySheetLoader";
import { EntrySheetProvider } from "@/components/entry/EntrySheetProvider";
import { TourProvider } from "@/components/tour/TourProvider";
import { TourStatus } from "@/components/tour/TourStatus";
import { BottomBar, Rail, Sidebar } from "./AppNav";
import { InstallBanner } from "./InstallBanner";
import {
  MonthBanner,
  MonthLine,
  MonthLineFallback,
  ProfileAvatar,
  ProfileAvatarFallback,
  RailProfile,
  SidebarProfile,
} from "./HeaderStatus";
import { ScreenHeader } from "./ScreenHeader";

/**
 * The chrome every signed-in screen sits in. It lives in the route group's
 * layout, so switching tabs swaps `children` and leaves the header and the
 * navigation mounted — no re-render, no re-fetch, and the tab highlight moves
 * on the tap rather than on the server's reply.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      <EntrySheetProvider>
        <div className="flex min-h-dvh flex-1">
          <Sidebar
            profile={
              <Suspense>
                <SidebarProfile />
              </Suspense>
            }
          />
          <Rail
            profile={
              <Suspense fallback={<ProfileAvatarFallback />}>
                <RailProfile />
              </Suspense>
            }
          />
          <div className="min-w-0 flex-1">
            <div className="mx-auto grid max-w-[1080px] grid-cols-[minmax(0,1fr)] gap-4 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-[140px] md:px-7 md:pt-6 md:pb-10 xl:px-10 xl:pt-7">
              <InstallBanner />
              <ScreenHeader
                month={
                  <Suspense fallback={<MonthLineFallback />}>
                    <MonthLine />
                  </Suspense>
                }
                banner={
                  <Suspense>
                    <MonthBanner />
                  </Suspense>
                }
                avatar={
                  <Suspense fallback={<ProfileAvatarFallback />}>
                    <ProfileAvatar />
                  </Suspense>
                }
              />
              <main className="flex min-w-0 flex-col gap-4">{children}</main>
            </div>
          </div>
        </div>
        <BottomBar />
        <Suspense>
          <EntrySheetLoader />
        </Suspense>
      </EntrySheetProvider>
      <Suspense>
        <TourStatus />
      </Suspense>
    </TourProvider>
  );
}
