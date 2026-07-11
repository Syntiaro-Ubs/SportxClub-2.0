import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Download,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";

export function BookingSuccess() {
  return (
    <Container className="py-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center space-y-6 max-w-lg w-full"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-green-600 shadow-xl shadow-green-500/10">
            <CheckCircle2 className="h-14 w-14" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl  tracking-tight">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Your slot at{" "}
            <span className="text-foreground ">Elite Sports Arena</span> has
            been reserved.
          </p>
        </div>

        <Card className="border-border/40 shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <p className="text-[10px] uppercase  text-muted-foreground tracking-widest">
                  Date
                </p>
                <div className="flex items-center gap-2 ">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>June 18, 2026</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase  text-muted-foreground tracking-widest">
                  Time Slot
                </p>
                <div className="flex items-center gap-2 ">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>6:00 PM - 7:00 PM</span>
                </div>
              </div>
              <div className="col-span-2 space-y-1 pt-2 border-t border-border/20">
                <p className="text-[10px] uppercase  text-muted-foreground tracking-widest">
                  Venue Address
                </p>
                <div className="flex items-start gap-2 ">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">
                    123 Sports Complex, MG Road, Mumbai
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1  gap-2">
                <Download className="h-4 w-4" />
                Receipt
              </Button>
              <Button variant="outline" className="flex-1  gap-2">
                <Share2 className="h-4 w-4" />
                Invite Friends
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard" className="flex-1">
              <Button size="lg" className="w-full  shadow-lg shadow-primary/20">
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/venues" className="flex-1">
              <Button size="lg" variant="secondary" className="w-full ">
                Book Another
              </Button>
            </Link>
          </div>

          <Button
            variant="link"
            className="text-muted-foreground hover:text-primary group"
          >
            Need help with your booking?
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </Container>
  );
}
