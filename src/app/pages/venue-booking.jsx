import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Star, MapPin, ChevronRight, Filter, ChevronLeft, ChevronDown, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";
import { Button } from "../components/ui/button";

const demoVenues = [
  { id: 1, badge: "TOP RATED", rating: 4.7, sports: "FOOTBALL", name: "Andheri Football Arena", location: "Andheri, Mumbai", image: "/assets/venues/turf-1.webp" },
  { id: 2, badge: "FEATURED", rating: 4.7, sports: "CRICKET", name: "Andheri Cricket Box", location: "Andheri, Mumbai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 3, badge: "FAST FILLING", rating: 4.4, sports: "BADMINTON", name: "Andheri Badminton Arena", location: "Andheri, Mumbai", image: "/assets/venues/new_badminton_turf.png" },
  { id: 4, badge: "TOP RATED", rating: 4.6, sports: "LAWN TENNIS", name: "Andheri Lawn tennis Arena", location: "Andheri, Mumbai", image: "/assets/venues/turf-6.webp" },
  { id: 5, badge: "POPULAR", rating: 4.3, sports: "VOLLEYBALL", name: "Andheri Volleyball Arena", location: "Andheri, Mumbai", image: "/assets/venues/turf-5.webp" },
  { id: 6, badge: "PROMOTED", rating: 5.0, sports: "PADEL", name: "Andheri Padel Arena", location: "Andheri, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 7, badge: "POPULAR", rating: 4.8, sports: "FOOTBALL", name: "Bandra Football Arena", location: "Bandra, Mumbai", image: "/assets/venues/new_football_turf.png" },
  { id: 8, badge: "PROMOTED", rating: 5.0, sports: "CRICKET", name: "Bandra Cricket Box", location: "Bandra, Mumbai", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 9, badge: "FAST FILLING", rating: 4.6, sports: "BADMINTON", name: "Bandra Badminton Arena", location: "Bandra, Mumbai", image: "/assets/venues/turf-3.webp" },
  { id: 10, badge: "NEW", rating: 4.4, sports: "LAWN TENNIS", name: "Bandra Lawn tennis Arena", location: "Bandra, Mumbai", image: "/assets/venues/turf-6.webp" },
  { id: 11, badge: "FEATURED", rating: 4.6, sports: "VOLLEYBALL", name: "Bandra Volleyball Arena", location: "Bandra, Mumbai", image: "/assets/venues/turf-5.webp" },
  { id: 12, badge: "FAST FILLING", rating: 4.2, sports: "PADEL", name: "Bandra Padel Arena", location: "Bandra, Mumbai", image: "/assets/venues/turf-4.webp" },
  { id: 13, badge: "PROMOTED", rating: 4.8, sports: "FOOTBALL", name: "Powai Football Arena", location: "Powai, Mumbai", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 14, badge: "PROMOTED", rating: 4.4, sports: "CRICKET", name: "Powai Cricket Box", location: "Powai, Mumbai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 15, badge: "PROMOTED", rating: 4.4, sports: "BADMINTON", name: "Powai Badminton Arena", location: "Powai, Mumbai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 16, badge: "TOP RATED", rating: 4.3, sports: "LAWN TENNIS", name: "Powai Lawn tennis Arena", location: "Powai, Mumbai", image: "/assets/venues/new_tennis_turf.png" },
  { id: 17, badge: "POPULAR", rating: 4.7, sports: "VOLLEYBALL", name: "Powai Volleyball Arena", location: "Powai, Mumbai", image: "/assets/venues/turf-5.webp" },
  { id: 18, badge: "TOP RATED", rating: 4.8, sports: "PADEL", name: "Powai Padel Arena", location: "Powai, Mumbai", image: "/assets/venues/turf-1.webp" },
  { id: 19, badge: "TOP RATED", rating: 4.6, sports: "FOOTBALL", name: "Goregaon Football Arena", location: "Goregaon, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 20, badge: "FEATURED", rating: 4.8, sports: "CRICKET", name: "Goregaon Cricket Box", location: "Goregaon, Mumbai", image: "/assets/venues/turf-2.webp" },
  { id: 21, badge: "FEATURED", rating: 4.8, sports: "BADMINTON", name: "Goregaon Badminton Arena", location: "Goregaon, Mumbai", image: "/assets/venues/new_badminton_turf.png" },
  { id: 22, badge: "NEW", rating: 4.8, sports: "LAWN TENNIS", name: "Goregaon Lawn tennis Arena", location: "Goregaon, Mumbai", image: "/assets/venues/new_tennis_turf.png" },
  { id: 23, badge: "NEW", rating: 4.3, sports: "VOLLEYBALL", name: "Goregaon Volleyball Arena", location: "Goregaon, Mumbai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 24, badge: "PROMOTED", rating: 4.5, sports: "PADEL", name: "Goregaon Padel Arena", location: "Goregaon, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 25, badge: "FAST FILLING", rating: 4.8, sports: "FOOTBALL", name: "Juhu Football Arena", location: "Juhu, Mumbai", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 26, badge: "NEW", rating: 4.5, sports: "CRICKET", name: "Juhu Cricket Box", location: "Juhu, Mumbai", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 27, badge: "PROMOTED", rating: 4.9, sports: "BADMINTON", name: "Juhu Badminton Arena", location: "Juhu, Mumbai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 28, badge: "PROMOTED", rating: 4.8, sports: "LAWN TENNIS", name: "Juhu Lawn tennis Arena", location: "Juhu, Mumbai", image: "/assets/venues/turf-6.webp" },
  { id: 29, badge: "FEATURED", rating: 4.2, sports: "VOLLEYBALL", name: "Juhu Volleyball Arena", location: "Juhu, Mumbai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 30, badge: "FAST FILLING", rating: 4.4, sports: "PADEL", name: "Juhu Padel Arena", location: "Juhu, Mumbai", image: "/assets/venues/turf-4.webp" },
  { id: 31, badge: "POPULAR", rating: 4.4, sports: "FOOTBALL", name: "Navi Mumbai Football Arena", location: "Navi Mumbai, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 32, badge: "FEATURED", rating: 4.9, sports: "CRICKET", name: "Navi Mumbai Cricket Box", location: "Navi Mumbai, Mumbai", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 33, badge: "POPULAR", rating: 4.4, sports: "BADMINTON", name: "Navi Mumbai Badminton Arena", location: "Navi Mumbai, Mumbai", image: "/assets/venues/turf-3.webp" },
  { id: 34, badge: "POPULAR", rating: 4.3, sports: "LAWN TENNIS", name: "Navi Mumbai Lawn tennis Arena", location: "Navi Mumbai, Mumbai", image: "/assets/venues/new_tennis_turf.png" },
  { id: 35, badge: "PROMOTED", rating: 4.4, sports: "VOLLEYBALL", name: "Navi Mumbai Volleyball Arena", location: "Navi Mumbai, Mumbai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 36, badge: "FEATURED", rating: 4.9, sports: "PADEL", name: "Navi Mumbai Padel Arena", location: "Navi Mumbai, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 37, badge: "POPULAR", rating: 4.2, sports: "FOOTBALL", name: "Thane Football Arena", location: "Thane, Mumbai", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 38, badge: "FEATURED", rating: 4.7, sports: "CRICKET", name: "Thane Cricket Box", location: "Thane, Mumbai", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 39, badge: "TOP RATED", rating: 4.9, sports: "BADMINTON", name: "Thane Badminton Arena", location: "Thane, Mumbai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 40, badge: "POPULAR", rating: 4.8, sports: "LAWN TENNIS", name: "Thane Lawn tennis Arena", location: "Thane, Mumbai", image: "/assets/venues/turf-6.webp" },
  { id: 41, badge: "FAST FILLING", rating: 4.9, sports: "VOLLEYBALL", name: "Thane Volleyball Arena", location: "Thane, Mumbai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 42, badge: "FEATURED", rating: 4.7, sports: "PADEL", name: "Thane Padel Arena", location: "Thane, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 43, badge: "NEW", rating: 4.8, sports: "FOOTBALL", name: "South Mumbai Football Arena", location: "South Mumbai, Mumbai", image: "/assets/venues/turf-1.webp" },
  { id: 44, badge: "POPULAR", rating: 4.8, sports: "CRICKET", name: "South Mumbai Cricket Box", location: "South Mumbai, Mumbai", image: "/assets/venues/turf-2.webp" },
  { id: 45, badge: "NEW", rating: 4.4, sports: "BADMINTON", name: "South Mumbai Badminton Arena", location: "South Mumbai, Mumbai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 46, badge: "FEATURED", rating: 4.4, sports: "LAWN TENNIS", name: "South Mumbai Lawn tennis Arena", location: "South Mumbai, Mumbai", image: "/assets/venues/turf-4.webp" },
  { id: 47, badge: "POPULAR", rating: 4.5, sports: "VOLLEYBALL", name: "South Mumbai Volleyball Arena", location: "South Mumbai, Mumbai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 48, badge: "NEW", rating: 4.5, sports: "PADEL", name: "South Mumbai Padel Arena", location: "South Mumbai, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 49, badge: "PROMOTED", rating: 4.3, sports: "FOOTBALL", name: "Malad Football Arena", location: "Malad, Mumbai", image: "/assets/venues/elite_turf_football.png" },
  { id: 50, badge: "PROMOTED", rating: 4.7, sports: "CRICKET", name: "Malad Cricket Box", location: "Malad, Mumbai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 51, badge: "FEATURED", rating: 4.4, sports: "BADMINTON", name: "Malad Badminton Arena", location: "Malad, Mumbai", image: "/assets/venues/turf-3.webp" },
  { id: 52, badge: "FAST FILLING", rating: 4.8, sports: "LAWN TENNIS", name: "Malad Lawn tennis Arena", location: "Malad, Mumbai", image: "/assets/venues/turf-6.webp" },
  { id: 53, badge: "POPULAR", rating: 4.6, sports: "VOLLEYBALL", name: "Malad Volleyball Arena", location: "Malad, Mumbai", image: "/assets/venues/turf-5.webp" },
  { id: 54, badge: "TOP RATED", rating: 4.8, sports: "PADEL", name: "Malad Padel Arena", location: "Malad, Mumbai", image: "/assets/venues/turf-4.webp" },
  { id: 55, badge: "PROMOTED", rating: 4.6, sports: "FOOTBALL", name: "Borivali Football Arena", location: "Borivali, Mumbai", image: "/assets/venues/new_football_turf.png" },
  { id: 56, badge: "TOP RATED", rating: 4.3, sports: "CRICKET", name: "Borivali Cricket Box", location: "Borivali, Mumbai", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 57, badge: "FAST FILLING", rating: 4.3, sports: "BADMINTON", name: "Borivali Badminton Arena", location: "Borivali, Mumbai", image: "/assets/venues/new_badminton_turf.png" },
  { id: 58, badge: "NEW", rating: 4.7, sports: "LAWN TENNIS", name: "Borivali Lawn tennis Arena", location: "Borivali, Mumbai", image: "/assets/venues/turf-6.webp" },
  { id: 59, badge: "TOP RATED", rating: 4.4, sports: "VOLLEYBALL", name: "Borivali Volleyball Arena", location: "Borivali, Mumbai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 60, badge: "TOP RATED", rating: 5.0, sports: "PADEL", name: "Borivali Padel Arena", location: "Borivali, Mumbai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 61, badge: "POPULAR", rating: 4.4, sports: "FOOTBALL", name: "Connaught Place Football Arena", location: "Connaught Place, Delhi-NCR", image: "/assets/venues/new_football_turf_2.png" },
  { id: 62, badge: "TOP RATED", rating: 4.9, sports: "CRICKET", name: "Connaught Place Cricket Box", location: "Connaught Place, Delhi-NCR", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 63, badge: "PROMOTED", rating: 4.5, sports: "BADMINTON", name: "Connaught Place Badminton Arena", location: "Connaught Place, Delhi-NCR", image: "/assets/venues/turf-3.webp" },
  { id: 64, badge: "FAST FILLING", rating: 4.9, sports: "LAWN TENNIS", name: "Connaught Place Lawn tennis Arena", location: "Connaught Place, Delhi-NCR", image: "/assets/venues/new_tennis_turf.png" },
  { id: 65, badge: "NEW", rating: 4.9, sports: "VOLLEYBALL", name: "Connaught Place Volleyball Arena", location: "Connaught Place, Delhi-NCR", image: "/assets/venues/turf-5.webp" },
  { id: 66, badge: "TOP RATED", rating: 4.9, sports: "PADEL", name: "Connaught Place Padel Arena", location: "Connaught Place, Delhi-NCR", image: "/assets/venues/turf-4.webp" },
  { id: 67, badge: "FAST FILLING", rating: 4.4, sports: "FOOTBALL", name: "South Ex Football Arena", location: "South Ex, Delhi-NCR", image: "/assets/venues/new_football_turf_2.png" },
  { id: 68, badge: "FAST FILLING", rating: 4.5, sports: "CRICKET", name: "South Ex Cricket Box", location: "South Ex, Delhi-NCR", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 69, badge: "FAST FILLING", rating: 4.5, sports: "BADMINTON", name: "South Ex Badminton Arena", location: "South Ex, Delhi-NCR", image: "/assets/venues/turf-3.webp" },
  { id: 70, badge: "FAST FILLING", rating: 4.7, sports: "LAWN TENNIS", name: "South Ex Lawn tennis Arena", location: "South Ex, Delhi-NCR", image: "/assets/venues/turf-6.webp" },
  { id: 71, badge: "POPULAR", rating: 4.7, sports: "VOLLEYBALL", name: "South Ex Volleyball Arena", location: "South Ex, Delhi-NCR", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 72, badge: "POPULAR", rating: 5.0, sports: "PADEL", name: "South Ex Padel Arena", location: "South Ex, Delhi-NCR", image: "/assets/venues/turf-1.webp" },
  { id: 73, badge: "FAST FILLING", rating: 4.5, sports: "FOOTBALL", name: "Vasant Kunj Football Arena", location: "Vasant Kunj, Delhi-NCR", image: "/assets/venues/elite_turf_football.png" },
  { id: 74, badge: "TOP RATED", rating: 4.8, sports: "CRICKET", name: "Vasant Kunj Cricket Box", location: "Vasant Kunj, Delhi-NCR", image: "/assets/venues/turf-2.webp" },
  { id: 75, badge: "NEW", rating: 4.2, sports: "BADMINTON", name: "Vasant Kunj Badminton Arena", location: "Vasant Kunj, Delhi-NCR", image: "/assets/venues/turf-3.webp" },
  { id: 76, badge: "FAST FILLING", rating: 4.7, sports: "LAWN TENNIS", name: "Vasant Kunj Lawn tennis Arena", location: "Vasant Kunj, Delhi-NCR", image: "/assets/venues/turf-6.webp" },
  { id: 77, badge: "TOP RATED", rating: 4.4, sports: "VOLLEYBALL", name: "Vasant Kunj Volleyball Arena", location: "Vasant Kunj, Delhi-NCR", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 78, badge: "PROMOTED", rating: 4.3, sports: "PADEL", name: "Vasant Kunj Padel Arena", location: "Vasant Kunj, Delhi-NCR", image: "/assets/venues/turf-1.webp" },
  { id: 79, badge: "TOP RATED", rating: 4.4, sports: "FOOTBALL", name: "Gurugram Football Arena", location: "Gurugram, Delhi-NCR", image: "/assets/venues/elite_turf_football.png" },
  { id: 80, badge: "POPULAR", rating: 4.4, sports: "CRICKET", name: "Gurugram Cricket Box", location: "Gurugram, Delhi-NCR", image: "/assets/venues/new_cricket_turf.png" },
  { id: 81, badge: "PROMOTED", rating: 4.8, sports: "BADMINTON", name: "Gurugram Badminton Arena", location: "Gurugram, Delhi-NCR", image: "/assets/venues/new_badminton_turf.png" },
  { id: 82, badge: "FEATURED", rating: 4.3, sports: "LAWN TENNIS", name: "Gurugram Lawn tennis Arena", location: "Gurugram, Delhi-NCR", image: "/assets/venues/turf-6.webp" },
  { id: 83, badge: "NEW", rating: 4.6, sports: "VOLLEYBALL", name: "Gurugram Volleyball Arena", location: "Gurugram, Delhi-NCR", image: "/assets/venues/turf-5.webp" },
  { id: 84, badge: "PROMOTED", rating: 4.5, sports: "PADEL", name: "Gurugram Padel Arena", location: "Gurugram, Delhi-NCR", image: "/assets/venues/turf-1.webp" },
  { id: 85, badge: "POPULAR", rating: 4.2, sports: "FOOTBALL", name: "Noida Football Arena", location: "Noida, Delhi-NCR", image: "/assets/venues/new_football_turf_2.png" },
  { id: 86, badge: "FAST FILLING", rating: 4.5, sports: "CRICKET", name: "Noida Cricket Box", location: "Noida, Delhi-NCR", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 87, badge: "PROMOTED", rating: 4.6, sports: "BADMINTON", name: "Noida Badminton Arena", location: "Noida, Delhi-NCR", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 88, badge: "POPULAR", rating: 4.2, sports: "LAWN TENNIS", name: "Noida Lawn tennis Arena", location: "Noida, Delhi-NCR", image: "/assets/venues/turf-4.webp" },
  { id: 89, badge: "PROMOTED", rating: 4.5, sports: "VOLLEYBALL", name: "Noida Volleyball Arena", location: "Noida, Delhi-NCR", image: "/assets/venues/turf-5.webp" },
  { id: 90, badge: "NEW", rating: 4.8, sports: "PADEL", name: "Noida Padel Arena", location: "Noida, Delhi-NCR", image: "/assets/venues/turf-4.webp" },
  { id: 91, badge: "PROMOTED", rating: 4.2, sports: "FOOTBALL", name: "Dwarka Football Arena", location: "Dwarka, Delhi-NCR", image: "/assets/venues/new_football_turf.png" },
  { id: 92, badge: "TOP RATED", rating: 5.0, sports: "CRICKET", name: "Dwarka Cricket Box", location: "Dwarka, Delhi-NCR", image: "/assets/venues/new_cricket_turf.png" },
  { id: 93, badge: "FAST FILLING", rating: 4.8, sports: "BADMINTON", name: "Dwarka Badminton Arena", location: "Dwarka, Delhi-NCR", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 94, badge: "POPULAR", rating: 4.5, sports: "LAWN TENNIS", name: "Dwarka Lawn tennis Arena", location: "Dwarka, Delhi-NCR", image: "/assets/venues/new_tennis_turf.png" },
  { id: 95, badge: "FAST FILLING", rating: 4.9, sports: "VOLLEYBALL", name: "Dwarka Volleyball Arena", location: "Dwarka, Delhi-NCR", image: "/assets/venues/turf-5.webp" },
  { id: 96, badge: "TOP RATED", rating: 4.5, sports: "PADEL", name: "Dwarka Padel Arena", location: "Dwarka, Delhi-NCR", image: "/assets/venues/new_football_turf_2.png" },
  { id: 97, badge: "TOP RATED", rating: 5.0, sports: "FOOTBALL", name: "Rohini Football Arena", location: "Rohini, Delhi-NCR", image: "/assets/venues/turf-1.webp" },
  { id: 98, badge: "TOP RATED", rating: 4.9, sports: "CRICKET", name: "Rohini Cricket Box", location: "Rohini, Delhi-NCR", image: "/assets/venues/new_cricket_turf.png" },
  { id: 99, badge: "POPULAR", rating: 5.0, sports: "BADMINTON", name: "Rohini Badminton Arena", location: "Rohini, Delhi-NCR", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 100, badge: "NEW", rating: 4.9, sports: "LAWN TENNIS", name: "Rohini Lawn tennis Arena", location: "Rohini, Delhi-NCR", image: "/assets/venues/new_tennis_turf.png" },
  { id: 101, badge: "FAST FILLING", rating: 4.8, sports: "VOLLEYBALL", name: "Rohini Volleyball Arena", location: "Rohini, Delhi-NCR", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 102, badge: "TOP RATED", rating: 4.4, sports: "PADEL", name: "Rohini Padel Arena", location: "Rohini, Delhi-NCR", image: "/assets/venues/turf-4.webp" },
  { id: 103, badge: "NEW", rating: 4.2, sports: "FOOTBALL", name: "Koramangala Football Arena", location: "Koramangala, Bengaluru", image: "/assets/venues/elite_turf_football.png" },
  { id: 104, badge: "TOP RATED", rating: 4.4, sports: "CRICKET", name: "Koramangala Cricket Box", location: "Koramangala, Bengaluru", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 105, badge: "FAST FILLING", rating: 4.4, sports: "BADMINTON", name: "Koramangala Badminton Arena", location: "Koramangala, Bengaluru", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 106, badge: "TOP RATED", rating: 4.5, sports: "LAWN TENNIS", name: "Koramangala Lawn tennis Arena", location: "Koramangala, Bengaluru", image: "/assets/venues/new_tennis_turf.png" },
  { id: 107, badge: "NEW", rating: 4.7, sports: "VOLLEYBALL", name: "Koramangala Volleyball Arena", location: "Koramangala, Bengaluru", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 108, badge: "FAST FILLING", rating: 4.7, sports: "PADEL", name: "Koramangala Padel Arena", location: "Koramangala, Bengaluru", image: "/assets/venues/turf-1.webp" },
  { id: 109, badge: "NEW", rating: 4.5, sports: "FOOTBALL", name: "Indiranagar Football Arena", location: "Indiranagar, Bengaluru", image: "/assets/venues/turf-1.webp" },
  { id: 110, badge: "NEW", rating: 5.0, sports: "CRICKET", name: "Indiranagar Cricket Box", location: "Indiranagar, Bengaluru", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 111, badge: "NEW", rating: 4.4, sports: "BADMINTON", name: "Indiranagar Badminton Arena", location: "Indiranagar, Bengaluru", image: "/assets/venues/new_badminton_turf.png" },
  { id: 112, badge: "FEATURED", rating: 4.9, sports: "LAWN TENNIS", name: "Indiranagar Lawn tennis Arena", location: "Indiranagar, Bengaluru", image: "/assets/venues/turf-6.webp" },
  { id: 113, badge: "FAST FILLING", rating: 5.0, sports: "VOLLEYBALL", name: "Indiranagar Volleyball Arena", location: "Indiranagar, Bengaluru", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 114, badge: "FEATURED", rating: 4.7, sports: "PADEL", name: "Indiranagar Padel Arena", location: "Indiranagar, Bengaluru", image: "/assets/venues/new_football_turf_2.png" },
  { id: 115, badge: "TOP RATED", rating: 4.8, sports: "FOOTBALL", name: "HSR Layout Football Arena", location: "HSR Layout, Bengaluru", image: "/assets/venues/new_football_turf.png" },
  { id: 116, badge: "NEW", rating: 4.8, sports: "CRICKET", name: "HSR Layout Cricket Box", location: "HSR Layout, Bengaluru", image: "/assets/venues/new_cricket_turf.png" },
  { id: 117, badge: "FEATURED", rating: 4.6, sports: "BADMINTON", name: "HSR Layout Badminton Arena", location: "HSR Layout, Bengaluru", image: "/assets/venues/turf-3.webp" },
  { id: 118, badge: "NEW", rating: 4.6, sports: "LAWN TENNIS", name: "HSR Layout Lawn tennis Arena", location: "HSR Layout, Bengaluru", image: "/assets/venues/turf-6.webp" },
  { id: 119, badge: "TOP RATED", rating: 4.9, sports: "VOLLEYBALL", name: "HSR Layout Volleyball Arena", location: "HSR Layout, Bengaluru", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 120, badge: "PROMOTED", rating: 4.7, sports: "PADEL", name: "HSR Layout Padel Arena", location: "HSR Layout, Bengaluru", image: "/assets/venues/turf-1.webp" },
  { id: 121, badge: "FAST FILLING", rating: 4.5, sports: "FOOTBALL", name: "Whitefield Football Arena", location: "Whitefield, Bengaluru", image: "/assets/venues/new_football_turf_2.png" },
  { id: 122, badge: "TOP RATED", rating: 4.9, sports: "CRICKET", name: "Whitefield Cricket Box", location: "Whitefield, Bengaluru", image: "/assets/venues/new_cricket_turf.png" },
  { id: 123, badge: "TOP RATED", rating: 4.7, sports: "BADMINTON", name: "Whitefield Badminton Arena", location: "Whitefield, Bengaluru", image: "/assets/venues/new_badminton_turf.png" },
  { id: 124, badge: "NEW", rating: 4.8, sports: "LAWN TENNIS", name: "Whitefield Lawn tennis Arena", location: "Whitefield, Bengaluru", image: "/assets/venues/turf-4.webp" },
  { id: 125, badge: "PROMOTED", rating: 4.5, sports: "VOLLEYBALL", name: "Whitefield Volleyball Arena", location: "Whitefield, Bengaluru", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 126, badge: "POPULAR", rating: 4.5, sports: "PADEL", name: "Whitefield Padel Arena", location: "Whitefield, Bengaluru", image: "/assets/venues/turf-1.webp" },
  { id: 127, badge: "PROMOTED", rating: 4.8, sports: "FOOTBALL", name: "Jayanagar Football Arena", location: "Jayanagar, Bengaluru", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 128, badge: "POPULAR", rating: 4.2, sports: "CRICKET", name: "Jayanagar Cricket Box", location: "Jayanagar, Bengaluru", image: "/assets/venues/turf-2.webp" },
  { id: 129, badge: "FEATURED", rating: 4.3, sports: "BADMINTON", name: "Jayanagar Badminton Arena", location: "Jayanagar, Bengaluru", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 130, badge: "FEATURED", rating: 4.7, sports: "LAWN TENNIS", name: "Jayanagar Lawn tennis Arena", location: "Jayanagar, Bengaluru", image: "/assets/venues/turf-6.webp" },
  { id: 131, badge: "POPULAR", rating: 4.2, sports: "VOLLEYBALL", name: "Jayanagar Volleyball Arena", location: "Jayanagar, Bengaluru", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 132, badge: "TOP RATED", rating: 4.2, sports: "PADEL", name: "Jayanagar Padel Arena", location: "Jayanagar, Bengaluru", image: "/assets/venues/turf-4.webp" },
  { id: 133, badge: "PROMOTED", rating: 4.5, sports: "FOOTBALL", name: "Malleswaram Football Arena", location: "Malleswaram, Bengaluru", image: "/assets/venues/turf-1.webp" },
  { id: 134, badge: "TOP RATED", rating: 4.5, sports: "CRICKET", name: "Malleswaram Cricket Box", location: "Malleswaram, Bengaluru", image: "/assets/venues/turf-2.webp" },
  { id: 135, badge: "FAST FILLING", rating: 4.6, sports: "BADMINTON", name: "Malleswaram Badminton Arena", location: "Malleswaram, Bengaluru", image: "/assets/venues/new_badminton_turf.png" },
  { id: 136, badge: "FAST FILLING", rating: 4.4, sports: "LAWN TENNIS", name: "Malleswaram Lawn tennis Arena", location: "Malleswaram, Bengaluru", image: "/assets/venues/new_tennis_turf.png" },
  { id: 137, badge: "FEATURED", rating: 4.5, sports: "VOLLEYBALL", name: "Malleswaram Volleyball Arena", location: "Malleswaram, Bengaluru", image: "/assets/venues/turf-5.webp" },
  { id: 138, badge: "NEW", rating: 4.4, sports: "PADEL", name: "Malleswaram Padel Arena", location: "Malleswaram, Bengaluru", image: "/assets/venues/new_football_turf_2.png" },
  { id: 139, badge: "POPULAR", rating: 4.7, sports: "FOOTBALL", name: "Electronic City Football Arena", location: "Electronic City, Bengaluru", image: "/assets/venues/elite_turf_football.png" },
  { id: 140, badge: "TOP RATED", rating: 4.5, sports: "CRICKET", name: "Electronic City Cricket Box", location: "Electronic City, Bengaluru", image: "/assets/venues/new_cricket_turf.png" },
  { id: 141, badge: "NEW", rating: 4.2, sports: "BADMINTON", name: "Electronic City Badminton Arena", location: "Electronic City, Bengaluru", image: "/assets/venues/new_badminton_turf.png" },
  { id: 142, badge: "POPULAR", rating: 4.9, sports: "LAWN TENNIS", name: "Electronic City Lawn tennis Arena", location: "Electronic City, Bengaluru", image: "/assets/venues/turf-6.webp" },
  { id: 143, badge: "TOP RATED", rating: 4.4, sports: "VOLLEYBALL", name: "Electronic City Volleyball Arena", location: "Electronic City, Bengaluru", image: "/assets/venues/turf-5.webp" },
  { id: 144, badge: "FEATURED", rating: 4.8, sports: "PADEL", name: "Electronic City Padel Arena", location: "Electronic City, Bengaluru", image: "/assets/venues/turf-4.webp" },
  { id: 145, badge: "POPULAR", rating: 4.4, sports: "FOOTBALL", name: "Yelahanka Football Arena", location: "Yelahanka, Bengaluru", image: "/assets/venues/new_football_turf.png" },
  { id: 146, badge: "TOP RATED", rating: 5.0, sports: "CRICKET", name: "Yelahanka Cricket Box", location: "Yelahanka, Bengaluru", image: "/assets/venues/new_cricket_turf.png" },
  { id: 147, badge: "PROMOTED", rating: 5.0, sports: "BADMINTON", name: "Yelahanka Badminton Arena", location: "Yelahanka, Bengaluru", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 148, badge: "TOP RATED", rating: 4.6, sports: "LAWN TENNIS", name: "Yelahanka Lawn tennis Arena", location: "Yelahanka, Bengaluru", image: "/assets/venues/new_tennis_turf.png" },
  { id: 149, badge: "POPULAR", rating: 4.4, sports: "VOLLEYBALL", name: "Yelahanka Volleyball Arena", location: "Yelahanka, Bengaluru", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 150, badge: "FEATURED", rating: 4.7, sports: "PADEL", name: "Yelahanka Padel Arena", location: "Yelahanka, Bengaluru", image: "/assets/venues/new_football_turf_2.png" },
  { id: 151, badge: "PROMOTED", rating: 4.3, sports: "FOOTBALL", name: "Banjara Hills Football Arena", location: "Banjara Hills, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 152, badge: "NEW", rating: 4.6, sports: "CRICKET", name: "Banjara Hills Cricket Box", location: "Banjara Hills, Hyderabad", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 153, badge: "NEW", rating: 4.4, sports: "BADMINTON", name: "Banjara Hills Badminton Arena", location: "Banjara Hills, Hyderabad", image: "/assets/venues/new_badminton_turf.png" },
  { id: 154, badge: "PROMOTED", rating: 4.9, sports: "LAWN TENNIS", name: "Banjara Hills Lawn tennis Arena", location: "Banjara Hills, Hyderabad", image: "/assets/venues/new_tennis_turf.png" },
  { id: 155, badge: "PROMOTED", rating: 4.3, sports: "VOLLEYBALL", name: "Banjara Hills Volleyball Arena", location: "Banjara Hills, Hyderabad", image: "/assets/venues/turf-5.webp" },
  { id: 156, badge: "NEW", rating: 4.8, sports: "PADEL", name: "Banjara Hills Padel Arena", location: "Banjara Hills, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 157, badge: "FAST FILLING", rating: 5.0, sports: "FOOTBALL", name: "Jubilee Hills Football Arena", location: "Jubilee Hills, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 158, badge: "FEATURED", rating: 4.4, sports: "CRICKET", name: "Jubilee Hills Cricket Box", location: "Jubilee Hills, Hyderabad", image: "/assets/venues/turf-2.webp" },
  { id: 159, badge: "PROMOTED", rating: 4.6, sports: "BADMINTON", name: "Jubilee Hills Badminton Arena", location: "Jubilee Hills, Hyderabad", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 160, badge: "NEW", rating: 4.3, sports: "LAWN TENNIS", name: "Jubilee Hills Lawn tennis Arena", location: "Jubilee Hills, Hyderabad", image: "/assets/venues/turf-4.webp" },
  { id: 161, badge: "TOP RATED", rating: 4.2, sports: "VOLLEYBALL", name: "Jubilee Hills Volleyball Arena", location: "Jubilee Hills, Hyderabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 162, badge: "PROMOTED", rating: 4.3, sports: "PADEL", name: "Jubilee Hills Padel Arena", location: "Jubilee Hills, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 163, badge: "FEATURED", rating: 4.8, sports: "FOOTBALL", name: "HITEC City Football Arena", location: "HITEC City, Hyderabad", image: "/assets/venues/elite_turf_football.png" },
  { id: 164, badge: "TOP RATED", rating: 4.7, sports: "CRICKET", name: "HITEC City Cricket Box", location: "HITEC City, Hyderabad", image: "/assets/venues/new_cricket_turf.png" },
  { id: 165, badge: "TOP RATED", rating: 4.5, sports: "BADMINTON", name: "HITEC City Badminton Arena", location: "HITEC City, Hyderabad", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 166, badge: "POPULAR", rating: 4.3, sports: "LAWN TENNIS", name: "HITEC City Lawn tennis Arena", location: "HITEC City, Hyderabad", image: "/assets/venues/new_tennis_turf.png" },
  { id: 167, badge: "NEW", rating: 4.3, sports: "VOLLEYBALL", name: "HITEC City Volleyball Arena", location: "HITEC City, Hyderabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 168, badge: "POPULAR", rating: 4.4, sports: "PADEL", name: "HITEC City Padel Arena", location: "HITEC City, Hyderabad", image: "/assets/venues/turf-1.webp" },
  { id: 169, badge: "NEW", rating: 5.0, sports: "FOOTBALL", name: "Gachibowli Football Arena", location: "Gachibowli, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 170, badge: "TOP RATED", rating: 4.6, sports: "CRICKET", name: "Gachibowli Cricket Box", location: "Gachibowli, Hyderabad", image: "/assets/venues/turf-2.webp" },
  { id: 171, badge: "TOP RATED", rating: 4.9, sports: "BADMINTON", name: "Gachibowli Badminton Arena", location: "Gachibowli, Hyderabad", image: "/assets/venues/turf-3.webp" },
  { id: 172, badge: "NEW", rating: 4.4, sports: "LAWN TENNIS", name: "Gachibowli Lawn tennis Arena", location: "Gachibowli, Hyderabad", image: "/assets/venues/new_tennis_turf.png" },
  { id: 173, badge: "POPULAR", rating: 4.9, sports: "VOLLEYBALL", name: "Gachibowli Volleyball Arena", location: "Gachibowli, Hyderabad", image: "/assets/venues/turf-5.webp" },
  { id: 174, badge: "PROMOTED", rating: 4.2, sports: "PADEL", name: "Gachibowli Padel Arena", location: "Gachibowli, Hyderabad", image: "/assets/venues/turf-4.webp" },
  { id: 175, badge: "POPULAR", rating: 4.6, sports: "FOOTBALL", name: "Madhapur Football Arena", location: "Madhapur, Hyderabad", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 176, badge: "FEATURED", rating: 5.0, sports: "CRICKET", name: "Madhapur Cricket Box", location: "Madhapur, Hyderabad", image: "/assets/venues/new_cricket_turf.png" },
  { id: 177, badge: "TOP RATED", rating: 4.5, sports: "BADMINTON", name: "Madhapur Badminton Arena", location: "Madhapur, Hyderabad", image: "/assets/venues/new_badminton_turf.png" },
  { id: 178, badge: "POPULAR", rating: 4.4, sports: "LAWN TENNIS", name: "Madhapur Lawn tennis Arena", location: "Madhapur, Hyderabad", image: "/assets/venues/turf-4.webp" },
  { id: 179, badge: "POPULAR", rating: 4.7, sports: "VOLLEYBALL", name: "Madhapur Volleyball Arena", location: "Madhapur, Hyderabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 180, badge: "FAST FILLING", rating: 5.0, sports: "PADEL", name: "Madhapur Padel Arena", location: "Madhapur, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 181, badge: "POPULAR", rating: 4.5, sports: "FOOTBALL", name: "Kondapur Football Arena", location: "Kondapur, Hyderabad", image: "/assets/venues/new_football_turf.png" },
  { id: 182, badge: "POPULAR", rating: 4.4, sports: "CRICKET", name: "Kondapur Cricket Box", location: "Kondapur, Hyderabad", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 183, badge: "TOP RATED", rating: 4.4, sports: "BADMINTON", name: "Kondapur Badminton Arena", location: "Kondapur, Hyderabad", image: "/assets/venues/new_badminton_turf.png" },
  { id: 184, badge: "PROMOTED", rating: 4.5, sports: "LAWN TENNIS", name: "Kondapur Lawn tennis Arena", location: "Kondapur, Hyderabad", image: "/assets/venues/turf-6.webp" },
  { id: 185, badge: "PROMOTED", rating: 4.6, sports: "VOLLEYBALL", name: "Kondapur Volleyball Arena", location: "Kondapur, Hyderabad", image: "/assets/venues/turf-5.webp" },
  { id: 186, badge: "NEW", rating: 4.4, sports: "PADEL", name: "Kondapur Padel Arena", location: "Kondapur, Hyderabad", image: "/assets/venues/turf-1.webp" },
  { id: 187, badge: "PROMOTED", rating: 4.2, sports: "FOOTBALL", name: "Secunderabad Football Arena", location: "Secunderabad, Hyderabad", image: "/assets/venues/elite_turf_football.png" },
  { id: 188, badge: "PROMOTED", rating: 4.9, sports: "CRICKET", name: "Secunderabad Cricket Box", location: "Secunderabad, Hyderabad", image: "/assets/venues/turf-2.webp" },
  { id: 189, badge: "PROMOTED", rating: 4.5, sports: "BADMINTON", name: "Secunderabad Badminton Arena", location: "Secunderabad, Hyderabad", image: "/assets/venues/new_badminton_turf.png" },
  { id: 190, badge: "PROMOTED", rating: 4.6, sports: "LAWN TENNIS", name: "Secunderabad Lawn tennis Arena", location: "Secunderabad, Hyderabad", image: "/assets/venues/turf-6.webp" },
  { id: 191, badge: "TOP RATED", rating: 4.6, sports: "VOLLEYBALL", name: "Secunderabad Volleyball Arena", location: "Secunderabad, Hyderabad", image: "/assets/venues/turf-5.webp" },
  { id: 192, badge: "PROMOTED", rating: 4.8, sports: "PADEL", name: "Secunderabad Padel Arena", location: "Secunderabad, Hyderabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 193, badge: "PROMOTED", rating: 4.9, sports: "FOOTBALL", name: "Sec 17 Football Arena", location: "Sector 17, Chandigarh", image: "/assets/venues/new_football_turf.png" },
  { id: 194, badge: "FAST FILLING", rating: 4.7, sports: "CRICKET", name: "Sec 17 Cricket Box", location: "Sector 17, Chandigarh", image: "/assets/venues/turf-2.webp" },
  { id: 195, badge: "POPULAR", rating: 4.6, sports: "BADMINTON", name: "Sec 17 Badminton Arena", location: "Sector 17, Chandigarh", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 196, badge: "PROMOTED", rating: 4.5, sports: "LAWN TENNIS", name: "Sec 17 Lawn tennis Arena", location: "Sector 17, Chandigarh", image: "/assets/venues/turf-6.webp" },
  { id: 197, badge: "FEATURED", rating: 4.7, sports: "VOLLEYBALL", name: "Sec 17 Volleyball Arena", location: "Sector 17, Chandigarh", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 198, badge: "NEW", rating: 4.4, sports: "PADEL", name: "Sec 17 Padel Arena", location: "Sector 17, Chandigarh", image: "/assets/venues/turf-4.webp" },
  { id: 199, badge: "TOP RATED", rating: 4.4, sports: "FOOTBALL", name: "Sec 22 Football Arena", location: "Sector 22, Chandigarh", image: "/assets/venues/new_football_turf.png" },
  { id: 200, badge: "POPULAR", rating: 4.8, sports: "CRICKET", name: "Sec 22 Cricket Box", location: "Sector 22, Chandigarh", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 201, badge: "PROMOTED", rating: 4.8, sports: "BADMINTON", name: "Sec 22 Badminton Arena", location: "Sector 22, Chandigarh", image: "/assets/venues/turf-3.webp" },
  { id: 202, badge: "FAST FILLING", rating: 4.6, sports: "LAWN TENNIS", name: "Sec 22 Lawn tennis Arena", location: "Sector 22, Chandigarh", image: "/assets/venues/turf-6.webp" },
  { id: 203, badge: "FEATURED", rating: 4.5, sports: "VOLLEYBALL", name: "Sec 22 Volleyball Arena", location: "Sector 22, Chandigarh", image: "/assets/venues/turf-5.webp" },
  { id: 204, badge: "PROMOTED", rating: 4.8, sports: "PADEL", name: "Sec 22 Padel Arena", location: "Sector 22, Chandigarh", image: "/assets/venues/new_football_turf_2.png" },
  { id: 205, badge: "POPULAR", rating: 4.4, sports: "FOOTBALL", name: "Sec 35 Football Arena", location: "Sector 35, Chandigarh", image: "/assets/venues/new_football_turf_2.png" },
  { id: 206, badge: "TOP RATED", rating: 4.8, sports: "CRICKET", name: "Sec 35 Cricket Box", location: "Sector 35, Chandigarh", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 207, badge: "FEATURED", rating: 4.3, sports: "BADMINTON", name: "Sec 35 Badminton Arena", location: "Sector 35, Chandigarh", image: "/assets/venues/turf-3.webp" },
  { id: 208, badge: "TOP RATED", rating: 4.9, sports: "LAWN TENNIS", name: "Sec 35 Lawn tennis Arena", location: "Sector 35, Chandigarh", image: "/assets/venues/turf-6.webp" },
  { id: 209, badge: "TOP RATED", rating: 4.5, sports: "VOLLEYBALL", name: "Sec 35 Volleyball Arena", location: "Sector 35, Chandigarh", image: "/assets/venues/turf-5.webp" },
  { id: 210, badge: "NEW", rating: 4.9, sports: "PADEL", name: "Sec 35 Padel Arena", location: "Sector 35, Chandigarh", image: "/assets/venues/turf-4.webp" },
  { id: 211, badge: "FAST FILLING", rating: 4.8, sports: "FOOTBALL", name: "Mohali Football Arena", location: "Mohali, Chandigarh", image: "/assets/venues/new_football_turf.png" },
  { id: 212, badge: "POPULAR", rating: 4.4, sports: "CRICKET", name: "Mohali Cricket Box", location: "Mohali, Chandigarh", image: "/assets/venues/new_cricket_turf.png" },
  { id: 213, badge: "PROMOTED", rating: 5.0, sports: "BADMINTON", name: "Mohali Badminton Arena", location: "Mohali, Chandigarh", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 214, badge: "TOP RATED", rating: 4.4, sports: "LAWN TENNIS", name: "Mohali Lawn tennis Arena", location: "Mohali, Chandigarh", image: "/assets/venues/turf-4.webp" },
  { id: 215, badge: "FAST FILLING", rating: 4.5, sports: "VOLLEYBALL", name: "Mohali Volleyball Arena", location: "Mohali, Chandigarh", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 216, badge: "FAST FILLING", rating: 4.9, sports: "PADEL", name: "Mohali Padel Arena", location: "Mohali, Chandigarh", image: "/assets/venues/turf-4.webp" },
  { id: 217, badge: "FAST FILLING", rating: 4.4, sports: "FOOTBALL", name: "Panchkula Football Arena", location: "Panchkula, Chandigarh", image: "/assets/venues/elite_turf_football.png" },
  { id: 218, badge: "TOP RATED", rating: 4.9, sports: "CRICKET", name: "Panchkula Cricket Box", location: "Panchkula, Chandigarh", image: "/assets/venues/new_cricket_turf.png" },
  { id: 219, badge: "FEATURED", rating: 4.4, sports: "BADMINTON", name: "Panchkula Badminton Arena", location: "Panchkula, Chandigarh", image: "/assets/venues/new_badminton_turf.png" },
  { id: 220, badge: "FAST FILLING", rating: 4.8, sports: "LAWN TENNIS", name: "Panchkula Lawn tennis Arena", location: "Panchkula, Chandigarh", image: "/assets/venues/turf-4.webp" },
  { id: 221, badge: "NEW", rating: 4.7, sports: "VOLLEYBALL", name: "Panchkula Volleyball Arena", location: "Panchkula, Chandigarh", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 222, badge: "PROMOTED", rating: 4.4, sports: "PADEL", name: "Panchkula Padel Arena", location: "Panchkula, Chandigarh", image: "/assets/venues/new_football_turf_2.png" },
  { id: 223, badge: "FEATURED", rating: 4.6, sports: "FOOTBALL", name: "Zirakpur Football Arena", location: "Zirakpur, Chandigarh", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 224, badge: "FAST FILLING", rating: 4.8, sports: "CRICKET", name: "Zirakpur Cricket Box", location: "Zirakpur, Chandigarh", image: "/assets/venues/new_cricket_turf.png" },
  { id: 225, badge: "NEW", rating: 4.8, sports: "BADMINTON", name: "Zirakpur Badminton Arena", location: "Zirakpur, Chandigarh", image: "/assets/venues/turf-3.webp" },
  { id: 226, badge: "TOP RATED", rating: 4.8, sports: "LAWN TENNIS", name: "Zirakpur Lawn tennis Arena", location: "Zirakpur, Chandigarh", image: "/assets/venues/turf-4.webp" },
  { id: 227, badge: "FEATURED", rating: 4.4, sports: "VOLLEYBALL", name: "Zirakpur Volleyball Arena", location: "Zirakpur, Chandigarh", image: "/assets/venues/turf-5.webp" },
  { id: 228, badge: "PROMOTED", rating: 4.3, sports: "PADEL", name: "Zirakpur Padel Arena", location: "Zirakpur, Chandigarh", image: "/assets/venues/turf-1.webp" },
  { id: 229, badge: "PROMOTED", rating: 4.6, sports: "FOOTBALL", name: "SG Highway Football Arena", location: "SG Highway, Ahmedabad", image: "/assets/venues/new_football_turf.png" },
  { id: 230, badge: "TOP RATED", rating: 4.9, sports: "CRICKET", name: "SG Highway Cricket Box", location: "SG Highway, Ahmedabad", image: "/assets/venues/new_cricket_turf.png" },
  { id: 231, badge: "POPULAR", rating: 4.7, sports: "BADMINTON", name: "SG Highway Badminton Arena", location: "SG Highway, Ahmedabad", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 232, badge: "POPULAR", rating: 4.8, sports: "LAWN TENNIS", name: "SG Highway Lawn tennis Arena", location: "SG Highway, Ahmedabad", image: "/assets/venues/turf-6.webp" },
  { id: 233, badge: "TOP RATED", rating: 4.5, sports: "VOLLEYBALL", name: "SG Highway Volleyball Arena", location: "SG Highway, Ahmedabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 234, badge: "PROMOTED", rating: 4.6, sports: "PADEL", name: "SG Highway Padel Arena", location: "SG Highway, Ahmedabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 235, badge: "TOP RATED", rating: 4.3, sports: "FOOTBALL", name: "Vastrapur Football Arena", location: "Vastrapur, Ahmedabad", image: "/assets/venues/elite_turf_football.png" },
  { id: 236, badge: "FAST FILLING", rating: 4.6, sports: "CRICKET", name: "Vastrapur Cricket Box", location: "Vastrapur, Ahmedabad", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 237, badge: "FAST FILLING", rating: 4.2, sports: "BADMINTON", name: "Vastrapur Badminton Arena", location: "Vastrapur, Ahmedabad", image: "/assets/venues/turf-3.webp" },
  { id: 238, badge: "PROMOTED", rating: 4.8, sports: "LAWN TENNIS", name: "Vastrapur Lawn tennis Arena", location: "Vastrapur, Ahmedabad", image: "/assets/venues/new_tennis_turf.png" },
  { id: 239, badge: "POPULAR", rating: 4.6, sports: "VOLLEYBALL", name: "Vastrapur Volleyball Arena", location: "Vastrapur, Ahmedabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 240, badge: "TOP RATED", rating: 4.9, sports: "PADEL", name: "Vastrapur Padel Arena", location: "Vastrapur, Ahmedabad", image: "/assets/venues/turf-1.webp" },
  { id: 241, badge: "PROMOTED", rating: 4.7, sports: "FOOTBALL", name: "Navrangpura Football Arena", location: "Navrangpura, Ahmedabad", image: "/assets/venues/turf-1.webp" },
  { id: 242, badge: "PROMOTED", rating: 4.2, sports: "CRICKET", name: "Navrangpura Cricket Box", location: "Navrangpura, Ahmedabad", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 243, badge: "TOP RATED", rating: 4.3, sports: "BADMINTON", name: "Navrangpura Badminton Arena", location: "Navrangpura, Ahmedabad", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 244, badge: "POPULAR", rating: 4.3, sports: "LAWN TENNIS", name: "Navrangpura Lawn tennis Arena", location: "Navrangpura, Ahmedabad", image: "/assets/venues/turf-4.webp" },
  { id: 245, badge: "FEATURED", rating: 4.5, sports: "VOLLEYBALL", name: "Navrangpura Volleyball Arena", location: "Navrangpura, Ahmedabad", image: "/assets/venues/turf-5.webp" },
  { id: 246, badge: "FEATURED", rating: 4.5, sports: "PADEL", name: "Navrangpura Padel Arena", location: "Navrangpura, Ahmedabad", image: "/assets/venues/turf-4.webp" },
  { id: 247, badge: "FEATURED", rating: 4.6, sports: "FOOTBALL", name: "Satellite Football Arena", location: "Satellite, Ahmedabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 248, badge: "POPULAR", rating: 5.0, sports: "CRICKET", name: "Satellite Cricket Box", location: "Satellite, Ahmedabad", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 249, badge: "FEATURED", rating: 4.8, sports: "BADMINTON", name: "Satellite Badminton Arena", location: "Satellite, Ahmedabad", image: "/assets/venues/new_badminton_turf.png" },
  { id: 250, badge: "POPULAR", rating: 4.2, sports: "LAWN TENNIS", name: "Satellite Lawn tennis Arena", location: "Satellite, Ahmedabad", image: "/assets/venues/turf-6.webp" },
  { id: 251, badge: "FEATURED", rating: 4.5, sports: "VOLLEYBALL", name: "Satellite Volleyball Arena", location: "Satellite, Ahmedabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 252, badge: "POPULAR", rating: 4.3, sports: "PADEL", name: "Satellite Padel Arena", location: "Satellite, Ahmedabad", image: "/assets/venues/turf-4.webp" },
  { id: 253, badge: "FAST FILLING", rating: 4.4, sports: "FOOTBALL", name: "Bopal Football Arena", location: "Bopal, Ahmedabad", image: "/assets/venues/elite_turf_football.png" },
  { id: 254, badge: "FAST FILLING", rating: 4.5, sports: "CRICKET", name: "Bopal Cricket Box", location: "Bopal, Ahmedabad", image: "/assets/venues/turf-2.webp" },
  { id: 255, badge: "POPULAR", rating: 4.6, sports: "BADMINTON", name: "Bopal Badminton Arena", location: "Bopal, Ahmedabad", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 256, badge: "TOP RATED", rating: 4.5, sports: "LAWN TENNIS", name: "Bopal Lawn tennis Arena", location: "Bopal, Ahmedabad", image: "/assets/venues/turf-6.webp" },
  { id: 257, badge: "NEW", rating: 4.9, sports: "VOLLEYBALL", name: "Bopal Volleyball Arena", location: "Bopal, Ahmedabad", image: "/assets/venues/turf-5.webp" },
  { id: 258, badge: "NEW", rating: 4.3, sports: "PADEL", name: "Bopal Padel Arena", location: "Bopal, Ahmedabad", image: "/assets/venues/turf-1.webp" },
  { id: 259, badge: "NEW", rating: 5.0, sports: "FOOTBALL", name: "Prahlad Nagar Football Arena", location: "Prahlad Nagar, Ahmedabad", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 260, badge: "PROMOTED", rating: 4.8, sports: "CRICKET", name: "Prahlad Nagar Cricket Box", location: "Prahlad Nagar, Ahmedabad", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 261, badge: "TOP RATED", rating: 4.8, sports: "BADMINTON", name: "Prahlad Nagar Badminton Arena", location: "Prahlad Nagar, Ahmedabad", image: "/assets/venues/new_badminton_turf.png" },
  { id: 262, badge: "TOP RATED", rating: 4.3, sports: "LAWN TENNIS", name: "Prahlad Nagar Lawn tennis Arena", location: "Prahlad Nagar, Ahmedabad", image: "/assets/venues/turf-6.webp" },
  { id: 263, badge: "NEW", rating: 4.4, sports: "VOLLEYBALL", name: "Prahlad Nagar Volleyball Arena", location: "Prahlad Nagar, Ahmedabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 264, badge: "NEW", rating: 4.6, sports: "PADEL", name: "Prahlad Nagar Padel Arena", location: "Prahlad Nagar, Ahmedabad", image: "/assets/venues/new_football_turf_2.png" },
  { id: 265, badge: "FEATURED", rating: 4.7, sports: "FOOTBALL", name: "Maninagar Football Arena", location: "Maninagar, Ahmedabad", image: "/assets/venues/turf-1.webp" },
  { id: 266, badge: "FAST FILLING", rating: 4.3, sports: "CRICKET", name: "Maninagar Cricket Box", location: "Maninagar, Ahmedabad", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 267, badge: "PROMOTED", rating: 4.4, sports: "BADMINTON", name: "Maninagar Badminton Arena", location: "Maninagar, Ahmedabad", image: "/assets/venues/turf-3.webp" },
  { id: 268, badge: "FAST FILLING", rating: 4.6, sports: "LAWN TENNIS", name: "Maninagar Lawn tennis Arena", location: "Maninagar, Ahmedabad", image: "/assets/venues/turf-6.webp" },
  { id: 269, badge: "TOP RATED", rating: 4.3, sports: "VOLLEYBALL", name: "Maninagar Volleyball Arena", location: "Maninagar, Ahmedabad", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 270, badge: "POPULAR", rating: 4.5, sports: "PADEL", name: "Maninagar Padel Arena", location: "Maninagar, Ahmedabad", image: "/assets/venues/turf-4.webp" },
  { id: 271, badge: "FAST FILLING", rating: 4.5, sports: "FOOTBALL", name: "Koregaon Park Football Arena", location: "Koregaon Park, Pune", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 272, badge: "POPULAR", rating: 5.0, sports: "CRICKET", name: "Koregaon Park Cricket Box", location: "Koregaon Park, Pune", image: "/assets/venues/turf-2.webp" },
  { id: 273, badge: "NEW", rating: 4.7, sports: "BADMINTON", name: "Koregaon Park Badminton Arena", location: "Koregaon Park, Pune", image: "/assets/venues/turf-3.webp" },
  { id: 274, badge: "NEW", rating: 4.3, sports: "LAWN TENNIS", name: "Koregaon Park Lawn tennis Arena", location: "Koregaon Park, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 275, badge: "PROMOTED", rating: 4.4, sports: "VOLLEYBALL", name: "Koregaon Park Volleyball Arena", location: "Koregaon Park, Pune", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 276, badge: "FAST FILLING", rating: 4.9, sports: "PADEL", name: "Koregaon Park Padel Arena", location: "Koregaon Park, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 277, badge: "FAST FILLING", rating: 4.3, sports: "FOOTBALL", name: "Viman Nagar Football Arena", location: "Viman Nagar, Pune", image: "/assets/venues/new_football_turf.png" },
  { id: 278, badge: "FAST FILLING", rating: 4.4, sports: "CRICKET", name: "Viman Nagar Cricket Box", location: "Viman Nagar, Pune", image: "/assets/venues/new_cricket_turf.png" },
  { id: 279, badge: "PROMOTED", rating: 4.2, sports: "BADMINTON", name: "Viman Nagar Badminton Arena", location: "Viman Nagar, Pune", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 280, badge: "POPULAR", rating: 4.6, sports: "LAWN TENNIS", name: "Viman Nagar Lawn tennis Arena", location: "Viman Nagar, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 281, badge: "FAST FILLING", rating: 4.7, sports: "VOLLEYBALL", name: "Viman Nagar Volleyball Arena", location: "Viman Nagar, Pune", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 282, badge: "POPULAR", rating: 4.4, sports: "PADEL", name: "Viman Nagar Padel Arena", location: "Viman Nagar, Pune", image: "/assets/venues/new_football_turf_2.png" },
  { id: 283, badge: "FEATURED", rating: 4.7, sports: "FOOTBALL", name: "Kalyani Nagar Football Arena", location: "Kalyani Nagar, Pune", image: "/assets/venues/elite_turf_football.png" },
  { id: 284, badge: "FAST FILLING", rating: 5.0, sports: "CRICKET", name: "Kalyani Nagar Cricket Box", location: "Kalyani Nagar, Pune", image: "/assets/venues/new_cricket_turf.png" },
  { id: 285, badge: "POPULAR", rating: 4.2, sports: "BADMINTON", name: "Kalyani Nagar Badminton Arena", location: "Kalyani Nagar, Pune", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 286, badge: "TOP RATED", rating: 4.4, sports: "LAWN TENNIS", name: "Kalyani Nagar Lawn tennis Arena", location: "Kalyani Nagar, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 287, badge: "FEATURED", rating: 4.5, sports: "VOLLEYBALL", name: "Kalyani Nagar Volleyball Arena", location: "Kalyani Nagar, Pune", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 288, badge: "FEATURED", rating: 4.4, sports: "PADEL", name: "Kalyani Nagar Padel Arena", location: "Kalyani Nagar, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 289, badge: "POPULAR", rating: 4.7, sports: "FOOTBALL", name: "Hinjewadi Football Arena", location: "Hinjewadi, Pune", image: "/assets/venues/turf-1.webp" },
  { id: 290, badge: "FEATURED", rating: 4.2, sports: "CRICKET", name: "Hinjewadi Cricket Box", location: "Hinjewadi, Pune", image: "/assets/venues/turf-2.webp" },
  { id: 291, badge: "PROMOTED", rating: 4.5, sports: "BADMINTON", name: "Hinjewadi Badminton Arena", location: "Hinjewadi, Pune", image: "/assets/venues/new_badminton_turf.png" },
  { id: 292, badge: "PROMOTED", rating: 4.4, sports: "LAWN TENNIS", name: "Hinjewadi Lawn tennis Arena", location: "Hinjewadi, Pune", image: "/assets/venues/new_tennis_turf.png" },
  { id: 293, badge: "TOP RATED", rating: 4.5, sports: "VOLLEYBALL", name: "Hinjewadi Volleyball Arena", location: "Hinjewadi, Pune", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 294, badge: "NEW", rating: 4.3, sports: "PADEL", name: "Hinjewadi Padel Arena", location: "Hinjewadi, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 295, badge: "FEATURED", rating: 4.4, sports: "FOOTBALL", name: "Kothrud Football Arena", location: "Kothrud, Pune", image: "/assets/venues/turf-1.webp" },
  { id: 296, badge: "TOP RATED", rating: 4.4, sports: "CRICKET", name: "Kothrud Cricket Box", location: "Kothrud, Pune", image: "/assets/venues/turf-2.webp" },
  { id: 297, badge: "FEATURED", rating: 4.8, sports: "BADMINTON", name: "Kothrud Badminton Arena", location: "Kothrud, Pune", image: "/assets/venues/new_badminton_turf.png" },
  { id: 298, badge: "PROMOTED", rating: 4.3, sports: "LAWN TENNIS", name: "Kothrud Lawn tennis Arena", location: "Kothrud, Pune", image: "/assets/venues/new_tennis_turf.png" },
  { id: 299, badge: "NEW", rating: 4.6, sports: "VOLLEYBALL", name: "Kothrud Volleyball Arena", location: "Kothrud, Pune", image: "/assets/venues/turf-5.webp" },
  { id: 300, badge: "PROMOTED", rating: 4.7, sports: "PADEL", name: "Kothrud Padel Arena", location: "Kothrud, Pune", image: "/assets/venues/turf-1.webp" },
  { id: 301, badge: "NEW", rating: 4.6, sports: "FOOTBALL", name: "Wakad Football Arena", location: "Wakad, Pune", image: "/assets/venues/new_football_turf.png" },
  { id: 302, badge: "PROMOTED", rating: 4.9, sports: "CRICKET", name: "Wakad Cricket Box", location: "Wakad, Pune", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 303, badge: "TOP RATED", rating: 4.4, sports: "BADMINTON", name: "Wakad Badminton Arena", location: "Wakad, Pune", image: "/assets/venues/new_badminton_turf.png" },
  { id: 304, badge: "FAST FILLING", rating: 4.7, sports: "LAWN TENNIS", name: "Wakad Lawn tennis Arena", location: "Wakad, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 305, badge: "TOP RATED", rating: 4.5, sports: "VOLLEYBALL", name: "Wakad Volleyball Arena", location: "Wakad, Pune", image: "/assets/venues/turf-5.webp" },
  { id: 306, badge: "POPULAR", rating: 4.5, sports: "PADEL", name: "Wakad Padel Arena", location: "Wakad, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 307, badge: "FAST FILLING", rating: 4.4, sports: "FOOTBALL", name: "Baner Football Arena", location: "Baner, Pune", image: "/assets/venues/new_football_turf.png" },
  { id: 308, badge: "FAST FILLING", rating: 5.0, sports: "CRICKET", name: "Baner Cricket Box", location: "Baner, Pune", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 309, badge: "POPULAR", rating: 4.7, sports: "BADMINTON", name: "Baner Badminton Arena", location: "Baner, Pune", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 310, badge: "TOP RATED", rating: 4.4, sports: "LAWN TENNIS", name: "Baner Lawn tennis Arena", location: "Baner, Pune", image: "/assets/venues/new_tennis_turf.png" },
  { id: 311, badge: "FAST FILLING", rating: 4.5, sports: "VOLLEYBALL", name: "Baner Volleyball Arena", location: "Baner, Pune", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 312, badge: "POPULAR", rating: 4.7, sports: "PADEL", name: "Baner Padel Arena", location: "Baner, Pune", image: "/assets/venues/turf-1.webp" },
  { id: 313, badge: "FEATURED", rating: 4.3, sports: "FOOTBALL", name: "Hadapsar Football Arena", location: "Hadapsar, Pune", image: "/assets/venues/elite_turf_football.png" },
  { id: 314, badge: "PROMOTED", rating: 4.3, sports: "CRICKET", name: "Hadapsar Cricket Box", location: "Hadapsar, Pune", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 315, badge: "POPULAR", rating: 4.4, sports: "BADMINTON", name: "Hadapsar Badminton Arena", location: "Hadapsar, Pune", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 316, badge: "PROMOTED", rating: 4.3, sports: "LAWN TENNIS", name: "Hadapsar Lawn tennis Arena", location: "Hadapsar, Pune", image: "/assets/venues/new_tennis_turf.png" },
  { id: 317, badge: "FEATURED", rating: 4.2, sports: "VOLLEYBALL", name: "Hadapsar Volleyball Arena", location: "Hadapsar, Pune", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 318, badge: "FEATURED", rating: 4.3, sports: "PADEL", name: "Hadapsar Padel Arena", location: "Hadapsar, Pune", image: "/assets/venues/turf-4.webp" },
  { id: 319, badge: "PROMOTED", rating: 4.7, sports: "FOOTBALL", name: "T Nagar Football Arena", location: "T Nagar, Chennai", image: "/assets/venues/elite_turf_football.png" },
  { id: 320, badge: "FAST FILLING", rating: 4.2, sports: "CRICKET", name: "T Nagar Cricket Box", location: "T Nagar, Chennai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 321, badge: "FEATURED", rating: 4.2, sports: "BADMINTON", name: "T Nagar Badminton Arena", location: "T Nagar, Chennai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 322, badge: "TOP RATED", rating: 4.9, sports: "LAWN TENNIS", name: "T Nagar Lawn tennis Arena", location: "T Nagar, Chennai", image: "/assets/venues/turf-4.webp" },
  { id: 323, badge: "FAST FILLING", rating: 4.3, sports: "VOLLEYBALL", name: "T Nagar Volleyball Arena", location: "T Nagar, Chennai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 324, badge: "FAST FILLING", rating: 4.7, sports: "PADEL", name: "T Nagar Padel Arena", location: "T Nagar, Chennai", image: "/assets/venues/turf-4.webp" },
  { id: 325, badge: "POPULAR", rating: 4.9, sports: "FOOTBALL", name: "Anna Nagar Football Arena", location: "Anna Nagar, Chennai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 326, badge: "PROMOTED", rating: 4.9, sports: "CRICKET", name: "Anna Nagar Cricket Box", location: "Anna Nagar, Chennai", image: "/assets/venues/turf-2.webp" },
  { id: 327, badge: "FEATURED", rating: 4.4, sports: "BADMINTON", name: "Anna Nagar Badminton Arena", location: "Anna Nagar, Chennai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 328, badge: "NEW", rating: 4.7, sports: "LAWN TENNIS", name: "Anna Nagar Lawn tennis Arena", location: "Anna Nagar, Chennai", image: "/assets/venues/turf-6.webp" },
  { id: 329, badge: "TOP RATED", rating: 4.2, sports: "VOLLEYBALL", name: "Anna Nagar Volleyball Arena", location: "Anna Nagar, Chennai", image: "/assets/venues/turf-5.webp" },
  { id: 330, badge: "PROMOTED", rating: 5.0, sports: "PADEL", name: "Anna Nagar Padel Arena", location: "Anna Nagar, Chennai", image: "/assets/venues/turf-4.webp" },
  { id: 331, badge: "POPULAR", rating: 4.5, sports: "FOOTBALL", name: "Adyar Football Arena", location: "Adyar, Chennai", image: "/assets/venues/turf-1.webp" },
  { id: 332, badge: "FEATURED", rating: 4.4, sports: "CRICKET", name: "Adyar Cricket Box", location: "Adyar, Chennai", image: "/assets/venues/turf-2.webp" },
  { id: 333, badge: "FEATURED", rating: 4.5, sports: "BADMINTON", name: "Adyar Badminton Arena", location: "Adyar, Chennai", image: "/assets/venues/new_badminton_turf.png" },
  { id: 334, badge: "FAST FILLING", rating: 4.5, sports: "LAWN TENNIS", name: "Adyar Lawn tennis Arena", location: "Adyar, Chennai", image: "/assets/venues/new_tennis_turf.png" },
  { id: 335, badge: "TOP RATED", rating: 4.3, sports: "VOLLEYBALL", name: "Adyar Volleyball Arena", location: "Adyar, Chennai", image: "/assets/venues/turf-5.webp" },
  { id: 336, badge: "FAST FILLING", rating: 4.3, sports: "PADEL", name: "Adyar Padel Arena", location: "Adyar, Chennai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 337, badge: "PROMOTED", rating: 4.6, sports: "FOOTBALL", name: "Velachery Football Arena", location: "Velachery, Chennai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 338, badge: "NEW", rating: 4.4, sports: "CRICKET", name: "Velachery Cricket Box", location: "Velachery, Chennai", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 339, badge: "TOP RATED", rating: 4.7, sports: "BADMINTON", name: "Velachery Badminton Arena", location: "Velachery, Chennai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 340, badge: "NEW", rating: 4.4, sports: "LAWN TENNIS", name: "Velachery Lawn tennis Arena", location: "Velachery, Chennai", image: "/assets/venues/turf-6.webp" },
  { id: 341, badge: "PROMOTED", rating: 4.9, sports: "VOLLEYBALL", name: "Velachery Volleyball Arena", location: "Velachery, Chennai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 342, badge: "NEW", rating: 4.3, sports: "PADEL", name: "Velachery Padel Arena", location: "Velachery, Chennai", image: "/assets/venues/turf-4.webp" },
  { id: 343, badge: "FEATURED", rating: 4.8, sports: "FOOTBALL", name: "Nungambakkam Football Arena", location: "Nungambakkam, Chennai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 344, badge: "FAST FILLING", rating: 4.6, sports: "CRICKET", name: "Nungambakkam Cricket Box", location: "Nungambakkam, Chennai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 345, badge: "PROMOTED", rating: 4.8, sports: "BADMINTON", name: "Nungambakkam Badminton Arena", location: "Nungambakkam, Chennai", image: "/assets/venues/turf-3.webp" },
  { id: 346, badge: "TOP RATED", rating: 4.7, sports: "LAWN TENNIS", name: "Nungambakkam Lawn tennis Arena", location: "Nungambakkam, Chennai", image: "/assets/venues/new_tennis_turf.png" },
  { id: 347, badge: "FEATURED", rating: 4.5, sports: "VOLLEYBALL", name: "Nungambakkam Volleyball Arena", location: "Nungambakkam, Chennai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 348, badge: "POPULAR", rating: 4.6, sports: "PADEL", name: "Nungambakkam Padel Arena", location: "Nungambakkam, Chennai", image: "/assets/venues/turf-1.webp" },
  { id: 349, badge: "PROMOTED", rating: 4.8, sports: "FOOTBALL", name: "OMR Football Arena", location: "OMR, Chennai", image: "/assets/venues/turf-1.webp" },
  { id: 350, badge: "POPULAR", rating: 4.3, sports: "CRICKET", name: "OMR Cricket Box", location: "OMR, Chennai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 351, badge: "PROMOTED", rating: 4.3, sports: "BADMINTON", name: "OMR Badminton Arena", location: "OMR, Chennai", image: "/assets/venues/new_badminton_turf.png" },
  { id: 352, badge: "POPULAR", rating: 4.3, sports: "LAWN TENNIS", name: "OMR Lawn tennis Arena", location: "OMR, Chennai", image: "/assets/venues/turf-4.webp" },
  { id: 353, badge: "FEATURED", rating: 5.0, sports: "VOLLEYBALL", name: "OMR Volleyball Arena", location: "OMR, Chennai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 354, badge: "POPULAR", rating: 4.9, sports: "PADEL", name: "OMR Padel Arena", location: "OMR, Chennai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 355, badge: "PROMOTED", rating: 4.7, sports: "FOOTBALL", name: "ECR Football Arena", location: "ECR, Chennai", image: "/assets/venues/new_football_turf.png" },
  { id: 356, badge: "FEATURED", rating: 4.9, sports: "CRICKET", name: "ECR Cricket Box", location: "ECR, Chennai", image: "/assets/venues/turf-2.webp" },
  { id: 357, badge: "PROMOTED", rating: 4.3, sports: "BADMINTON", name: "ECR Badminton Arena", location: "ECR, Chennai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 358, badge: "FAST FILLING", rating: 4.7, sports: "LAWN TENNIS", name: "ECR Lawn tennis Arena", location: "ECR, Chennai", image: "/assets/venues/turf-6.webp" },
  { id: 359, badge: "PROMOTED", rating: 4.4, sports: "VOLLEYBALL", name: "ECR Volleyball Arena", location: "ECR, Chennai", image: "/assets/venues/turf-5.webp" },
  { id: 360, badge: "TOP RATED", rating: 4.8, sports: "PADEL", name: "ECR Padel Arena", location: "ECR, Chennai", image: "/assets/venues/turf-1.webp" },
  { id: 361, badge: "TOP RATED", rating: 4.3, sports: "FOOTBALL", name: "Mylapore Football Arena", location: "Mylapore, Chennai", image: "/assets/venues/new_football_turf_2.png" },
  { id: 362, badge: "TOP RATED", rating: 4.8, sports: "CRICKET", name: "Mylapore Cricket Box", location: "Mylapore, Chennai", image: "/assets/venues/new_cricket_turf.png" },
  { id: 363, badge: "TOP RATED", rating: 4.3, sports: "BADMINTON", name: "Mylapore Badminton Arena", location: "Mylapore, Chennai", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 364, badge: "POPULAR", rating: 4.6, sports: "LAWN TENNIS", name: "Mylapore Lawn tennis Arena", location: "Mylapore, Chennai", image: "/assets/venues/turf-6.webp" },
  { id: 365, badge: "NEW", rating: 4.6, sports: "VOLLEYBALL", name: "Mylapore Volleyball Arena", location: "Mylapore, Chennai", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 366, badge: "PROMOTED", rating: 4.5, sports: "PADEL", name: "Mylapore Padel Arena", location: "Mylapore, Chennai", image: "/assets/venues/turf-1.webp" },
  { id: 367, badge: "PROMOTED", rating: 4.3, sports: "FOOTBALL", name: "Park Street Football Arena", location: "Park Street, Kolkata", image: "/assets/venues/elite_turf_football.png" },
  { id: 368, badge: "POPULAR", rating: 4.5, sports: "CRICKET", name: "Park Street Cricket Box", location: "Park Street, Kolkata", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 369, badge: "FAST FILLING", rating: 4.9, sports: "BADMINTON", name: "Park Street Badminton Arena", location: "Park Street, Kolkata", image: "/assets/venues/new_badminton_turf.png" },
  { id: 370, badge: "POPULAR", rating: 4.5, sports: "LAWN TENNIS", name: "Park Street Lawn tennis Arena", location: "Park Street, Kolkata", image: "/assets/venues/new_tennis_turf.png" },
  { id: 371, badge: "PROMOTED", rating: 4.9, sports: "VOLLEYBALL", name: "Park Street Volleyball Arena", location: "Park Street, Kolkata", image: "/assets/venues/turf-5.webp" },
  { id: 372, badge: "NEW", rating: 4.7, sports: "PADEL", name: "Park Street Padel Arena", location: "Park Street, Kolkata", image: "/assets/venues/turf-1.webp" },
  { id: 373, badge: "NEW", rating: 4.2, sports: "FOOTBALL", name: "Salt Lake Football Arena", location: "Salt Lake, Kolkata", image: "/assets/venues/new_football_turf_2.png" },
  { id: 374, badge: "FEATURED", rating: 4.3, sports: "CRICKET", name: "Salt Lake Cricket Box", location: "Salt Lake, Kolkata", image: "/assets/venues/turf-2.webp" },
  { id: 375, badge: "PROMOTED", rating: 4.8, sports: "BADMINTON", name: "Salt Lake Badminton Arena", location: "Salt Lake, Kolkata", image: "/assets/venues/turf-3.webp" },
  { id: 376, badge: "FEATURED", rating: 4.8, sports: "LAWN TENNIS", name: "Salt Lake Lawn tennis Arena", location: "Salt Lake, Kolkata", image: "/assets/venues/turf-6.webp" },
  { id: 377, badge: "POPULAR", rating: 4.5, sports: "VOLLEYBALL", name: "Salt Lake Volleyball Arena", location: "Salt Lake, Kolkata", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 378, badge: "POPULAR", rating: 4.3, sports: "PADEL", name: "Salt Lake Padel Arena", location: "Salt Lake, Kolkata", image: "/assets/venues/turf-4.webp" },
  { id: 379, badge: "FEATURED", rating: 4.9, sports: "FOOTBALL", name: "New Town Football Arena", location: "New Town, Kolkata", image: "/assets/venues/new_football_turf_2.png" },
  { id: 380, badge: "TOP RATED", rating: 4.4, sports: "CRICKET", name: "New Town Cricket Box", location: "New Town, Kolkata", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 381, badge: "FAST FILLING", rating: 4.9, sports: "BADMINTON", name: "New Town Badminton Arena", location: "New Town, Kolkata", image: "/assets/venues/new_badminton_turf.png" },
  { id: 382, badge: "TOP RATED", rating: 4.2, sports: "LAWN TENNIS", name: "New Town Lawn tennis Arena", location: "New Town, Kolkata", image: "/assets/venues/new_tennis_turf.png" },
  { id: 383, badge: "PROMOTED", rating: 4.7, sports: "VOLLEYBALL", name: "New Town Volleyball Arena", location: "New Town, Kolkata", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 384, badge: "NEW", rating: 4.4, sports: "PADEL", name: "New Town Padel Arena", location: "New Town, Kolkata", image: "/assets/venues/turf-1.webp" },
  { id: 385, badge: "PROMOTED", rating: 4.7, sports: "FOOTBALL", name: "Ballygunge Football Arena", location: "Ballygunge, Kolkata", image: "/assets/venues/turf-1.webp" },
  { id: 386, badge: "NEW", rating: 4.6, sports: "CRICKET", name: "Ballygunge Cricket Box", location: "Ballygunge, Kolkata", image: "/assets/venues/new_cricket_turf.png" },
  { id: 387, badge: "POPULAR", rating: 4.4, sports: "BADMINTON", name: "Ballygunge Badminton Arena", location: "Ballygunge, Kolkata", image: "/assets/venues/turf-3.webp" },
  { id: 388, badge: "TOP RATED", rating: 4.9, sports: "LAWN TENNIS", name: "Ballygunge Lawn tennis Arena", location: "Ballygunge, Kolkata", image: "/assets/venues/turf-6.webp" },
  { id: 389, badge: "POPULAR", rating: 4.9, sports: "VOLLEYBALL", name: "Ballygunge Volleyball Arena", location: "Ballygunge, Kolkata", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 390, badge: "FAST FILLING", rating: 4.4, sports: "PADEL", name: "Ballygunge Padel Arena", location: "Ballygunge, Kolkata", image: "/assets/venues/turf-1.webp" },
  { id: 391, badge: "TOP RATED", rating: 4.5, sports: "FOOTBALL", name: "Alipore Football Arena", location: "Alipore, Kolkata", image: "/assets/venues/new_football_turf_2.png" },
  { id: 392, badge: "POPULAR", rating: 4.8, sports: "CRICKET", name: "Alipore Cricket Box", location: "Alipore, Kolkata", image: "/assets/venues/metro_sports_park_cricket.jpg" },
  { id: 393, badge: "FAST FILLING", rating: 4.5, sports: "BADMINTON", name: "Alipore Badminton Arena", location: "Alipore, Kolkata", image: "/assets/venues/turf-3.webp" },
  { id: 394, badge: "PROMOTED", rating: 4.7, sports: "LAWN TENNIS", name: "Alipore Lawn tennis Arena", location: "Alipore, Kolkata", image: "/assets/venues/new_tennis_turf.png" },
  { id: 395, badge: "FEATURED", rating: 4.4, sports: "VOLLEYBALL", name: "Alipore Volleyball Arena", location: "Alipore, Kolkata", image: "/assets/venues/turf-5.webp" },
  { id: 396, badge: "NEW", rating: 4.6, sports: "PADEL", name: "Alipore Padel Arena", location: "Alipore, Kolkata", image: "/assets/venues/new_football_turf_2.png" },
  { id: 397, badge: "FEATURED", rating: 4.5, sports: "FOOTBALL", name: "Dum Dum Football Arena", location: "Dum Dum, Kolkata", image: "/assets/venues/elite_turf_football.png" },
  { id: 398, badge: "POPULAR", rating: 4.2, sports: "CRICKET", name: "Dum Dum Cricket Box", location: "Dum Dum, Kolkata", image: "/assets/venues/turf-2.webp" },
  { id: 399, badge: "PROMOTED", rating: 4.2, sports: "BADMINTON", name: "Dum Dum Badminton Arena", location: "Dum Dum, Kolkata", image: "/assets/venues/turf-3.webp" },
  { id: 400, badge: "NEW", rating: 4.8, sports: "LAWN TENNIS", name: "Dum Dum Lawn tennis Arena", location: "Dum Dum, Kolkata", image: "/assets/venues/turf-4.webp" },
  { id: 401, badge: "FAST FILLING", rating: 5.0, sports: "VOLLEYBALL", name: "Dum Dum Volleyball Arena", location: "Dum Dum, Kolkata", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 402, badge: "FAST FILLING", rating: 4.9, sports: "PADEL", name: "Dum Dum Padel Arena", location: "Dum Dum, Kolkata", image: "/assets/venues/turf-4.webp" },
  { id: 403, badge: "TOP RATED", rating: 4.5, sports: "FOOTBALL", name: "Howrah Football Arena", location: "Howrah, Kolkata", image: "/assets/venues/new_football_turf.png" },
  { id: 404, badge: "FEATURED", rating: 4.8, sports: "CRICKET", name: "Howrah Cricket Box", location: "Howrah, Kolkata", image: "/assets/venues/turf-2.webp" },
  { id: 405, badge: "TOP RATED", rating: 4.3, sports: "BADMINTON", name: "Howrah Badminton Arena", location: "Howrah, Kolkata", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 406, badge: "POPULAR", rating: 4.9, sports: "LAWN TENNIS", name: "Howrah Lawn tennis Arena", location: "Howrah, Kolkata", image: "/assets/venues/turf-6.webp" },
  { id: 407, badge: "FAST FILLING", rating: 4.2, sports: "VOLLEYBALL", name: "Howrah Volleyball Arena", location: "Howrah, Kolkata", image: "/assets/venues/turf-5.webp" },
  { id: 408, badge: "NEW", rating: 4.8, sports: "PADEL", name: "Howrah Padel Arena", location: "Howrah, Kolkata", image: "/assets/venues/turf-4.webp" },
  { id: 409, badge: "FAST FILLING", rating: 4.5, sports: "FOOTBALL", name: "Edappally Football Arena", location: "Edappally, Kochi", image: "/assets/venues/new_football_turf.png" },
  { id: 410, badge: "FEATURED", rating: 4.7, sports: "CRICKET", name: "Edappally Cricket Box", location: "Edappally, Kochi", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 411, badge: "POPULAR", rating: 4.3, sports: "BADMINTON", name: "Edappally Badminton Arena", location: "Edappally, Kochi", image: "/assets/venues/new_badminton_turf.png" },
  { id: 412, badge: "FAST FILLING", rating: 4.3, sports: "LAWN TENNIS", name: "Edappally Lawn tennis Arena", location: "Edappally, Kochi", image: "/assets/venues/turf-4.webp" },
  { id: 413, badge: "PROMOTED", rating: 4.5, sports: "VOLLEYBALL", name: "Edappally Volleyball Arena", location: "Edappally, Kochi", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 414, badge: "NEW", rating: 4.9, sports: "PADEL", name: "Edappally Padel Arena", location: "Edappally, Kochi", image: "/assets/venues/turf-1.webp" },
  { id: 415, badge: "PROMOTED", rating: 4.8, sports: "FOOTBALL", name: "Fort Kochi Football Arena", location: "Fort Kochi, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 416, badge: "FEATURED", rating: 4.5, sports: "CRICKET", name: "Fort Kochi Cricket Box", location: "Fort Kochi, Kochi", image: "/assets/venues/new_cricket_turf.png" },
  { id: 417, badge: "POPULAR", rating: 4.6, sports: "BADMINTON", name: "Fort Kochi Badminton Arena", location: "Fort Kochi, Kochi", image: "/assets/venues/turf-3.webp" },
  { id: 418, badge: "FEATURED", rating: 4.6, sports: "LAWN TENNIS", name: "Fort Kochi Lawn tennis Arena", location: "Fort Kochi, Kochi", image: "/assets/venues/turf-4.webp" },
  { id: 419, badge: "PROMOTED", rating: 4.3, sports: "VOLLEYBALL", name: "Fort Kochi Volleyball Arena", location: "Fort Kochi, Kochi", image: "/assets/venues/turf-5.webp" },
  { id: 420, badge: "PROMOTED", rating: 4.5, sports: "PADEL", name: "Fort Kochi Padel Arena", location: "Fort Kochi, Kochi", image: "/assets/venues/turf-4.webp" },
  { id: 421, badge: "NEW", rating: 4.2, sports: "FOOTBALL", name: "MG Road Football Arena", location: "MG Road, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 422, badge: "FAST FILLING", rating: 4.6, sports: "CRICKET", name: "MG Road Cricket Box", location: "MG Road, Kochi", image: "/assets/venues/turf-2.webp" },
  { id: 423, badge: "POPULAR", rating: 4.9, sports: "BADMINTON", name: "MG Road Badminton Arena", location: "MG Road, Kochi", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 424, badge: "TOP RATED", rating: 4.9, sports: "LAWN TENNIS", name: "MG Road Lawn tennis Arena", location: "MG Road, Kochi", image: "/assets/venues/turf-4.webp" },
  { id: 425, badge: "PROMOTED", rating: 4.4, sports: "VOLLEYBALL", name: "MG Road Volleyball Arena", location: "MG Road, Kochi", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 426, badge: "NEW", rating: 4.6, sports: "PADEL", name: "MG Road Padel Arena", location: "MG Road, Kochi", image: "/assets/venues/turf-1.webp" },
  { id: 427, badge: "FEATURED", rating: 4.7, sports: "FOOTBALL", name: "Kakkanad Football Arena", location: "Kakkanad, Kochi", image: "/assets/venues/turf-1.webp" },
  { id: 428, badge: "POPULAR", rating: 4.6, sports: "CRICKET", name: "Kakkanad Cricket Box", location: "Kakkanad, Kochi", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 429, badge: "FAST FILLING", rating: 4.3, sports: "BADMINTON", name: "Kakkanad Badminton Arena", location: "Kakkanad, Kochi", image: "/assets/venues/turf-3.webp" },
  { id: 430, badge: "POPULAR", rating: 4.6, sports: "LAWN TENNIS", name: "Kakkanad Lawn tennis Arena", location: "Kakkanad, Kochi", image: "/assets/venues/turf-6.webp" },
  { id: 431, badge: "PROMOTED", rating: 4.8, sports: "VOLLEYBALL", name: "Kakkanad Volleyball Arena", location: "Kakkanad, Kochi", image: "/assets/venues/turf-5.webp" },
  { id: 432, badge: "FAST FILLING", rating: 4.6, sports: "PADEL", name: "Kakkanad Padel Arena", location: "Kakkanad, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 433, badge: "TOP RATED", rating: 4.8, sports: "FOOTBALL", name: "Palarivattom Football Arena", location: "Palarivattom, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 434, badge: "NEW", rating: 4.7, sports: "CRICKET", name: "Palarivattom Cricket Box", location: "Palarivattom, Kochi", image: "/assets/venues/new_cricket_turf.png" },
  { id: 435, badge: "PROMOTED", rating: 4.9, sports: "BADMINTON", name: "Palarivattom Badminton Arena", location: "Palarivattom, Kochi", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 436, badge: "NEW", rating: 4.7, sports: "LAWN TENNIS", name: "Palarivattom Lawn tennis Arena", location: "Palarivattom, Kochi", image: "/assets/venues/new_tennis_turf.png" },
  { id: 437, badge: "POPULAR", rating: 4.6, sports: "VOLLEYBALL", name: "Palarivattom Volleyball Arena", location: "Palarivattom, Kochi", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 438, badge: "FEATURED", rating: 4.5, sports: "PADEL", name: "Palarivattom Padel Arena", location: "Palarivattom, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 439, badge: "TOP RATED", rating: 4.3, sports: "FOOTBALL", name: "Marine Drive Football Arena", location: "Marine Drive, Kochi", image: "/assets/venues/champions_sports_arena_football.jpg" },
  { id: 440, badge: "NEW", rating: 4.3, sports: "CRICKET", name: "Marine Drive Cricket Box", location: "Marine Drive, Kochi", image: "/assets/venues/new_cricket_turf_2.png" },
  { id: 441, badge: "NEW", rating: 4.8, sports: "BADMINTON", name: "Marine Drive Badminton Arena", location: "Marine Drive, Kochi", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 442, badge: "FEATURED", rating: 4.3, sports: "LAWN TENNIS", name: "Marine Drive Lawn tennis Arena", location: "Marine Drive, Kochi", image: "/assets/venues/new_tennis_turf.png" },
  { id: 443, badge: "TOP RATED", rating: 4.9, sports: "VOLLEYBALL", name: "Marine Drive Volleyball Arena", location: "Marine Drive, Kochi", image: "/assets/venues/turf-5.webp" },
  { id: 444, badge: "FEATURED", rating: 4.7, sports: "PADEL", name: "Marine Drive Padel Arena", location: "Marine Drive, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 445, badge: "FAST FILLING", rating: 4.6, sports: "FOOTBALL", name: "Vyttila Football Arena", location: "Vyttila, Kochi", image: "/assets/venues/new_football_turf_2.png" },
  { id: 446, badge: "NEW", rating: 4.3, sports: "CRICKET", name: "Vyttila Cricket Box", location: "Vyttila, Kochi", image: "/assets/venues/turf-2.webp" },
  { id: 447, badge: "FAST FILLING", rating: 4.3, sports: "BADMINTON", name: "Vyttila Badminton Arena", location: "Vyttila, Kochi", image: "/assets/venues/grand_playfield_badminton.png" },
  { id: 448, badge: "FEATURED", rating: 4.2, sports: "LAWN TENNIS", name: "Vyttila Lawn tennis Arena", location: "Vyttila, Kochi", image: "/assets/venues/turf-4.webp" },
  { id: 449, badge: "FAST FILLING", rating: 4.6, sports: "VOLLEYBALL", name: "Vyttila Volleyball Arena", location: "Vyttila, Kochi", image: "/assets/venues/new_volleyball_turf.png" },
  { id: 450, badge: "TOP RATED", rating: 4.7, sports: "PADEL", name: "Vyttila Padel Arena", location: "Vyttila, Kochi", image: "/assets/venues/turf-1.webp" },
];

function CustomSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100/50 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 cursor-pointer"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen ? "rotate-180 text-[#059669]" : "")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 mt-2 z-30 max-h-60 overflow-y-auto rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-[#0f172a]/95 p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur-md"
          >
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 cursor-pointer",
                    isSelected
                      ? "bg-[#059669]/10 text-[#059669] font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="h-4 w-4 stroke-[3] text-[#059669]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VenueBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  const [selectedSport, setSelectedSport] = useState(location.state?.sport || "All Sports");
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem("preferred-city") || "All Cities"
  );
  const [sortByPrice, setSortByPrice] = useState("Low to High");
  const [sortByRating, setSortByRating] = useState("High to Low");
  const [sortField, setSortField] = useState("Price"); // "Price" or "Rating"
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const handleCityChange = (e) => {
      setSelectedLocation(e.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () => window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  const sportsList = ["All Sports", "Football", "Cricket", "Badminton", "Lawn Tennis", "Volleyball", "Padel"];
  const citiesList = ["All Cities", "Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Chandigarh", "Ahmedabad", "Pune", "Chennai", "Kolkata", "Kochi"];

  const filteredVenues = demoVenues.filter((venue) => {
    const matchSport = selectedSport === "All Sports" || venue.sports.toLowerCase().includes(selectedSport.toLowerCase());
    const matchLocation = selectedLocation === "All Cities" || venue.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchSport && matchLocation;
  });

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    if (sortField === "Price") {
      const priceA = a.price || (800 + (a.id * 130) % 1000);
      const priceB = b.price || (800 + (b.id * 130) % 1000);
      return sortByPrice === "Low to High" ? priceA - priceB : priceB - priceA;
    } else {
      return sortByRating === "Low to High" ? a.rating - b.rating : b.rating - a.rating;
    }
  });

  const premiumVenues = sortedVenues.filter(v => v.rating >= 4.7 || ["PROMOTED", "FEATURED", "TOP RATED"].includes(v.badge));
  const otherVenues = sortedVenues.filter(v => !(v.rating >= 4.7 || ["PROMOTED", "FEATURED", "TOP RATED"].includes(v.badge)));

  const scrollLeft1 = () => {
    if (scrollRef1.current) {
      scrollRef1.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight1 = () => {
    if (scrollRef1.current) {
      scrollRef1.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const scrollLeft2 = () => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight2 = () => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const renderVenueCard = (venue) => {
    const venuePrice = venue.price || (800 + (venue.id * 130) % 1000);
    return (
      <div
        key={venue.id}
        className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white dark:bg-[#0f172a] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-800 flex flex-col group cursor-pointer"
        onClick={() => navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } })}
      >
        <div className="relative h-[340px] w-full overflow-hidden">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "/assets/venues/turf-1.webp"; // Fallback image
            }}
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-[#39FF14] text-black text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-sm shadow-sm tracking-wide">
              {venue.badge}
            </div>
          </div>

          {/* Bottom Overlay & Text */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-20 pb-4 px-4 z-10 flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <p className="text-[#39FF14] text-[9px] font-bold tracking-widest uppercase">
                  {venue.sports}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs font-semibold shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{venue.rating.toFixed(1)}</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-[15px] leading-tight mb-2 line-clamp-2">
                {venue.name}
              </h3>
              <div className="flex items-center justify-between text-white/80 text-[11px] font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#39FF14]" />
                  <span className="truncate max-w-[100px]">{venue.location}</span>
                </div>
                <span className="text-[#39FF14] font-bold shrink-0">₹{venuePrice}/hr</span>
              </div>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } });
              }}
              className="bg-white text-[#059669] hover:bg-emerald-50 border border-[#059669]/30 hover:border-[#059669] font-semibold rounded-lg h-9 px-4 text-xs transition-colors shadow-sm shrink-0"
            >
              Book Slot
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#f8faf9] dark:bg-[#020617] min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Sidebar Filter */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full bg-white/80 dark:bg-[#0f172a]/70 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 rounded-2xl h-12 font-bold shadow-xs flex items-center justify-between px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#059669]" />
                <span>Filters</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isMobileFilterOpen ? "rotate-180" : "")} />
            </Button>
          </div>

          <div className={cn(
            "bg-white/80 dark:bg-[#0f172a]/70 rounded-[28px] border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md lg:sticky top-[100px]",
            isMobileFilterOpen ? "block mb-6 lg:mb-0" : "hidden lg:block"
          )}>
            <div className="hidden lg:flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 text-slate-900 dark:text-white">
              <div className="h-8 w-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669] dark:text-[#059669]">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="text-[17px] font-bold tracking-tight">Quick Filters</h3>
            </div>

            {/* Filter Section: Sport */}
            <div className="mb-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                Sport
              </h4>
              <CustomSelect
                value={selectedSport}
                onChange={(val) => setSelectedSport(val)}
                options={sportsList}
              />
            </div>

            {/* Filter Section: Price */}
            <div className="mb-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                Price
              </h4>
              <CustomSelect
                value={sortByPrice}
                onChange={(val) => {
                  setSortByPrice(val);
                  setSortField("Price");
                }}
                options={["Low to High", "High to Low"]}
              />
            </div>

            {/* Filter Section: Rating */}
            <div className="mb-8">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                Rating
              </h4>
              <CustomSelect
                value={sortByRating}
                onChange={(val) => {
                  setSortByRating(val);
                  setSortField("Rating");
                }}
                options={["High to Low", "Low to High"]}
              />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setSelectedSport("All Sports");
                  setSelectedLocation("All Cities");
                  setSortByPrice("Low to High");
                  setSortByRating("High to Low");
                  setSortField("Price");
                  localStorage.setItem("preferred-city", "All Cities");
                  window.dispatchEvent(new CustomEvent("preferredCityChanged", { detail: "All Cities" }));
                }}
                className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.05] rounded-xl h-11 font-bold shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 opacity-80" />
                Reset Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {/* Header Section */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="text-[#059669] font-bold text-[10px] tracking-widest uppercase">
                  Handpicked For You
                </span>
              </div>
              <h2 className="text-2xl md:text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
                Recommended Venues
              </h2>
            </div>
            <Link
              to="/venues"
              className="flex items-center gap-1 text-[#059669] font-semibold text-sm hover:underline"
            >
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recommended Venues Slider */}
          <div className="relative group/section">
            <button
              onClick={scrollLeft1}
              className="hidden md:flex absolute -left-4 sm:-left-6 top-[40%] z-20 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer border border-slate-100"
            >
              <ChevronLeft className="h-6 w-6 pr-0.5" />
            </button>

            <div
              ref={scrollRef1}
              className="flex snap-x snap-mandatory overflow-x-auto gap-4 sm:gap-5 pb-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {premiumVenues.length > 0 ? (
                premiumVenues.map(renderVenueCard)
              ) : (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No recommended venues found</h3>
                </div>
              )}
            </div>

            <button
              onClick={scrollRight1}
              className="hidden md:flex absolute -right-4 sm:-right-6 top-[40%] z-20 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer border border-slate-100"
            >
              <ChevronRight className="h-6 w-6 pl-0.5" />
            </button>
          </div>

          {/* Explore Other Venues Header */}
          <div className="flex items-end justify-between mt-8 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="text-[#059669] font-bold text-[10px] tracking-widest uppercase">
                  Explore More
                </span>
              </div>
              <h2 className="text-2xl md:text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
                All Venues
              </h2>
            </div>
          </div>

          {/* Explore Other Venues Slider */}
          <div className="relative group/section">
            <button
              onClick={scrollLeft2}
              className="hidden md:flex absolute -left-4 sm:-left-6 top-[40%] z-20 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer border border-slate-100"
            >
              <ChevronLeft className="h-6 w-6 pr-0.5" />
            </button>

            <div
              ref={scrollRef2}
              className="flex snap-x snap-mandatory overflow-x-auto gap-4 sm:gap-5 pb-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {otherVenues.length > 0 ? (
                otherVenues.map(renderVenueCard)
              ) : (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No venues found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px]">
                    We couldn't find any {selectedSport !== "All Sports" ? selectedSport : "sports"} venues in {selectedLocation}. Try adjusting your filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedSport("All Sports");
                      setSelectedLocation("All Cities");
                    }}
                    variant="outline"
                    className="mt-6 border-slate-200 dark:border-slate-800 dark:text-white bg-transparent"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            <button
              onClick={scrollRight2}
              className="hidden md:flex absolute -right-4 sm:-right-6 top-[40%] z-20 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer border border-slate-100"
            >
              <ChevronRight className="h-6 w-6 pl-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
