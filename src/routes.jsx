import { createBrowserRouter } from "react-router";
import { Layout } from "./app/components/layout/layout";
import { OwnerLayout } from "./app/components/layout/owner-layout";
import { AdminLayout } from "./app/components/layout/admin-layout";
import { LandingPage } from "./app/pages/landing-page";
import { BookingSuccess } from "./app/pages/booking-success";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    lazy: async () => {
      const { LoginPage } = await import("./app/pages/login");
      return { Component: LoginPage };
    },
  },
  {
    path: "/register",
    lazy: async () => {
      const { RegisterPage } = await import("./app/pages/register");
      return { Component: RegisterPage };
    },
  },
  {
    path: "/player-login",
    lazy: async () => {
      const { PlayerLoginPage } = await import("./app/pages/player/login");
      return { Component: PlayerLoginPage };
    },
  },
  {
    path: "/owner-setup",
    lazy: async () => {
      const { OwnerSetupPage } = await import("./app/pages/owner/setup");
      return { Component: OwnerSetupPage };
    },
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { AdminDashboard } = await import("./app/pages/admin/dashboard");
          return { Component: AdminDashboard };
        },
      },
      {
        path: "home-cms",
        lazy: async () => {
          const { AdminHomeCMS } = await import("./app/pages/admin/home-cms");
          return { Component: AdminHomeCMS };
        },
      },
      {
        path: "users",
        lazy: async () => {
          const { AdminUsers } = await import("./app/pages/admin/users");
          return { Component: AdminUsers };
        },
      },
      {
        path: "turf-owners",
        lazy: async () => {
          const { AdminTurfOwners } = await import("./app/pages/admin/turf-owners");
          return { Component: AdminTurfOwners };
        },
      },
      {
        path: "turfs",
        lazy: async () => {
          const { AdminTurfs } = await import("./app/pages/admin/turfs");
          return { Component: AdminTurfs };
        },
      },
      {
        path: "bookings",
        lazy: async () => {
          const { AdminBookings } = await import("./app/pages/admin/bookings");
          return { Component: AdminBookings };
        },
      },
      {
        path: "games",
        lazy: async () => {
          const { AdminGames } = await import("./app/pages/admin/games");
          return { Component: AdminGames };
        },
      },
      {
        path: "payments",
        lazy: async () => {
          const { AdminPayments } = await import("./app/pages/admin/payments");
          return { Component: AdminPayments };
        },
      },
      {
        path: "passes",
        lazy: async () => {
          const { AdminPasses } = await import("./app/pages/admin/passes");
          return { Component: AdminPasses };
        },
      },
      {
        path: "coupons",
        lazy: async () => {
          const { AdminCoupons } = await import("./app/pages/admin/coupons");
          return { Component: AdminCoupons };
        },
      },
      {
        path: "banners",
        lazy: async () => {
          const { AdminBanners } = await import("./app/pages/admin/banners");
          return { Component: AdminBanners };
        },
      },
      {
        path: "reviews",
        lazy: async () => {
          const { AdminReviews } = await import("./app/pages/admin/reviews");
          return { Component: AdminReviews };
        },
      },
      {
        path: "support",
        lazy: async () => {
          const { AdminSupport } = await import("./app/pages/admin/support");
          return { Component: AdminSupport };
        },
      },
      {
        path: "reports",
        lazy: async () => {
          const { AdminReports } = await import("./app/pages/admin/reports");
          return { Component: AdminReports };
        },
      },
      {
        path: "analytics",
        lazy: async () => {
          const { AdminAnalytics } = await import("./app/pages/admin/analytics");
          return { Component: AdminAnalytics };
        },
      },
      {
        path: "notifications",
        lazy: async () => {
          const { AdminNotifications } = await import("./app/pages/admin/notifications");
          return { Component: AdminNotifications };
        },
      },
      {
        path: "settings",
        lazy: async () => {
          const { AdminSettings } = await import("./app/pages/admin/settings");
          return { Component: AdminSettings };
        },
      },
      {
        path: "profile",
        lazy: async () => {
          const { AdminProfile } = await import("./app/pages/admin/profile");
          return { Component: AdminProfile };
        },
      },
    ]
  },
  {
    path: "/owner-dashboard",
    element: <OwnerLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Dashboard } = await import("./app/pages/owner/dashboard");
          return { Component: Dashboard };
        },
      },
      {
        path: "turfs",
        lazy: async () => {
          const { TurfList } = await import("./app/pages/owner/turfs");
          return { Component: TurfList };
        },
      },
      {
        path: "turfs/add",
        lazy: async () => {
          const { AddTurf } = await import("./app/pages/owner/turfs/add");
          return { Component: AddTurf };
        },
      },
      {
        path: "turfs/:id/edit",
        lazy: async () => {
          const { EditTurf } = await import("./app/pages/owner/turfs/edit");
          return { Component: EditTurf };
        },
      },
      {
        path: "bookings",
        lazy: async () => {
          const { BookingsList } = await import("./app/pages/owner/bookings");
          return { Component: BookingsList };
        },
      },
      {
        path: "bookings/:id",
        lazy: async () => {
          const { BookingDetails } =
            await import("./app/pages/owner/bookings/details");
          return { Component: BookingDetails };
        },
      },
      {
        path: "calendar",
        lazy: async () => {
          const { CalendarView } = await import("./app/pages/owner/calendar");
          return { Component: CalendarView };
        },
      },
      {
        path: "time-slots",
        lazy: async () => {
          const { TimeSlots } = await import("./app/pages/owner/time-slots");
          return { Component: TimeSlots };
        },
      },
      {
        path: "revenue",
        lazy: async () => {
          const { Revenue } = await import("./app/pages/owner/revenue");
          return { Component: Revenue };
        },
      },
      {
        path: "customers",
        lazy: async () => {
          const { CustomersList } = await import("./app/pages/owner/customers");
          return { Component: CustomersList };
        },
      },
      {
        path: "reviews",
        lazy: async () => {
          const { ReviewsList } = await import("./app/pages/owner/reviews");
          return { Component: ReviewsList };
        },
      },
      {
        path: "promotions",
        lazy: async () => {
          const { Promotions } = await import("./app/pages/owner/promotions");
          return { Component: Promotions };
        },
      },
      {
        path: "notifications",
        lazy: async () => {
          const { Notifications } = await import("./app/pages/owner/notifications");
          return { Component: Notifications };
        },
      },
      {
        path: "documents",
        lazy: async () => {
          const { Documents } = await import("./app/pages/owner/documents");
          return { Component: Documents };
        },
      },
      {
        path: "tournaments",
        lazy: async () => {
          const { TournamentOrganizerDashboard } =
            await import("./app/pages/tournament-organizer-dashboard");
          return { Component: TournamentOrganizerDashboard };
        },
      },
      {
        path: "settings",
        lazy: async () => {
          const { Settings } = await import("./app/pages/owner/settings");
          return { Component: Settings };
        },
      },
      {
        path: "profile",
        lazy: async () => {
          const { OwnerProfile } = await import("./app/pages/owner/profile");
          return { Component: OwnerProfile };
        },
      },
    ],
  },
  {
    element: <Layout />,
    children: [

      {
        path: "/player-dashboard",
        lazy: async () => {
          const { PlayerDashboard } = await import("./app/pages/player/dashboard");
          return { Component: PlayerDashboard };
        },
      },
      {
        path: "/venues",
        lazy: async () => {
          const { VenueBooking } = await import("./app/pages/venue-booking");
          return { Component: VenueBooking };
        },
      },
      {
        path: "/bookings",
        lazy: async () => {
          const { BookingsPage } = await import("./app/pages/bookings");
          return { Component: BookingsPage };
        },
      },
      {
        path: "/booking-success",
        element: <BookingSuccess />,
      },
      {
        path: "/venues/:id",
        lazy: async () => {
          const { VenueDetails } = await import("./app/pages/venue-details");
          return { Component: VenueDetails };
        },
      },
      {
        path: "/tournaments",
        lazy: async () => {
          const { Tournaments } = await import("./app/pages/tournaments");
          return { Component: Tournaments };
        },
      },

      {
        path: "/squad-booking",
        lazy: async () => {
          const { SquadBookingPage } = await import("./app/pages/squad-booking");
          return { Component: SquadBookingPage };
        },
      },
      {
        path: "/open-lobbies",
        lazy: async () => {
          const { OpenLobbiesPage } = await import("./app/pages/open-lobbies");
          return { Component: OpenLobbiesPage };
        },
      },
      {
        path: "/teams",
        lazy: async () => {
          const { TeamManagement } = await import("./app/pages/team-management");
          return { Component: TeamManagement };
        },
      },
      {
        path: "/community",
        lazy: async () => {
          const { CommunityFeed } = await import("./app/pages/community-feed");
          return { Component: CommunityFeed };
        },
      },
      {
        path: "/payment",
        lazy: async () => {
          const { Payment } = await import("./app/pages/payment");
          return { Component: Payment };
        },
      },
      {
        path: "/profile",
        lazy: async () => {
          const { UserProfile } = await import("./app/pages/user-profile");
          return { Component: UserProfile };
        },
      },
      {
        path: "/edit-profile",
        lazy: async () => {
          const { EditProfilePage } = await import("./app/pages/edit-profile");
          return { Component: EditProfilePage };
        },
      },
      {
        path: "/organizer-dashboard",
        lazy: async () => {
          const { TournamentOrganizerDashboard } =
            await import("./app/pages/tournament-organizer-dashboard");
          return { Component: TournamentOrganizerDashboard };
        },
      },
      {
        path: "/ai-assistant",
        lazy: async () => {
          const { AISportsAssistant } =
            await import("./app/pages/ai-sports-assistant");
          return { Component: AISportsAssistant };
        },
      },
    ],
  },
]);
