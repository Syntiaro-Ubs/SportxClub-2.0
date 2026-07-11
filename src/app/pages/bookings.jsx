import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  MapPin,
  Plus,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const asset = (path) => `/assets${path}`;

const upcomingBookings = [
  {
    id: 1,
    venue: "Elite Turf Arena",
    sport: "Football",
    date: "Today, 6:00 PM",
    duration: "60 mins",
    location: "Powai, Mumbai",
    image: asset("/venues/turf-1.webp"),
    status: "Confirmed",
  },
  {
    id: 2,
    venue: "Ace Tennis Academy",
    sport: "Tennis",
    date: "Tomorrow, 8:00 AM",
    duration: "90 mins",
    location: "Bandra, Mumbai",
    image: asset("/venues/turf-3.webp"),
    status: "Confirmed",
  },
];

const dateSlots = ["Today", "Tomorrow", "Sat 27", "Sun 28", "Mon 29"];
const timeSlots = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];
const playerCounts = ["2 Players", "4 Players", "6 Players", "8 Players"];

export function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("7:00 PM");
  const [selectedPlayers, setSelectedPlayers] = useState("4 Players");

  return (
    <div className="space-y-5 py-2 pb-6 w-full max-w-full overflow-x-hidden min-w-0 px-0.5">
      <div className="space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[28px] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)] w-full min-w-0 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs  uppercase tracking-[0.24em] text-primary">
                Your bookings
              </p>
              <h1 className="mt-2 text-2xl  tracking-tight">
                Manage bookings like a native app
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Review upcoming sessions, select a slot, and confirm payment
                with a single sticky CTA.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl border border-border/60 bg-background/80 text-foreground"
              aria-label="Add booking"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </motion.section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base ">Upcoming sessions</h2>
            <Link
              to="/venues"
              className="inline-flex items-center gap-1 text-sm  text-primary"
            >
              Book more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <motion.article
                key={booking.id}
                whileTap={{ scale: 0.99 }}
                className="flex gap-3 rounded-[24px] border border-border/60 bg-card p-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.3)]"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[18px]">
                  <ImageWithFallback
                    src={booking.image}
                    alt={booking.venue}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base ">{booking.venue}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.sport}
                      </p>
                    </div>
                    <Badge className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.65rem]  uppercase tracking-[0.18em] text-primary">
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />
                      {booking.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {booking.location}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] w-full min-w-0 overflow-hidden">
          <Card className="rounded-[28px] border-border/60 bg-card shadow-[0_12px_34px_-26px_rgba(15,23,42,0.35)] w-full min-w-0 overflow-hidden">
            <CardContent className="space-y-5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs  uppercase tracking-[0.24em] text-primary">
                    Booking flow
                  </p>
                  <h2 className="mt-2 text-lg ">Choose a session</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm  text-foreground">Date</p>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {dateSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedDate(slot)}
                      className={
                        selectedDate === slot
                          ? "min-w-fit rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm  text-primary"
                          : "min-w-fit rounded-full border border-border/60 bg-background px-4 py-2 text-sm  text-muted-foreground"
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm  text-foreground">Time slots</p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={
                        selectedTime === slot
                          ? "flex h-11 items-center justify-between rounded-[16px] border border-primary/25 bg-primary/10 px-3 text-sm  text-primary"
                          : "flex h-11 items-center justify-between rounded-[16px] border border-border/60 bg-background px-3 text-sm  text-muted-foreground"
                      }
                    >
                      <span>{slot}</span>
                      {selectedTime === slot && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm  text-foreground">Player count</p>
                <div className="grid grid-cols-2 gap-2">
                  {playerCounts.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSelectedPlayers(count)}
                      className={
                        selectedPlayers === count
                          ? "h-11 rounded-[16px] border border-primary/25 bg-primary/10 text-sm  text-primary"
                          : "h-11 rounded-[16px] border border-border/60 bg-background text-sm  text-muted-foreground"
                      }
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/60 bg-card shadow-[0_12px_34px_-26px_rgba(15,23,42,0.35)] w-full min-w-0 overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs  uppercase tracking-[0.24em] text-primary">
                    Payment summary
                  </p>
                  <h2 className="mt-2 text-lg ">Review total</h2>
                </div>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>

              <div className="rounded-[22px] border border-border/60 bg-background p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected date</span>
                  <span className="">{selectedDate}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected time</span>
                  <span className="">{selectedTime}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Players</span>
                  <span className="">{selectedPlayers}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Venue charge</span>
                  <span className="">₹1,200</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-sm ">Payable now</span>
                  <span className="text-xl  text-primary">₹1,200</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-primary/15 bg-primary/10 p-4">
                <p className="text-sm  text-foreground">Booking confirmation</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We will hold the slot, send the confirmation to your profile,
                  and keep the payment policy visible before checkout.
                </p>
              </div>

              <Button className="h-12 w-1/2 flex mx-auto justify-center items-center gap-2 rounded-[18px] bg-primary text-primary-foreground shadow-[0_12px_24px_-18px_rgba(34,197,94,0.8)] hover:bg-primary/90">
                Confirm booking
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-40 border-t border-border/50 bg-background/90 px-4 py-3 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Next step
            </p>
            <p className="mt-1 text-sm  text-foreground">
              {selectedDate} at {selectedTime}
            </p>
          </div>
          <Button className="h-11 rounded-[16px] bg-primary px-5  text-primary-foreground hover:bg-primary/90">
            Book now
          </Button>
        </div>
      </div>
    </div>
  );
}
