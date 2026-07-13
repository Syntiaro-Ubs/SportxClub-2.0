import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Search,
  MapPin,
  MessageSquare,
  UserPlus,
  Star,
  Trophy,
  Target,
  Check,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../providers/auth-provider";

const players = [
  {
    id: 1,
    name: "Rahul Sharma",
    sport: "Cricket",
    skillLevel: "Advanced",
    location: "Mumbai, 2.3 km away",
    rating: 4.8,
    matches: 124,
    winRate: "68%",
    preferredPosition: "Batsman",
    availability: "Weekends",
  },
  {
    id: 2,
    name: "Priya Patel",
    sport: "Badminton",
    skillLevel: "Intermediate",
    location: "Mumbai, 3.1 km away",
    rating: 4.6,
    matches: 89,
    winRate: "62%",
    preferredPosition: "Singles",
    availability: "Evenings",
  },
  {
    id: 3,
    name: "Arjun Malhotra",
    sport: "Football",
    skillLevel: "Expert",
    location: "Mumbai, 1.8 km away",
    rating: 4.9,
    matches: 156,
    winRate: "74%",
    preferredPosition: "Midfielder",
    availability: "Weekdays",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    sport: "Tennis",
    skillLevel: "Advanced",
    location: "Mumbai, 4.2 km away",
    rating: 4.7,
    matches: 98,
    winRate: "71%",
    preferredPosition: "Baseline",
    availability: "Mornings",
  },
  {
    id: 5,
    name: "Vikram Singh",
    sport: "Basketball",
    skillLevel: "Intermediate",
    location: "Mumbai, 2.7 km away",
    rating: 4.5,
    matches: 76,
    winRate: "58%",
    preferredPosition: "Forward",
    availability: "Weekends",
  },
  {
    id: 6,
    name: "Anjali Gupta",
    sport: "Volleyball",
    skillLevel: "Advanced",
    location: "Mumbai, 3.5 km away",
    rating: 4.8,
    matches: 112,
    winRate: "69%",
    preferredPosition: "Setter",
    availability: "Evenings",
  },
];

const skillColors = {
  Beginner: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Advanced:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Expert: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const mockBookings = [
  { id: "1", venueName: "Elite Turf Arena", date: "Jul 11, 2026", time: "7:00 PM - 8:00 PM", sport: "Football" },
  { id: "2", venueName: "Neon Box Turf", date: "Jul 12, 2026", time: "6:00 PM - 7:00 PM", sport: "Cricket" },
  { id: "3", venueName: "Casual Play / Custom Match", date: "Flexible Date", time: "Flexible Time", sport: "Any Sport" },
];

const mockGroups = [
  {
    id: "g-1",
    isGroup: true,
    name: "Powai Strikers",
    sport: "Cricket",
    size: 9,
    skillLevel: "Advanced",
    location: "Mumbai, 1.5 km away",
    rating: 4.8,
    matches: 45,
    winRate: "72%",
    members: [
      { id: 401, name: "Rahul Sharma", sport: "Cricket", skillLevel: "Advanced", rating: 4.8, role: "Batsman" },
      { id: 402, name: "Priya Patel", sport: "Cricket", skillLevel: "Intermediate", rating: 4.6, role: "All-rounder" },
      { id: 403, name: "Arjun Malhotra", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "Bowler" },
      { id: 404, name: "Suresh Raina", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "Batsman" },
      { id: 405, name: "Rohan Das", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "Batsman" },
      { id: 406, name: "Sneha Sen", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "Bowler" },
      { id: 407, name: "Kabir Mehta", sport: "Cricket", skillLevel: "Beginner", rating: 4.2, role: "Batsman" },
      { id: 408, name: "Neha Sharma", sport: "Cricket", skillLevel: "Intermediate", rating: 4.4, role: "Bowler" },
      { id: 409, name: "Amit Patel", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "Wicket Keeper" }
    ],
    availability: "Weekends",
  },
  {
    id: "g-2",
    isGroup: true,
    name: "Dunk Masters",
    sport: "Basketball",
    size: 3,
    skillLevel: "Expert",
    location: "Mumbai, 2.8 km away",
    rating: 4.9,
    matches: 62,
    winRate: "78%",
    members: [
      { id: 501, name: "Kabir Singh", sport: "Basketball", skillLevel: "Expert", rating: 4.9, role: "Point Guard" },
      { id: 502, name: "Rishi Kapoor", sport: "Basketball", skillLevel: "Advanced", rating: 4.7, role: "Shooting Guard" },
      { id: 503, name: "Tara Sutaria", sport: "Basketball", skillLevel: "Intermediate", rating: 4.6, role: "Small Forward" }
    ],
    availability: "Evenings",
  },
  {
    id: "g-3",
    isGroup: true,
    name: "Vikhroli Smashers",
    sport: "Badminton",
    size: 2,
    skillLevel: "Intermediate",
    location: "Mumbai, 3.0 km away",
    rating: 4.4,
    matches: 28,
    winRate: "60%",
    members: [
      { id: 601, name: "Aditi Rao", sport: "Badminton", skillLevel: "Intermediate", rating: 4.4, role: "Singles Player" },
      { id: 602, name: "Dev Patel", sport: "Badminton", skillLevel: "Intermediate", rating: 4.5, role: "Singles Player" }
    ],
    availability: "Mornings",
  },
  {
    id: "g-4",
    isGroup: true,
    name: "Net Busters FC",
    sport: "Football",
    size: 8,
    skillLevel: "Expert",
    location: "Mumbai, 2.0 km away",
    rating: 4.8,
    matches: 84,
    winRate: "75%",
    members: [
      { id: 701, name: "Sunil Chhetri", sport: "Football", skillLevel: "Expert", rating: 4.9, role: "Striker" },
      { id: 702, name: "Gurpreet Singh", sport: "Football", skillLevel: "Advanced", rating: 4.8, role: "Goalkeeper" },
      { id: 703, name: "Anirudh Thapa", sport: "Football", skillLevel: "Advanced", rating: 4.7, role: "Midfielder" },
      { id: 704, name: "Sahal Samad", sport: "Football", skillLevel: "Intermediate", rating: 4.6, role: "Midfielder" },
      { id: 705, name: "Jeje Lalpekhlua", sport: "Football", skillLevel: "Intermediate", rating: 4.5, role: "Striker" },
      { id: 706, name: "Sandesh Jhingan", sport: "Football", skillLevel: "Advanced", rating: 4.7, role: "Defender" },
      { id: 707, name: "Subhasish Bose", sport: "Football", skillLevel: "Intermediate", rating: 4.4, role: "Defender" },
      { id: 708, name: "Pritam Kotal", sport: "Football", skillLevel: "Advanced", rating: 4.5, role: "Defender" }
    ],
    availability: "Weekdays",
  },
  {
    id: "g-5",
    isGroup: true,
    name: "Spin Wizards XI",
    sport: "Cricket",
    size: 7,
    skillLevel: "Intermediate",
    location: "Mumbai, 4.5 km away",
    rating: 4.5,
    matches: 36,
    winRate: "64%",
    members: [
      { id: 801, name: "Yuzvendra Chahal", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "Bowler" },
      { id: 802, name: "Kuldeep Yadav", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "Bowler" },
      { id: 803, name: "Ravindra Jadeja", sport: "Cricket", skillLevel: "Expert", rating: 4.8, role: "All-rounder" },
      { id: 804, name: "Axar Patel", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "All-rounder" },
      { id: 805, name: "Ravichandran Ashwin", sport: "Cricket", skillLevel: "Expert", rating: 4.7, role: "Bowler" },
      { id: 806, name: "Washington Sundar", sport: "Cricket", skillLevel: "Intermediate", rating: 4.4, role: "All-rounder" },
      { id: 807, name: "Ravi Bishnoi", sport: "Cricket", skillLevel: "Intermediate", rating: 4.3, role: "Bowler" }
    ],
    availability: "Evenings",
  },
  {
    id: "g-6",
    isGroup: true,
    name: "Court Kings",
    sport: "Tennis",
    size: 2,
    skillLevel: "Advanced",
    location: "Mumbai, 1.2 km away",
    rating: 4.7,
    matches: 52,
    winRate: "69%",
    members: [
      { id: 901, name: "Leander Paes", sport: "Tennis", skillLevel: "Expert", rating: 4.9, role: "Doubles Player" },
      { id: 902, name: "Mahesh Bhupathi", sport: "Tennis", skillLevel: "Expert", rating: 4.8, role: "Doubles Player" }
    ],
    availability: "Mornings",
  },
  {
    id: "g-7",
    isGroup: true,
    name: "Hoop Dreams",
    sport: "Basketball",
    size: 4,
    skillLevel: "Intermediate",
    location: "Mumbai, 3.8 km away",
    rating: 4.3,
    matches: 19,
    winRate: "52%",
    members: [
      { id: 1001, name: "Amritpal Singh", sport: "Basketball", skillLevel: "Advanced", rating: 4.5, role: "Center" },
      { id: 1002, name: "Vishesh Bhriguvanshi", sport: "Basketball", skillLevel: "Advanced", rating: 4.6, role: "Guard" },
      { id: 1003, name: "Satnam Singh", sport: "Basketball", skillLevel: "Intermediate", rating: 4.3, role: "Center" },
      { id: 1004, name: "Pranav Pinjarkar", sport: "Basketball", skillLevel: "Beginner", rating: 4.0, role: "Forward" }
    ],
    availability: "Weekends",
  },
  {
    id: "g-8",
    isGroup: true,
    name: "Juhu Titans FC",
    sport: "Football",
    size: 9,
    skillLevel: "Advanced",
    location: "Mumbai, 6.2 km away",
    rating: 4.6,
    matches: 40,
    winRate: "68%",
    members: [
      { id: 1101, name: "Vikram Sen", sport: "Football", skillLevel: "Advanced", rating: 4.6, role: "Defender" },
      { id: 1102, name: "Sanjay Dutta", sport: "Football", skillLevel: "Advanced", rating: 4.5, role: "Midfielder" },
      { id: 1103, name: "Aman Preet", sport: "Football", skillLevel: "Intermediate", rating: 4.4, role: "Striker" },
      { id: 1104, name: "Rishabh Roy", sport: "Football", skillLevel: "Intermediate", rating: 4.3, role: "Midfielder" },
      { id: 1105, name: "Tushar Dev", sport: "Football", skillLevel: "Beginner", rating: 4.1, role: "Defender" },
      { id: 1106, name: "Kunal Jha", sport: "Football", skillLevel: "Intermediate", rating: 4.2, role: "Defender" },
      { id: 1107, name: "Hardik Pal", sport: "Football", skillLevel: "Advanced", rating: 4.5, role: "Midfielder" },
      { id: 1108, name: "Nitin Vyas", sport: "Football", skillLevel: "Intermediate", rating: 4.3, role: "Defender" },
      { id: 1109, name: "Sumit Gill", sport: "Football", skillLevel: "Advanced", rating: 4.6, role: "Goalkeeper" }
    ],
    availability: "Evenings",
  },
  {
    id: "g-9",
    isGroup: true,
    name: "Chembur Challengers",
    sport: "Cricket",
    size: 8,
    skillLevel: "Advanced",
    location: "Mumbai, 8.5 km away",
    rating: 4.7,
    matches: 50,
    winRate: "70%",
    members: [
      { id: 1201, name: "Abhinav Bindra", sport: "Cricket", skillLevel: "Expert", rating: 4.8, role: "Batsman" },
      { id: 1202, name: "Gagan Narang", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "Bowler" },
      { id: 1203, name: "Rajyavardhan Rathore", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "All-rounder" },
      { id: 1204, name: "Vijay Kumar", sport: "Cricket", skillLevel: "Advanced", rating: 4.5, role: "Batsman" },
      { id: 1205, name: "Sushil Kumar", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "Bowler" },
      { id: 1206, name: "Mary Kom", sport: "Cricket", skillLevel: "Expert", rating: 4.8, role: "Wicket Keeper" },
      { id: 1207, name: "Mary Kom", sport: "Cricket", skillLevel: "Expert", rating: 4.8, role: "Wicket Keeper" },
      { id: 1208, name: "Saina Nehwal", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "Bowler" }
    ],
    availability: "Weekends",
  },
  {
    id: "g-10",
    isGroup: true,
    name: "Thane Hawks FC",
    sport: "Football",
    size: 6,
    skillLevel: "Intermediate",
    location: "Thane, 19.5 km away",
    rating: 4.3,
    matches: 24,
    winRate: "50%",
    members: [
      { id: 1301, name: "Joy Banerjee", sport: "Football", skillLevel: "Intermediate", rating: 4.3, role: "Striker" },
      { id: 1302, name: "Sourav Ganguly", sport: "Football", skillLevel: "Advanced", rating: 4.6, role: "Midfielder" },
      { id: 1303, name: "Sachin Tendulkar", sport: "Football", skillLevel: "Expert", rating: 4.9, role: "Striker" },
      { id: 1304, name: "Rahul Dravid", sport: "Football", skillLevel: "Advanced", rating: 4.7, role: "Goalkeeper" },
      { id: 1305, name: "VVS Laxman", sport: "Football", skillLevel: "Intermediate", rating: 4.5, role: "Defender" },
      { id: 1306, name: "Anil Kumble", sport: "Football", skillLevel: "Advanced", rating: 4.6, role: "Defender" }
    ],
    availability: "Weekends",
  },
  {
    id: "g-11",
    isGroup: true,
    name: "Pune Blasters XI",
    sport: "Cricket",
    size: 9,
    skillLevel: "Expert",
    location: "Pune, 120.0 km away",
    rating: 4.9,
    matches: 90,
    winRate: "80%",
    members: [
      { id: 1401, name: "MS Dhoni", sport: "Cricket", skillLevel: "Expert", rating: 5.0, role: "Wicket Keeper" },
      { id: 1402, name: "Virat Kohli", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "Batsman" },
      { id: 1403, name: "Rohit Sharma", sport: "Cricket", skillLevel: "Expert", rating: 4.8, role: "Batsman" },
      { id: 1404, name: "Jasprit Bumrah", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "Bowler" },
      { id: 1405, name: "Hardik Pandya", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "All-rounder" },
      { id: 1406, name: "KL Rahul", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "Batsman" },
      { id: 1407, name: "Ravindra Jadeja", sport: "Cricket", skillLevel: "Expert", rating: 4.8, role: "All-rounder" },
      { id: 1408, name: "Mohammed Shami", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "Bowler" },
      { id: 1409, name: "Rishabh Pant", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "Batsman" }
    ],
    availability: "Weekdays",
  }
];

const sportsOptions = [
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
];

export function PlayerMatching() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("1");
  const [inviteMessage, setInviteMessage] = useState("");
  const [invitedPlayers, setInvitedPlayers] = useState({});
  const [isSending, setIsSending] = useState(false);

  // Quick matchmaking scanner states
  const [isRadarScanning, setIsRadarScanning] = useState(false);
  const [radarProgress, setRadarProgress] = useState(0);
  const [radarConfetti, setRadarConfetti] = useState(false);

  const handleQuickMatchJoin = () => {
    setIsRadarScanning(true);
    setRadarProgress(0);
    
    const interval = setInterval(() => {
      setRadarProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12;
      });
    }, 250);

    setTimeout(() => {
      setIsRadarScanning(false);
      setRadarConfetti(true);
      toast.success("🎯 Quick Match found: Juhu Jaguars FC (Football) is seeking a Midfielder!");
      setTimeout(() => {
        setRadarConfetti(false);
        navigate("/teams");
      }, 4000);
    }, 2800);
  };


  // New Matchmaking Lobby states
  const [squadLobby, setSquadLobby] = useState({
    active: false,
    sport: "Cricket",
    maxSize: 10,
    members: []
  });
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [isCreateLobbyOpen, setIsCreateLobbyOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  
  // Squad Join Modal state
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState(null);
  const [isJoinSquadModalOpen, setIsJoinSquadModalOpen] = useState(false);
  const [joinSquadRole, setJoinSquadRole] = useState("All-rounder");
  const [joinSquadMessage, setJoinSquadMessage] = useState("");

  // Create lobby form states
  const [formSport, setFormSport] = useState("Cricket");
  const [formSize, setFormSize] = useState(10);

  const handleCreateSquad = () => {
    const hostUser = { id: 99, name: "You (Host)", sport: formSport, skillLevel: "Expert", rating: 5.0, role: "host" };

    setSquadLobby({
      active: true,
      sport: formSport,
      maxSize: formSize,
      members: [hostUser]
    });
    setInvitedPlayers({});
    setJoinRequests([]);
    setIsCreateLobbyOpen(false);
    setIsLobbyOpen(true);
    toast.success(`Squad lobby created for ${formSport}!`);
  };

  const handleKickMember = (memberId, memberName) => {
    setSquadLobby((prev) => {
      const updatedMembers = prev.members.filter((m) => m.id !== memberId);
      return { ...prev, members: updatedMembers };
    });
    setInvitedPlayers((prev) => {
      const updated = { ...prev };
      delete updated[memberId];
      return updated;
    });
    toast.success(`${memberName} removed from squad.`);
  };

  const handleAcceptRequest = (request) => {
    setSquadLobby((prev) => {
      if (request.isGroup) {
        if (prev.members.length + request.size > prev.maxSize) {
          toast.error(`Not enough slots left for group "${request.groupName}"! Need ${request.size} slots, only ${prev.maxSize - prev.members.length} left.`);
          return prev;
        }
        const newMembers = request.members.map((m) => ({
          ...m,
          role: "player"
        }));
        toast.success(`⚡ Group "${request.groupName}" (${request.size} players) joined your squad lobby!`);
        return {
          ...prev,
          members: [...prev.members, ...newMembers]
        };
      } else {
        if (prev.members.length >= prev.maxSize) {
          toast.error("Lobby is already full!");
          return prev;
        }
        toast.success(`⚡ ${request.name} joined your squad lobby!`);
        return {
          ...prev,
          members: [...prev.members, { ...request, role: "player" }]
        };
      }
    });
    setJoinRequests((prev) => prev.filter((r) => r.id !== request.id));
  };

  const handleDeclineRequest = (requestId, playerName) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast.error(`Declined join request from ${playerName}.`);
  };

  const handleDisbandSquad = () => {
    setSquadLobby({ active: false, sport: "Cricket", maxSize: 10, members: [] });
    setInvitedPlayers({});
    setJoinRequests([]);
    setIsLobbyOpen(false);
    toast.error("Squad disbanded.");
  };

  const [matchingTab, setMatchingTab] = useState("players"); // "players" | "groups"
  const userSports = currentUser?.selectedSports || ["football", "cricket", "badminton"];

  const parseDistanceStr = (locStr) => {
    if (!locStr) return 0;
    const match = locStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 999;
  };

  const handleRequestGroupJoin = (group) => {
    setSelectedGroupToJoin(group);
    const isCricket = group.sport.toLowerCase() === "cricket";
    const isFootball = group.sport.toLowerCase() === "football";
    setJoinSquadRole(isCricket ? "Batsman" : isFootball ? "Striker" : "Singles Partner");
    setJoinSquadMessage(`Hey captain, I'm a middle-order player, would love to join your squad for this match!`);
    setIsJoinSquadModalOpen(true);
  };

  const handleSubmitSquadJoinRequest = () => {
    if (!selectedGroupToJoin) return;
    setIsJoinSquadModalOpen(false);
    const groupId = selectedGroupToJoin.id;
    const groupName = selectedGroupToJoin.name;

    setInvitedPlayers((prev) => ({ ...prev, [groupId]: "invited" }));
    toast.info(`Sent join request to squad "${groupName}" as ${joinSquadRole}! Waiting for captain approval...`);

    // Simulate approval
    setTimeout(() => {
      setInvitedPlayers((prev) => ({ ...prev, [groupId]: "joined" }));
      toast.success(`✓ Joined squad "${groupName}" successfully as ${joinSquadRole}!`);
      setRadarConfetti(true);
      setTimeout(() => setRadarConfetti(false), 4500);
    }, 4000);
  };


  const handleOpenInvite = (playerOrGroup) => {
    if (playerOrGroup.isGroup) {
      if (squadLobby.active) {
        handleSquadInviteGroup(playerOrGroup);
      } else {
        setSelectedPlayer({
          id: playerOrGroup.id,
          name: playerOrGroup.name,
          sport: playerOrGroup.sport,
          skillLevel: playerOrGroup.skillLevel,
          rating: playerOrGroup.rating,
          isGroup: true
        });
        setSelectedBooking("1");
        setInviteMessage(`Hey guys, I saw your group "${playerOrGroup.name}" and wanted to invite you to join our match! Let me know if you are interested.`);
        setIsInviteOpen(true);
      }
    } else {
      if (squadLobby.active) {
        handleSquadInvite(playerOrGroup);
      } else {
        setSelectedPlayer(playerOrGroup);
        setSelectedBooking("1");
        setInviteMessage(`Hey ${playerOrGroup.name}, I saw you play ${playerOrGroup.sport} and wanted to invite you to join our match! Let me know if you are available.`);
        setIsInviteOpen(true);
      }
    }
  };

  const handleSquadInviteGroup = (group) => {
    if (squadLobby.members.length + group.size > squadLobby.maxSize) {
      toast.error(`Not enough slots left in your squad for group "${group.name}"! Need ${group.size} slots, only ${squadLobby.maxSize - squadLobby.members.length} left.`);
      return;
    }
    setInvitedPlayers((prev) => ({ ...prev, [group.id]: "invited" }));
    toast.success(`Invite sent to group "${group.name}"! Waiting for response...`);

    setTimeout(() => {
      setInvitedPlayers((prev) => {
        if (!prev[group.id]) return prev;

        setSquadLobby((lobbyPrev) => {
          if (!lobbyPrev.active) return lobbyPrev;
          if (lobbyPrev.members.length + group.size > lobbyPrev.maxSize) {
            toast.error(`Squad is full! Group "${group.name}" couldn't join.`);
            return lobbyPrev;
          }

          const newMembers = group.members.map((m) => ({
            id: m.id,
            name: m.name,
            sport: m.sport,
            skillLevel: m.skillLevel,
            rating: m.rating,
            role: "player"
          }));

          toast.success(`⚡ Group "${group.name}" joined your squad lobby!`);
          return {
            ...lobbyPrev,
            members: [...lobbyPrev.members, ...newMembers]
          };
        });

        return { ...prev, [group.id]: "joined" };
      });
    }, 3000);
  };

  const handleSquadInvite = (player) => {
    if (squadLobby.members.length >= squadLobby.maxSize) {
      toast.error("Lobby is already full!");
      return;
    }
    setInvitedPlayers((prev) => ({ ...prev, [player.id]: "invited" }));
    toast.success(`Invite sent to ${player.name}! Waiting for response...`);

    // Simulate accept after 3 seconds
    setTimeout(() => {
      setInvitedPlayers((prev) => {
        if (!prev[player.id]) return prev;

        setSquadLobby((lobbyPrev) => {
          if (!lobbyPrev.active) return lobbyPrev;
          if (lobbyPrev.members.length >= lobbyPrev.maxSize) {
            toast.error(`Squad is full! ${player.name} couldn't join.`);
            return lobbyPrev;
          }
          const isAlreadyJoined = lobbyPrev.members.some((m) => m.id === player.id);
          if (isAlreadyJoined) return lobbyPrev;

          toast.success(`⚡ ${player.name} joined your squad lobby!`);
          return {
            ...lobbyPrev,
            members: [...lobbyPrev.members, {
              id: player.id,
              name: player.name,
              sport: player.sport,
              skillLevel: player.skillLevel,
              rating: player.rating,
              role: "player"
            }]
          };
        });

        return { ...prev, [player.id]: "joined" };
      });
    }, 3000);
  };

  const handleSendInvite = () => {
    if (!selectedPlayer) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsInviteOpen(false);
      setInvitedPlayers((prev) => ({ ...prev, [selectedPlayer.id]: "joined" }));
      toast.success(`Invitation sent successfully to ${selectedPlayer.name}!`);
    }, 1200);
  };

  // Simulated member dropout
  useEffect(() => {
    if (!squadLobby.active) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.15 && squadLobby.members.length > 2 && squadLobby.members.length < squadLobby.maxSize) {
        const mockMembers = squadLobby.members.filter((m) => m.id >= 101 && m.id <= 106);
        if (mockMembers.length > 0) {
          const leavee = mockMembers[Math.floor(Math.random() * mockMembers.length)];
          setSquadLobby((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== leavee.id)
          }));
          setInvitedPlayers((prev) => {
            const updated = { ...prev };
            delete updated[leavee.id];
            return updated;
          });
          toast.error(`💔 ${leavee.name} left the squad lobby.`);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [squadLobby.active, squadLobby.members.length, squadLobby.maxSize]);

  // Simulated incoming requests from other online users
  useEffect(() => {
    if (!squadLobby.active) return;

    const interval = setInterval(() => {
      const currentFilled = squadLobby.members.length;
      if (Math.random() < 0.35 && currentFilled < squadLobby.maxSize) {
        const isGroupRequest = Math.random() < 0.40;

        if (isGroupRequest) {
          const groupNames = ["Gully Cricketers", "Weekend Warriors", "Local Club Friends", "Turf Kings"];
          const selectedGroupName = groupNames[Math.floor(Math.random() * groupNames.length)];

          const availablePlayers = players.filter(
            (p) =>
              !squadLobby.members.some((m) => m.name === p.name) &&
              !joinRequests.some((r) => r.isGroup ? r.members.some(gm => gm.name === p.name) : r.name === p.name)
          );

          if (availablePlayers.length >= 3) {
            const groupMembers = availablePlayers.slice(0, 3).map((p, idx) => ({
              id: 300 + idx + Math.floor(Math.random() * 100),
              name: p.name,
              sport: squadLobby.sport,
              skillLevel: p.skillLevel,
              rating: p.rating
            }));

            const groupReq = {
              id: "group-" + Date.now(),
              isGroup: true,
              groupName: selectedGroupName,
              size: 3,
              members: groupMembers
            };

            setJoinRequests((prev) => [...prev, groupReq]);

            toast(`👥 Group "${selectedGroupName}" (${groupReq.size} players) wants to join your squad!`, {
              action: {
                label: "Review",
                onClick: () => setIsLobbyOpen(true)
              }
            });
          }
        } else {
          const availableMockPlayers = players.filter(
            (p) =>
              !squadLobby.members.some((m) => m.name === p.name) &&
              !joinRequests.some((r) => r.isGroup ? r.members.some(gm => gm.name === p.name) : r.name === p.name)
          );

          if (availableMockPlayers.length > 0) {
            const randomPlayer = availableMockPlayers[Math.floor(Math.random() * availableMockPlayers.length)];
            const newRequest = {
              id: randomPlayer.id,
              name: randomPlayer.name,
              sport: squadLobby.sport,
              skillLevel: randomPlayer.skillLevel,
              rating: randomPlayer.rating
            };
            setJoinRequests((prev) => [...prev, newRequest]);

            toast(`🔔 ${randomPlayer.name} wants to join your ${squadLobby.sport} squad!`, {
              action: {
                label: "Review",
                onClick: () => setIsLobbyOpen(true)
              }
            });
          }
        }
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [squadLobby.active, squadLobby.members.length, squadLobby.maxSize, joinRequests.length]);

  return (
    <div className="space-y-6">
      {/* Radar confetti celebration */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {radarConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 1.5;
              const duration = 1.5 + Math.random() * 2;
              const color = ["#6DFF3B", "#FFD700", "#FF4500", "#00BFFF", "#FF69B4", "#8A2BE2"][Math.floor(Math.random() * 6)];
              const size = 6 + Math.random() * 8;
              return (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
                  animate={{
                    y: "105vh",
                    x: `${left + (Math.random() * 14 - 7)}vw`,
                    rotate: 360,
                    opacity: 0
                  }}
                  transition={{ duration: duration, delay: delay, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                    top: 0,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Match Radar Scanner Dialog Modal */}
      <Dialog open={isRadarScanning} onOpenChange={setIsRadarScanning}>
        <DialogContent className="bg-black/95 border-zinc-800 text-white sm:max-w-md p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center my-4">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#6DFF3B]/30 animate-spin" style={{ animationDuration: "12s" }} />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#6DFF3B]/40 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
            <div className="absolute inset-8 rounded-full bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 animate-pulse" />
            <Target className="h-10 w-10 text-[#6DFF3B] z-10 animate-bounce" />
          </div>
          <h3 className="font-extrabold text-lg text-[#6DFF3B] tracking-wide uppercase">Quick Match Radar Active</h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xs">
            Scanning for active squad lobbies within 10 km that need players matching your preferred sports...
          </p>
          <div className="w-full mt-6 space-y-1.5">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden animate-pulse">
              <div className="h-full bg-[#6DFF3B] transition-all duration-300" style={{ width: `${radarProgress}%` }} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Progress: {Math.min(100, Math.floor(radarProgress))}%</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-3xl ">Find Players</h1>
        <p className="text-muted-foreground mt-1">
          Connect with players nearby and build your team
        </p>
      </div>

      {/* Create Squad Lobby Banner */}
      {!squadLobby.active ? (
        <Card className="border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#13161c] rounded-[28px] relative overflow-hidden shadow-md dark:shadow-2xl min-h-[260px] flex items-center">
          <div className="w-full p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 pr-6 lg:pr-[38%]">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 flex items-center justify-center text-[#6DFF3B] shrink-0 shadow-lg shadow-[#6DFF3B]/5">
                <Trophy className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Multiplayer Squad Matchmaking
                </h2>
                <p className="text-sm text-slate-500 dark:text-white/60 max-w-xl leading-relaxed">
                  Want to play with a squad? Launch a live Matchmaking Lobby! Other players can search and request to join your squad, or you can invite them directly. Fill all slots together and split costs before booking the turf.
                </p>
                <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                  <Badge variant="outline" className="text-[11px] py-1 border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/[0.02] text-slate-600 dark:text-white/60">
                    👥 Host Approval Required
                  </Badge>
                  <Badge variant="outline" className="text-[11px] py-1 border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/[0.02] text-slate-600 dark:text-white/60">
                    💳 Split cost or Pay Full
                  </Badge>
                  <Badge variant="outline" className="text-[11px] py-1 border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/[0.02] text-slate-600 dark:text-white/60">
                    ⚡ Live match lobby room
                  </Badge>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 lg:w-auto z-10">
              <Button
                onClick={() => setIsCreateLobbyOpen(true)}
                className="w-full sm:w-auto bg-[#6DFF3B] text-black hover:bg-[#5ce630] rounded-xl font-bold px-5 h-11 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-xs shrink-0"
              >
                <Plus className="h-4 w-4" /> Create Squad Lobby
              </Button>
              
              <Button
                onClick={() => navigate("/teams")}
                variant="outline"
                className="w-full sm:w-auto border-border/80 text-foreground hover:bg-muted bg-card/40 backdrop-blur-md rounded-xl font-bold px-5 h-11 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-xs shrink-0"
              >
                <Users className="h-4 w-4 text-[#6DFF3B]" /> Play in Another Team
              </Button>

              <Button
                onClick={handleQuickMatchJoin}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold px-5 h-11 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-xs shrink-0"
              >
                <Target className="h-4 w-4" /> Quick Match Join
              </Button>
            </div>
          </div>


          {/* Styled Floating Image on the right side */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[35%] h-full pointer-events-none">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#13161c] to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80"
              alt="Matchmaking Squad"
              className="w-full h-full object-cover object-center brightness-[0.85] dark:brightness-75"
            />
          </div>

          {/* Decorative background blurs for non-lg layout */}
          <div className="lg:hidden absolute right-0 top-0 w-32 h-32 bg-[#6DFF3B]/5 blur-[60px] pointer-events-none" />
        </Card>
      ) : (
        <Card className="border border-[#6DFF3B]/20 bg-[#6DFF3B]/5 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Squad Lobby: {squadLobby.sport} ({squadLobby.members.length}/{squadLobby.maxSize} Joined)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lobby is active. Invite other players below to fill the remaining {squadLobby.maxSize - squadLobby.members.length} slots.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsLobbyOpen(true)}
                className="border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl cursor-pointer"
              >
                Manage Lobby
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisbandSquad}
                className="rounded-xl cursor-pointer"
              >
                Disband
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search players..." className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                All Sports
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Cricket
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Football
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Tennis
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Basketball
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Players", value: "2,450" },
          { label: "Online Now", value: "342" },
          { label: "Near You", value: "128" },
          { label: "Matches Today", value: "56" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl  mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Segmented Category Tabs Toggle */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-1.5 mt-2">
        <button
          onClick={() => setMatchingTab("players")}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${matchingTab === "players"
            ? "border-[#6DFF3B] text-emerald-600 dark:text-[#6DFF3B]"
            : "border-transparent text-slate-500 hover:text-slate-400"
            }`}
        >
          Individual Players
        </button>
        <button
          onClick={() => setMatchingTab("groups")}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${matchingTab === "groups"
            ? "border-[#6DFF3B] text-emerald-600 dark:text-[#6DFF3B]"
            : "border-transparent text-slate-500 hover:text-slate-400"
            }`}
        >
          Teams & Squad Groups
        </button>
      </div>

      {matchingTab === "players" ? (
        /* Players Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(() => {
            const filtered = players.filter((player) => {
              const distance = parseDistanceStr(player.location);
              const isClose = distance <= 10;
              const matchesSport = userSports.some(sportId => {
                const sportObj = sportsOptions.find(s => s.id === sportId);
                const sportName = sportObj ? sportObj.name.toLowerCase() : sportId.toLowerCase();
                return player.sport.toLowerCase().includes(sportName) || sportName.includes(player.sport.toLowerCase());
              });
              return isClose && matchesSport;
            });

            if (filtered.length === 0) {
              return (
                <div className="col-span-full py-12 text-center bg-card rounded-2xl border border-border/60">
                  <p className="text-sm font-semibold text-muted-foreground">No players matching preferred sports within 10 km.</p>
                </div>
              );
            }

            return filtered.map((player, index) => {
              const isJoined = squadLobby.members.some((m) => m.id === player.id) || invitedPlayers[player.id] === "joined";
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all border-border/50 bg-card rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="text-lg bg-primary text-primary-foreground font-semibold">
                            {player.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1 text-foreground">{player.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-border text-foreground">
                              {player.sport}
                            </Badge>
                            <Badge
                              className={`text-xs border-0 ${skillColors[player.skillLevel]}`}
                            >
                              {player.skillLevel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 text-[#6DFF3B]" />
                            <span className="text-xs">{player.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm text-foreground">{player.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Trophy className="h-3 w-3 text-[#6DFF3B]" />
                            <span className="text-sm text-foreground">{player.matches}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Matches</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-accent" />
                            <span className="text-sm text-foreground">{player.winRate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="text-foreground">{player.preferredPosition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Availability:</span>
                          <span className="text-foreground">{player.availability}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => handleOpenInvite(player)}
                          disabled={!!invitedPlayers[player.id] || squadLobby.members.some((m) => m.id === player.id)}
                          className={`${isJoined ? "flex-1" : "w-full"} gap-2 cursor-pointer transition-all duration-300 ${isJoined
                              ? "bg-slate-100 dark:bg-[#101216] border border-slate-200 dark:border-white/[0.08] text-emerald-600 dark:text-[#6DFF3B] disabled:opacity-100"
                              : invitedPlayers[player.id] === "invited"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-transparent disabled:opacity-100"
                                : "bg-[#6DFF3B] text-[#050505] hover:bg-[#86ff60]"
                            }`}
                        >
                          {isJoined ? (
                            <>
                              <Check className="h-4 w-4" />
                              Joined Squad
                            </>
                          ) : invitedPlayers[player.id] === "invited" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Inviting...
                            </>
                          ) : squadLobby.active ? (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Invite to Squad
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Invite
                            </>
                          )}
                        </Button>
                        {isJoined && (
                          <Button variant="outline" className="flex-1 gap-2 cursor-pointer border-border text-foreground hover:bg-muted">
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            });
          })()}
        </div>

      ) : (
        /* Groups Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(() => {
            const filtered = mockGroups.filter((group) => {
              const distance = parseDistanceStr(group.location);
              const isClose = distance <= 10;
              const matchesSport = userSports.some(sportId => {
                const sportObj = sportsOptions.find(s => s.id === sportId);
                const sportName = sportObj ? sportObj.name.toLowerCase() : sportId.toLowerCase();
                return group.sport.toLowerCase().includes(sportName) || sportName.includes(group.sport.toLowerCase());
              });
              return isClose && matchesSport;
            });

            if (filtered.length === 0) {
              return (
                <div className="col-span-full py-12 text-center bg-card rounded-2xl border border-border/60">
                  <p className="text-sm font-semibold text-muted-foreground">No squad groups matching preferred sports within 10 km.</p>
                </div>
              );
            }

            return filtered.map((group, index) => {
              const groupJoined = invitedPlayers[group.id] === "joined" || squadLobby.members.some(m => group.members.some(gm => gm.id === m.id));
              const groupInvited = invitedPlayers[group.id] === "invited";
              const reliabilityMock = 94 + (index % 5);

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all border-border/50 bg-card rounded-2xl overflow-hidden text-left">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold shrink-0">
                          👥
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold mb-1 truncate text-foreground">{group.name}</h3>
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            <Badge variant="outline" className="text-xs border-border text-foreground">
                              {group.sport}
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs border-0 font-bold">
                              {group.size} Players
                            </Badge>
                            <Badge
                              className={`text-xs border-0 ${skillColors[group.skillLevel]}`}
                            >
                              {group.skillLevel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                            <MapPin className="h-3 w-3 text-[#6DFF3B]" />
                            <span className="text-xs">{group.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm text-foreground">{group.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Trophy className="h-3 w-3 text-[#6DFF3B]" />
                            <span className="text-sm text-foreground">{group.matches}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Matches</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-accent" />
                            <span className="text-sm text-foreground">{group.winRate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Members:</span>
                          <span className="truncate max-w-[150px] font-semibold text-foreground" title={group.members.map(m => m.name).join(", ")}>
                            {group.members.map(m => m.name.split(" ")[0]).join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reliability Score:</span>
                          <span className="font-bold text-[#6DFF3B]">🛡️ {reliabilityMock}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Availability:</span>
                          <span className="text-foreground">{group.availability}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => {
                            if (squadLobby.active) {
                              handleOpenInvite(group);
                            } else {
                              handleRequestGroupJoin(group);
                            }
                          }}
                          disabled={groupJoined || (groupInvited && squadLobby.active)}
                          className={`${groupJoined ? "flex-1" : "w-full"} gap-2 cursor-pointer transition-all duration-300 ${groupJoined
                            ? "bg-slate-100 dark:bg-[#101216] border border-slate-200 dark:border-white/[0.08] text-emerald-600 dark:text-[#6DFF3B] disabled:opacity-100"
                            : groupInvited
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-transparent disabled:opacity-100 font-bold"
                              : "bg-[#6DFF3B] text-[#050505] hover:bg-[#86ff60]"
                            }`}
                        >
                          {groupJoined ? (
                            <>
                              <Check className="h-4 w-4" />
                              Joined Squad
                            </>
                          ) : groupInvited ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {squadLobby.active ? "Inviting..." : "Requested..."}
                            </>
                          ) : squadLobby.active ? (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Invite Group
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Request to Join Squad
                            </>
                          )}
                        </Button>
                        {groupJoined && (
                          <Button variant="outline" className="flex-1 gap-2 cursor-pointer border-border text-foreground hover:bg-muted">
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            });
          })()}
        </div>

      )}

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" size="lg">
          Load More Players
        </Button>
      </div>

      {/* Dialog Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <UserPlus className="h-5 w-5 text-[#6DFF3B]" />
              Invite Player
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-white/60 text-xs">
              Send an invitation to join your scheduled turf booking.
            </DialogDescription>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-4 my-2">
              {/* Player Card Mini Summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm bg-[#6DFF3B] text-black font-semibold">
                    {selectedPlayer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{selectedPlayer.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] py-0 border-slate-200 dark:border-white/20 text-slate-600 dark:text-white/70">
                      {selectedPlayer.sport}
                    </Badge>
                    <Badge className={`text-[10px] py-0 border-0 ${skillColors[selectedPlayer.skillLevel]}`}>
                      {selectedPlayer.skillLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Match selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Select Your Match</label>
                <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                  <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white text-sm hover:bg-slate-100/50 dark:hover:bg-white/[0.05]">
                    <SelectValue placeholder="Select a match" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#101216] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl">
                    {mockBookings.map((booking) => (
                      <SelectItem
                        key={booking.id}
                        value={booking.id}
                        className="cursor-pointer rounded-lg my-0.5 focus:bg-[#6DFF3B]/10 focus:text-slate-950 dark:focus:text-[#6DFF3B]"
                      >
                        <div className="flex flex-col text-left py-0.5">
                          <span className="font-medium text-xs text-slate-900 dark:text-white">{booking.venueName}</span>
                          <span className="text-[9px] text-slate-500 dark:text-white/50">{booking.date} • {booking.time} ({booking.sport})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message text input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Message</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full min-h-[90px] rounded-xl border border-slate-200 bg-slate-50/50 dark:border-white/[0.08] dark:bg-white/[0.03] p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#6DFF3B] dark:focus:border-[#6DFF3B] placeholder-slate-400 dark:placeholder-white/30 resize-none"
                  placeholder="Hey, join our match!"
                />
              </div>

              {/* Split cost switch */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="dialogSplitCost"
                  className="rounded border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 text-[#6DFF3B] focus:ring-[#6DFF3B] cursor-pointer accent-[#6DFF3B] h-4 w-4"
                />
                <label htmlFor="dialogSplitCost" className="text-xs text-slate-600 dark:text-white/60 select-none cursor-pointer">
                  Split turf booking fee with player
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              className="border-slate-200 hover:bg-slate-100 text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06] rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={isSending}
              className="bg-[#6DFF3B] text-black hover:bg-[#86ff60] min-w-[120px] rounded-xl font-medium cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Lobby Dialog */}
      <Dialog open={isCreateLobbyOpen} onOpenChange={setIsCreateLobbyOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Trophy className="h-5 w-5 text-[#6DFF3B]" />
              Launch Squad Lobby
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-white/60 text-xs">
              Configure your squad to begin matchmaking other players.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Select Sport */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Select Sport</label>
              <div className="flex flex-wrap gap-2">
                {["Cricket", "Football", "Tennis", "Basketball"].map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setFormSport(sport)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition cursor-pointer ${formSport === sport
                      ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10 text-emerald-600 dark:text-[#6DFF3B]"
                      : "border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-slate-600 dark:text-white/68 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Squad Size */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Required Players (Squad Size)</label>
              <Select value={formSize.toString()} onValueChange={(val) => setFormSize(parseInt(val))}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white text-sm">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#101216] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl">
                  {[2, 4, 6, 8, 10, 12].map((size) => (
                    <SelectItem key={size} value={size.toString()} className="cursor-pointer rounded-lg my-0.5 focus:bg-[#6DFF3B]/10 focus:text-slate-950 dark:focus:text-[#6DFF3B]">
                      {size} Players {size === 10 ? "(Recommended for Cricket)" : ""} {size === 4 ? "(Doubles)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-[10px] text-muted-foreground italic">
              * Launching the lobby will automatically add you as the host, and auto-join matching players to get the squad started.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateLobbyOpen(false)}
              className="border-slate-200 hover:bg-slate-100 text-slate-900 dark:border-white/[0.03] dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06] rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSquad}
              className="bg-[#6DFF3B] text-black hover:bg-[#86ff60] min-w-[120px] rounded-xl font-semibold cursor-pointer"
            >
              Launch Lobby
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lobby Management Panel */}
      <Dialog open={isLobbyOpen} onOpenChange={setIsLobbyOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Lobby Room: {squadLobby.sport}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-white/60 text-xs mt-0.5">
                  Match Lobby waiting room. Search and invite players to complete the team.
                </DialogDescription>
              </div>
              <Badge className="bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 text-emerald-600 dark:text-[#6DFF3B] text-[10px] uppercase font-semibold">
                {squadLobby.members.length} / {squadLobby.maxSize} Joined
              </Badge>
            </div>
          </DialogHeader>

          {/* Members list */}
          <div className="my-2 space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {/* Join Requests */}
            {joinRequests.length > 0 && (
              <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-3">
                <label className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block flex items-center gap-1.5 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Pending Join Requests ({joinRequests.length})
                </label>
                <div className="space-y-2">
                  {joinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]"
                    >
                      {req.isGroup ? (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                            👥
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">Group: {req.groupName}</p>
                            <p className="text-[9px] text-slate-500 dark:text-white/50 truncate">
                              {req.members.map((m) => m.name.split(" ")[0]).join(", ")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {req.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{req.name}</p>
                            <p className="text-[9px] text-slate-500 dark:text-white/50 truncate">{req.skillLevel} • ★ {req.rating}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          onClick={() => handleAcceptRequest(req)}
                          className="h-7 px-3 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          {req.isGroup ? "Accept Group" : "Accept"}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeclineRequest(req.id, req.isGroup ? req.groupName : req.name)}
                          className="h-7 w-7 p-0 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Lobby Members</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {squadLobby.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-medium">
                        {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                        {member.name}
                        {member.role === "host" && (
                          <span title="Lobby Host">👑</span>
                        )}
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate capitalize">
                        {member.role === "host" ? "Squad Leader" : `Player • ★ ${member.rating}`}
                      </p>
                    </div>
                  </div>
                  {member.role !== "host" && (
                    <button
                      onClick={() => handleKickMember(member.id, member.name)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-500 text-slate-400 dark:text-slate-500 transition cursor-pointer"
                      title="Kick member"
                    >
                      <UserPlus className="h-3.5 w-3.5 rotate-45" />
                    </button>
                  )}
                </div>
              ))}

              {/* Show empty open slots */}
              {Array.from({ length: squadLobby.maxSize - squadLobby.members.length }).map((_, idx) => (
                <div
                  key={`open-${idx}`}
                  onClick={() => {
                    setIsLobbyOpen(false);
                    const searchInput = document.querySelector('input[placeholder="Search players..."]');
                    if (searchInput) searchInput.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] hover:border-[#6DFF3B]/30 hover:bg-[#6DFF3B]/5 transition cursor-pointer group text-slate-400 dark:text-white/35 min-h-[50px]"
                >
                  <span className="text-[10px] font-medium flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-[#6DFF3B] transition-colors">
                    <UserPlus className="h-3 w-3" />
                    Open Slot
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lobby progress indicator */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
            {squadLobby.members.length < squadLobby.maxSize ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-[#6DFF3B]" />
                    Finding remaining players...
                  </span>
                  <span>{Math.round((squadLobby.members.length / squadLobby.maxSize) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#6DFF3B] transition-all duration-500"
                    style={{ width: `${(squadLobby.members.length / squadLobby.maxSize) * 100}%` }}
                  />
                </div>
                <Button
                  onClick={() => {
                    setIsLobbyOpen(false);
                    navigate("/squad-booking", { state: { squadLobby } });
                  }}
                  className="w-full h-9 mt-2 bg-[#6DFF3B]/10 hover:bg-[#6DFF3B]/20 text-emerald-600 dark:text-[#6DFF3B] border border-[#6DFF3B]/20 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Proceed with Current Players ({squadLobby.members.length} Joined)
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-[#6DFF3B]/10 border border-[#6DFF3B]/20 rounded-xl space-y-3 shadow-md shadow-[#6DFF3B]/5 animate-pulse">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-[#6DFF3B]" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Squad is Full & Ready!</h4>
                    <p className="text-[10px] text-muted-foreground">All slots filled. You can now proceed to book a turf complex.</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setIsLobbyOpen(false);
                    navigate("/squad-booking", { state: { squadLobby } });
                  }}
                  className="w-full h-9 bg-[#6DFF3B] text-black hover:bg-[#86ff60] rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Book turf for your Squad
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2 border-t border-slate-100 dark:border-white/[0.08] pt-3">
            <Button
              variant="outline"
              onClick={() => setIsLobbyOpen(false)}
              className="border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white rounded-xl cursor-pointer"
            >
              Keep Searching
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisbandSquad}
              className="rounded-xl cursor-pointer"
            >
              Disband Squad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky Lobby Bar at Bottom */}
      {squadLobby.active && !isLobbyOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/85 dark:bg-[#101216]/85 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-full py-2.5 px-5 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>

              <div className="flex -space-x-2 shrink-0">
                {squadLobby.members.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-[#101216] flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-white"
                    title={member.name}
                  >
                    {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                ))}
                {squadLobby.members.length > 4 && (
                  <div className="h-7 w-7 rounded-full bg-[#6DFF3B] text-black border border-white dark:border-[#101216] flex items-center justify-center text-[10px] font-bold">
                    +{squadLobby.members.length - 4}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Active Squad: {squadLobby.sport} ({squadLobby.members.length}/{squadLobby.maxSize})
                </p>
                <p className="text-[9px] text-muted-foreground truncate">
                  {squadLobby.members.length === squadLobby.maxSize
                    ? "Squad is complete and ready!"
                    : `Waiting for ${squadLobby.maxSize - squadLobby.members.length} players...`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsLobbyOpen(true)}
                className="h-8 px-4 text-xs bg-[#6DFF3B] text-black hover:bg-[#86ff60] rounded-full font-semibold cursor-pointer"
              >
                Manage
              </Button>
              <Button
                variant="ghost"
                onClick={handleDisbandSquad}
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-500 cursor-pointer"
                title="Disband squad"
              >
                <UserPlus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Join Squad Lobby dialog form */}
      <Dialog open={isJoinSquadModalOpen} onOpenChange={setIsJoinSquadModalOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Users className="h-5 w-5 text-[#6DFF3B]" /> Join Squad Lobby
            </DialogTitle>
          </DialogHeader>
          {selectedGroupToJoin && (
            <div className="space-y-4 py-3 text-left">
              <div>
                <h4 className="font-bold text-sm text-foreground">{selectedGroupToJoin.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedGroupToJoin.sport} • {selectedGroupToJoin.location} • 🛡️ Host Reliability: {94 + (selectedGroupToJoin.id.charCodeAt(0) % 5)}%
                </p>
              </div>

              {/* Roster & Position Needs */}
              <div className="border border-border/60 bg-muted/30 p-3.5 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1.5">Current Roster</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedGroupToJoin.members.map((member, idx) => {
                      const rolesList = selectedGroupToJoin.sport.toLowerCase() === "cricket"
                        ? ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"]
                        : selectedGroupToJoin.sport.toLowerCase() === "football"
                        ? ["Striker", "Midfielder", "Defender", "Goalkeeper"]
                        : ["Singles Player", "Doubles Player"];
                      const role = member.role || rolesList[idx % rolesList.length];
                      return (
                        <div key={idx} className="bg-card px-2.5 py-1.5 rounded-xl border border-border/40 text-[10px] text-foreground flex items-center justify-between">
                          <span className="font-medium truncate max-w-[80px] text-foreground">{member.name}</span>
                          <Badge variant="outline" className="text-[8px] border-zinc-700 text-slate-400 px-1 py-0">{role}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-border/40 pt-2.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Vacancy & Needs</span>
                  <p className="text-xs font-bold text-[#6DFF3B]">
                    {10 - selectedGroupToJoin.members.length} slots remaining (Needed: {
                      selectedGroupToJoin.sport.toLowerCase() === "cricket" 
                        ? "Wicket Keeper, Bowler" 
                        : selectedGroupToJoin.sport.toLowerCase() === "football"
                        ? "Goalkeeper, Midfielder"
                        : "Partner"
                    })
                  </p>
                </div>
              </div>

              {/* Role selection buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Your Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedGroupToJoin.sport.toLowerCase() === "cricket"
                    ? ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"]
                    : selectedGroupToJoin.sport.toLowerCase() === "football"
                    ? ["Striker", "Midfielder", "Defender", "Goalkeeper"]
                    : ["Singles Partner", "Doubles Partner"]
                  ).map((pos) => {
                    const isNeeded = selectedGroupToJoin.sport.toLowerCase() === "cricket"
                      ? ["Bowler", "Wicket Keeper"].includes(pos)
                      : selectedGroupToJoin.sport.toLowerCase() === "football"
                      ? ["Goalkeeper", "Midfielder"].includes(pos)
                      : true;
                    return (
                      <button
                        key={pos}
                        type="button"
                        className={`h-10 rounded-xl text-xs font-semibold px-3 flex items-center justify-between border transition-all ${
                          joinSquadRole === pos
                            ? "bg-[#6DFF3B] text-black border-[#6DFF3B]"
                            : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                        onClick={() => setJoinSquadRole(pos)}
                      >
                        <span>{pos}</span>
                        {isNeeded && <Badge className="bg-blue-500/10 text-blue-400 text-[8px] font-bold px-1.5 border-none uppercase">Need</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message text area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message to Captain</label>
                <textarea
                  placeholder='e.g., "Hey captain, I am a striker, would love to join your match!"'
                  className="w-full bg-card border border-border text-foreground p-3 rounded-2xl text-xs focus:outline-none focus:border-[#6DFF3B] h-20 resize-none leading-relaxed"
                  value={joinSquadMessage}
                  onChange={(e) => setJoinSquadMessage(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-11 text-xs mt-2"
                onClick={handleSubmitSquadJoinRequest}
              >
                Send Join Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
