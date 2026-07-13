import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Plus,
  MessageSquare,
  Trophy,
  TrendingUp,
  UserPlus,
  Settings,
  Shield,
  ArrowRight,
  MapPin,
  Sparkles,
  Check,
  CheckCircle2,
  Ticket,
  CreditCard,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "../components/ui/empty-state";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Input } from "../components/ui/input";

const sportsOptions = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "gym", name: "Gym & Fitness", emoji: "🏋️" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
];

const getSportFormatSize = (sport) => {
  const s = (sport || "").toLowerCase();
  if (s.includes("cricket")) return 11;
  if (s.includes("football")) return 11;
  if (s.includes("basketball")) return 5;
  if (s.includes("badminton")) return 2;
  if (s.includes("volleyball")) return 6;
  return 11;
};

const teams = [
  {
    id: 1,
    name: "Mumbai Warriors",
    sport: "Cricket",
    members: 12,
    wins: 24,
    losses: 8,
    upcoming: 3,
    role: "Captain",
  },
  {
    id: 2,
    name: "Bandra Ballers",
    sport: "Basketball",
    members: 8,
    wins: 15,
    losses: 6,
    upcoming: 2,
    role: "Member",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Rohan Verma",
    role: "Captain",
    position: "All-rounder",
    matches: 45,
    status: "online",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    role: "Vice Captain",
    position: "Batsman",
    matches: 42,
    status: "online",
  },
  {
    id: 3,
    name: "Arjun Patel",
    role: "Member",
    position: "Bowler",
    matches: 38,
    status: "offline",
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Member",
    position: "Wicket Keeper",
    matches: 40,
    status: "online",
  },
  {
    id: 5,
    name: "Amit Kumar",
    role: "Member",
    position: "Batsman",
    matches: 35,
    status: "offline",
  },
];

export function TeamManagement() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "explore"
  const [userTeams, setUserTeams] = useState([
    {
      id: 1,
      name: "Mumbai Warriors",
      sport: "Cricket",
      members: 12,
      wins: 24,
      losses: 8,
      upcoming: 3,
      role: "Captain",
      roster: [
        { id: 1, name: "Rahul Sharma", role: "Captain", position: "Batsman", status: "online" },
        { id: 2, name: "Amit Patel", role: "Member", position: "Bowler", status: "online" },
        { id: 3, name: "Suresh Raina", role: "Member", position: "All-rounder", status: "offline" },
        { id: 4, name: "Priya Patel", role: "Member", position: "Batsman", status: "online" },
        { id: 5, name: "Arjun Malhotra", role: "Member", position: "Bowler", status: "online" },
        { id: 6, name: "Dev Patel", role: "Member", position: "Wicket Keeper", status: "online" }
      ]
    },
    {
      id: 2,
      name: "Bandra Ballers",
      sport: "Basketball",
      members: 8,
      wins: 15,
      losses: 6,
      upcoming: 2,
      role: "Member",
      roster: [
        { id: 1, name: "Kabir Singh", role: "Captain", position: "Point Guard", status: "online" },
        { id: 2, name: "Rishi Kapoor", role: "Member", position: "Shooting Guard", status: "online" },
        { id: 3, name: "Tara Sutaria", role: "Member", position: "Small Forward", status: "offline" },
        { id: 4, name: "Vishesh Bhriguvanshi", role: "Member", position: "Guard", status: "online" },
        { id: 5, name: "Satnam Singh", role: "Member", position: "Center", status: "online" }
      ]
    },
    {
      id: 3,
      name: "Powai Panthers FC",
      sport: "Football",
      members: 11,
      wins: 19,
      losses: 7,
      upcoming: 1,
      role: "Member",
      roster: [
        { id: 1, name: "Sunil Chhetri", role: "Captain", position: "Striker", status: "online" },
        { id: 2, name: "Gurpreet Singh", role: "Member", position: "Goalkeeper", status: "online" },
        { id: 3, name: "Anirudh Thapa", role: "Member", position: "Midfielder", status: "online" },
        { id: 4, name: "Sahal Samad", role: "Member", position: "Midfielder", status: "offline" },
        { id: 5, name: "Sandesh Jhingan", role: "Member", position: "Defender", status: "online" }
      ]
    },
    {
      id: 4,
      name: "Gully Kings CC",
      sport: "Cricket",
      members: 11,
      wins: 30,
      losses: 12,
      upcoming: 4,
      role: "Member",
      roster: [
        { id: 1, name: "Rohan Verma", role: "Captain", position: "Batsman", status: "online" },
        { id: 2, name: "Amit K.", role: "Member", position: "All-rounder", status: "online" },
        { id: 3, name: "Sanjay K.", role: "Member", position: "Bowler", status: "offline" },
        { id: 4, name: "Kuldeep Yadav", role: "Member", position: "Bowler", status: "online" }
      ]
    },
  ]);

  // Chat & Stats state variables
  const [chatTeam, setChatTeam] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");

  const [statsTeam, setStatsTeam] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const [selectedRosterTeamId, setSelectedRosterTeamId] = useState(1);

  const [exploreTeams, setExploreTeams] = useState([
    {
      id: "et-1",
      name: "Juhu Jaguars FC",
      sport: "Football",
      members: 9,
      maxMembers: 12,
      wins: 18,
      losses: 5,
      skillLevel: "Advanced",
      distance: "2.5 km away",
      distanceKm: 2.5,
      hostName: "Vikram Malhotra",
      hostReliability: 98,
      joinedRoster: [
        { name: "Vikram M.", role: "Midfielder" },
        { name: "Arjun M.", role: "Forward" },
        { name: "Rahul S.", role: "Defender" }
      ],
      neededPositions: ["Striker", "Goalkeeper"],
      status: "Explore"
    },
    {
      id: "et-2",
      name: "Chembur Challengers",
      sport: "Cricket",
      members: 8,
      maxMembers: 11,
      wins: 21,
      losses: 9,
      skillLevel: "Intermediate",
      distance: "8.5 km away",
      distanceKm: 8.5,
      hostName: "Abhinav Bindra",
      hostReliability: 96,
      joinedRoster: [
        { name: "Abhinav B.", role: "Batsman" },
        { name: "Mary K.", role: "Wicket Keeper" },
        { name: "Sushil K.", role: "Bowler" }
      ],
      neededPositions: ["All-rounder", "Bowler"],
      status: "Explore"
    },
    {
      id: "et-3",
      name: "Andheri Smashers CC",
      sport: "Cricket",
      members: 9,
      maxMembers: 11,
      wins: 25,
      losses: 11,
      skillLevel: "Advanced",
      distance: "5.0 km away",
      distanceKm: 5.0,
      hostName: "Hardik Pandya",
      hostReliability: 97,
      joinedRoster: [
        { name: "Hardik P.", role: "All-rounder" },
        { name: "Shikhar D.", role: "Batsman" },
        { name: "Jasprit B.", role: "Bowler" }
      ],
      neededPositions: ["Wicket Keeper", "Batsman"],
      status: "Explore"
    },
    {
      id: "et-4",
      name: "Elite Spikers VC",
      sport: "Volleyball",
      members: 5,
      maxMembers: 6,
      wins: 14,
      losses: 6,
      skillLevel: "Advanced",
      distance: "4.8 km away",
      distanceKm: 4.8,
      hostName: "Ranbir Kapoor",
      hostReliability: 94,
      joinedRoster: [
        { name: "Ranbir K.", role: "Setter" },
        { name: "John A.", role: "Attacker" }
      ],
      neededPositions: ["Blocker"],
      status: "Explore"
    },
    {
      id: "et-4b",
      name: "Malad Mavericks CC",
      sport: "Cricket",
      members: 9,
      maxMembers: 11,
      wins: 28,
      losses: 14,
      skillLevel: "Advanced",
      distance: "6.5 km away",
      distanceKm: 6.5,
      hostName: "Yuvraj Singh",
      hostReliability: 98,
      joinedRoster: [
        { name: "Yuvraj S.", role: "Batsman" },
        { name: "Zaheer K.", role: "Bowler" },
        { name: "Harbhajan S.", role: "Bowler" }
      ],
      neededPositions: ["All-rounder", "Bowler"],
      status: "Explore"
    },
    {
      id: "et-4c",
      name: "Bandra United FC",
      sport: "Football",
      members: 10,
      maxMembers: 11,
      wins: 34,
      losses: 10,
      skillLevel: "Expert",
      distance: "3.2 km away",
      distanceKm: 3.2,
      hostName: "Bhaichung Bhutia",
      hostReliability: 97,
      joinedRoster: [
        { name: "Bhaichung B.", role: "Striker" },
        { name: "Subrata P.", role: "Goalkeeper" }
      ],
      neededPositions: ["Midfielder"],
      status: "Explore"
    },
    {
      id: "et-4d",
      name: "Versova Volleys",
      sport: "Badminton",
      members: 1,
      maxMembers: 2,
      wins: 8,
      losses: 4,
      skillLevel: "Intermediate",
      distance: "1.8 km away",
      distanceKm: 1.8,
      hostName: "P. V. Sindhu",
      hostReliability: 99,
      joinedRoster: [
        { name: "P. V. Sindhu", role: "Singles" }
      ],
      neededPositions: ["Doubles Partner"],
      status: "Explore"
    },
    {
      id: "et-4e",
      name: "Ghatkopar Giants",
      sport: "Cricket",
      members: 8,
      maxMembers: 11,
      wins: 16,
      losses: 12,
      skillLevel: "Beginner",
      distance: "4.0 km away",
      distanceKm: 4.0,
      hostName: "Gautam Gambhir",
      hostReliability: 95,
      joinedRoster: [
        { name: "Gautam G.", role: "Batsman" },
        { name: "Virender S.", role: "Batsman" }
      ],
      neededPositions: ["Batsman", "Wicket Keeper"],
      status: "Explore"
    },
    {
      id: "et-5",
      name: "Pune Blasters",
      sport: "Cricket",
      members: 7,
      maxMembers: 11,
      wins: 10,
      losses: 15,
      skillLevel: "Intermediate",
      distance: "120 km away",
      distanceKm: 120.0,
      hostName: "Satish K.",
      hostReliability: 88,
      joinedRoster: [
        { name: "Satish K.", role: "Captain/Batsman" }
      ],
      neededPositions: ["Bowler", "All-rounder"],
      status: "Explore"
    },
    {
      id: "et-6",
      name: "Thane Smashers Club",
      sport: "Badminton",
      members: 3,
      maxMembers: 4,
      wins: 12,
      losses: 8,
      skillLevel: "Intermediate",
      distance: "18.5 km away",
      distanceKm: 18.5,
      hostName: "Anjali G.",
      hostReliability: 96,
      joinedRoster: [
        { name: "Anjali G.", role: "Singles" }
      ],
      neededPositions: ["Doubles Partner"],
      status: "Explore"
    }
  ]);

  const [teamInvites, setTeamInvites] = useState([
    {
      id: "inv-1",
      teamName: "Powai Panthers FC",
      sport: "Football",
      roleInvited: "Striker",
      distance: "1.5 km away",
      distanceKm: 1.5,
      hostReliability: 97,
    },
    {
      id: "inv-2",
      teamName: "Mumbai Cricket Club",
      sport: "Cricket",
      roleInvited: "All-rounder",
      distance: "4.2 km away",
      distanceKm: 4.2,
      hostReliability: 99,
    },
    {
      id: "inv-5",
      teamName: "Ghatkopar Strikers CC",
      sport: "Cricket",
      roleInvited: "Wicket Keeper",
      distance: "3.5 km away",
      distanceKm: 3.5,
      hostReliability: 96,
    },
    {
      id: "inv-6",
      teamName: "Bandra Badminton Club",
      sport: "Badminton",
      roleInvited: "Doubles",
      distance: "2.8 km away",
      distanceKm: 2.8,
      hostReliability: 98,
    },
    {
      id: "inv-7",
      teamName: "Juhu Football Club",
      sport: "Football",
      roleInvited: "Midfielder",
      distance: "2.0 km away",
      distanceKm: 2.0,
      hostReliability: 94,
    },
    {
      id: "inv-3",
      teamName: "Pune Giants",
      sport: "Cricket",
      roleInvited: "Bowler",
      distance: "120 km away",
      distanceKm: 120.0,
      hostReliability: 86,
    },
    {
      id: "inv-4",
      teamName: "Thane Badminton Smashers",
      sport: "Badminton",
      roleInvited: "Singles",
      distance: "18.5 km away",
      distanceKm: 18.5,
      hostReliability: 92,
    }
  ]);

  useEffect(() => {
    const inviteInterval = setInterval(() => {
      const turfNames = [
        "Juhu Sports Club",
        "Andheri Turf Arena",
        "Bandra Football Academy",
        "Ghatkopar Strikers CC",
        "Chembur Smashers Club",
        "Vikhroli United FC",
        "Khar Badminton Academy",
        "Mulund Turf Strikers",
        "Powai Elite Arena",
        "Santacruz Smashers"
      ];
      
      const sportsList = ["Cricket", "Football", "Badminton"];
      
      const rolesMap = {
        "Cricket": ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"],
        "Football": ["Striker", "Midfielder", "Defender", "Goalkeeper"],
        "Badminton": ["Singles Partner", "Doubles Partner"]
      };

      const randomTurf = turfNames[Math.floor(Math.random() * turfNames.length)];
      const randomSport = sportsList[Math.floor(Math.random() * sportsList.length)];
      const rolesList = rolesMap[randomSport];
      const randomRole = rolesList[Math.floor(Math.random() * rolesList.length)];
      const randomDistanceKm = parseFloat((1.0 + Math.random() * 8.5).toFixed(1)); // 1.0 to 9.5 km
      const randomReliability = Math.floor(92 + Math.random() * 8); // 92 to 99%
      
      const newInvite = {
        id: `inv-dyn-${Date.now()}`,
        teamName: randomTurf,
        sport: randomSport,
        roleInvited: randomRole,
        distance: `${randomDistanceKm} km away`,
        distanceKm: randomDistanceKm,
        hostReliability: randomReliability
      };
      
      setTeamInvites(prev => [newInvite, ...prev]);
      
      // Quietly auto-decline/remove invite after 10 seconds without showing any toast notification
      setTimeout(() => {
        setTeamInvites(prev => prev.filter(inv => inv.id !== newInvite.id));
      }, 10000);
    }, 15000);

    return () => clearInterval(inviteInterval);
  }, []);

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedTeamToJoin, setSelectedTeamToJoin] = useState(null);
  const [joinRole, setJoinRole] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  
  const [showConfetti, setShowConfetti] = useState(false);

  // Stats selection states
  const [isStatsRoleModalOpen, setIsStatsRoleModalOpen] = useState(false);
  const [targetStatsTeamId, setTargetStatsTeamId] = useState(null);
  const [selectedStatsRole, setSelectedStatsRole] = useState("");
  const [sendingStatsRole, setSendingStatsRole] = useState("");
  const [sendingStatsTeamId, setSendingStatsTeamId] = useState(null);
  const [sharedStatsTeams, setSharedStatsTeams] = useState([]);

  // Consolidated payment & entry ticket states
  const [paidTeams, setPaidTeams] = useState([]);
  const [paymentModalMode, setPaymentModalMode] = useState(null); // null | "pay" | "ticket"
  const [paymentTeam, setPaymentTeam] = useState(null);
  const [shareAmount, setShareAmount] = useState(0);
  const [totalTurfCost, setTotalTurfCost] = useState(1200);

  const displayMembers = teamMembers.map((member) =>
    member.id === 1 && currentUser?.fullName
      ? { ...member, name: currentUser.fullName }
      : member
  );

  const selectedTeamObject = userTeams.find((t) => t.id === selectedRosterTeamId) || userTeams[0];
  const activeRosterList = selectedTeamObject?.roster || [];

  const userSports = currentUser?.selectedSports || ["football", "cricket", "badminton"];

  const handleLeaveTeam = (teamId, teamName) => {
    setUserTeams(prev => prev.filter(t => t.id !== teamId));
    toast.error(`You have left the team: ${teamName}`);
  };

  const handleOpenChat = (team) => {
    setChatTeam(team);
    setChatMessages([
      { sender: "Amit Sharma", text: "Yo team, are we playing this Saturday?", time: "10:15 AM", isUser: false },
      { sender: "Sanjay Kumar", text: "Yes! Slot booked at Powai Elite Arena for 7 PM. Spread the word.", time: "10:20 AM", isUser: false },
      { sender: "John Doe", text: "Perfect, I am in. Let's aim for a win this time!", time: "10:22 AM", isUser: false },
    ]);
    setIsChatOpen(true);
  };

  const handleSendChatMessage = () => {
    if (!newMessageText.trim()) return;
    const msg = {
      sender: "You",
      text: newMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    setChatMessages(prev => [...prev, msg]);
    setNewMessageText("");
  };

  const handleOpenStats = (team) => {
    setStatsTeam(team);
    setIsStatsOpen(true);
  };

  const handleAcceptInvite = (invite) => {
    setTeamInvites(prev => prev.filter(inv => inv.id !== invite.id));
    
    const newId = Date.now();
    const newTeam = {
      id: newId,
      name: invite.teamName,
      sport: invite.sport,
      members: 11,
      wins: 15,
      losses: 4,
      upcoming: 1,
      role: "Member",
      roster: [
        { id: 1, name: currentUser?.fullName || "You", role: "Member", position: invite.roleInvited, status: "online" },
        { id: 2, name: "Captain Virat", role: "Captain", position: invite.sport === "Football" ? "Striker" : "Batsman", status: "online" },
        { id: 3, name: "Arjun Malhotra", role: "Member", position: "Bowler", status: "online" },
        { id: 4, name: "Sanjay Kumar", role: "Member", position: "Defender", status: "offline" },
        { id: 5, name: "Aman Preet", role: "Member", position: "Midfielder", status: "online" }
      ]
    };
    
    setUserTeams(prev => [...prev, newTeam]);
    setSelectedRosterTeamId(newId);
    toast.success(`Welcome to ${invite.teamName}!`);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);
  };

  const handleDeclineInvite = (inviteId, teamName) => {
    setTeamInvites(prev => prev.filter(inv => inv.id !== inviteId));
    toast.error(`Declined invitation to join ${teamName}.`);
  };

  const handleSendJoinRequest = () => {
    if (!joinRole) {
      toast.error("Please select a playing position.");
      return;
    }
    
    setExploreTeams(prev => prev.map(t => {
      if (t.id === selectedTeamToJoin.id) {
        return { ...t, status: "Requested" };
      }
      return t;
    }));

    toast.success(`Application sent successfully to join ${selectedTeamToJoin.name}!`);
    setJoinModalOpen(false);

    // Simulate approval after 4 seconds
    const targetTeam = selectedTeamToJoin;
    setTimeout(() => {
      setExploreTeams(prev => prev.map(t => {
        if (t.id === targetTeam.id) {
          toast(`⚡ Join request approved by ${targetTeam.name}'s captain!`, {
            action: {
              label: "View Team",
              onClick: () => {
                setActiveTab("mine");
              }
            }
          });
          
          // Add to userTeams
          const joinedNewTeam = {
            id: targetTeam.id,
            name: targetTeam.name,
            sport: targetTeam.sport,
            members: targetTeam.members + 1,
            wins: targetTeam.wins,
            losses: targetTeam.losses,
            upcoming: 1,
            role: "Member",
            neededPositions: (targetTeam.neededPositions || []).filter(p => p !== joinRole),
            roster: [
              { id: 1, name: currentUser?.fullName || "You", role: "Member", position: joinRole || "Striker", status: "online" },
              { id: 2, name: targetTeam.hostName || "Host Captain", role: "Captain", position: targetTeam.sport === "Football" ? "Striker" : "Batsman", status: "online" },
              ...targetTeam.joinedRoster.map((m, idx) => ({
                id: idx + 3,
                name: m.name,
                role: "Member",
                position: m.role || "Player",
                status: Math.random() > 0.3 ? "online" : "offline"
              }))
            ]
          };
          setUserTeams(curr => {
            const alreadyIn = curr.some(x => x.name === targetTeam.name);
            if (alreadyIn) return curr;
            setSelectedRosterTeamId(joinedNewTeam.id);
            return [...curr, joinedNewTeam];
          });
          
          return { ...t, status: "Joined", members: t.members + 1 };
        }
        return t;
      }));
    }, 4500);
  };

  const handleSendStatsToHost = (teamId, teamName, selectedRole) => {
    setSendingStatsRole(selectedRole || "Player");
    setSendingStatsTeamId(teamId);
    toast.info(`📤 Sending ${selectedRole || "Player"} stats to ${teamName} Captain/Host...`);

    setTimeout(() => {
      setSharedStatsTeams(prev => [...prev, teamId]);
      setSendingStatsTeamId(null);
      setSendingStatsRole("");
      toast.success(`⚡ Captain approved your stats! Team Chat unlocked for ${teamName}.`);

      // Dynamically update user role in the team roster
      setUserTeams(curr => curr.map(t => {
        if (t.id === teamId) {
          const hasUser = (t.roster || []).some(m => m.name === "You" || m.name === currentUser?.fullName);
          let updatedRoster = [...(t.roster || [])];
          if (!hasUser) {
            updatedRoster.push({
              id: Date.now(),
              name: currentUser?.fullName || "You",
              role: "Member",
              position: selectedRole,
              status: "online"
            });
          } else {
            updatedRoster = updatedRoster.map(member => {
              if (member.name === "You" || member.name === currentUser?.fullName) {
                return { ...member, position: selectedRole || member.position };
              }
              return member;
            });
          }

          // Remove the selected position from open needs list
          const updatedNeeded = (t.neededPositions || []).filter(p => p !== selectedRole);

          return {
            ...t,
            roster: updatedRoster,
            members: updatedRoster.length,
            neededPositions: updatedNeeded
          };
        }
        return t;
      }));
    }, 2500);
  };

  const handleOpenPayment = (team, shareCost, totalCost) => {
    setPaymentTeam(team);
    setShareAmount(shareCost);
    setTotalTurfCost(totalCost || 1200);
    setPaymentModalMode("pay");
  };

  const handleOpenEntryPass = (team) => {
    setPaymentTeam(team);
    setPaymentModalMode("ticket");
  };

  const handleConfirmPayment = () => {
    if (!paymentTeam) return;
    toast.success(`💳 Payment of ₹${shareAmount} successful! Digital Entry Pass is ready.`);
    setPaidTeams(prev => [...prev, paymentTeam.id]);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
    setPaymentModalMode("ticket");
  };


  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl  tracking-tight">Teams & Communities</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your squads and connect with fellow players
          </p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Create New Team
        </Button>
      </div>

      {/* Confetti celebration container */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {showConfetti && (
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Teams Overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Selector */}
          <div className="flex border-b border-border/80">
            <button
              onClick={() => setActiveTab("mine")}
              className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${
                activeTab === "mine"
                  ? "border-[#6DFF3B] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Your Teams ({userTeams.length})
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "explore"
                  ? "border-[#6DFF3B] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Explore Teams
              <Badge className="bg-[#6DFF3B]/10 text-[#6DFF3B] border border-[#6DFF3B]/20 text-[9px] py-0 px-2 rounded-full font-bold">
                📍 🏏 10km Filter
              </Badge>
            </button>
          </div>

          {activeTab === "mine" ? (
            userTeams.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {userTeams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`group overflow-hidden shadow-sm hover:shadow-md transition-all bg-card rounded-2xl cursor-pointer ${
                        selectedRosterTeamId === team.id
                          ? "border-[#6DFF3B] ring-1 ring-[#6DFF3B]/50"
                          : "border-border/60"
                      }`}
                      onClick={() => setSelectedRosterTeamId(team.id)}
                    >
                      <div className={`h-1.5 transition-colors ${
                        selectedRosterTeamId === team.id ? "bg-[#6DFF3B]" : "bg-[#6DFF3B]/20 group-hover:bg-[#6DFF3B]"
                      }`} />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6DFF3B]/10 text-[#6DFF3B] group-hover:bg-[#6DFF3B] group-hover:text-black transition-colors shrink-0">
                              <Users className="h-5.5 w-5.5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold text-foreground">
                                {team.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-[9px] uppercase px-2 py-0.5 border-[#6DFF3B]/20 text-[#6DFF3B]"
                                >
                                  {team.sport}
                                </Badge>
                                <Badge className="bg-muted text-muted-foreground border-none text-[9px] px-2 py-0.5">
                                  {team.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Team settings"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 rounded-xl bg-muted/40">
                            <p className="text-sm font-bold text-foreground">{team.members}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">
                              Players
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-muted/40">
                            <p className="text-sm font-bold text-[#6DFF3B]">{team.wins}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">
                              Wins
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-muted/40">
                            <p className="text-sm font-bold text-rose-400">
                              {team.losses}
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">
                              Loss
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-muted/40">
                            <p className="text-sm font-bold text-blue-400">
                              {team.upcoming}
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">
                              Next
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 h-9 text-xs rounded-xl bg-muted/80 hover:bg-muted font-bold text-foreground cursor-pointer"
                            variant="secondary"
                            onClick={() => handleOpenChat(team)}
                          >
                            Team Chat
                          </Button>
                          {team.role === "Member" ? (
                            <Button
                              variant="outline"
                              className="flex-1 h-9 text-xs rounded-xl border-red-500/25 hover:border-red-500/40 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold cursor-pointer"
                              onClick={() => handleLeaveTeam(team.id, team.name)}
                            >
                              Leave Team
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex-1 h-9 text-xs rounded-xl border-border text-foreground hover:bg-muted font-bold group cursor-pointer"
                              onClick={() => handleOpenStats(team)}
                            >
                              Stats
                              <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          )}
                        </div>
                        
                        {/* If squad is full, show payment controls */}
                        {team.roster?.length >= getSportFormatSize(team.sport) && (
                          <div className="mt-1.5">
                            {paidTeams.includes(team.id) ? (
                              <Button
                                className="w-full h-9 text-xs rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold cursor-pointer flex items-center justify-center gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEntryPass(team);
                                }}
                              >
                                <Ticket className="h-3.5 w-3.5 text-emerald-400" />
                                View Entry Ticket
                              </Button>
                            ) : (
                              <Button
                                className="w-full h-9 text-xs rounded-xl bg-[#6DFF3B] hover:bg-[#5ce630] text-black font-bold cursor-pointer flex items-center justify-center gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPayment(team, Math.round(1200 / getSportFormatSize(team.sport)), 1200);
                                }}
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                Pay Match Share (₹{Math.round(1200 / getSportFormatSize(team.sport))})
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No teams joined"
                description="Join a team or create your own to start competing in leagues and tournaments."
                actionText="Create a Team"
                onAction={() => {}}
              />
            )
          ) : (
            /* Explore Teams Tab (with location / sport filtering) */
            <div className="space-y-6">
              {(() => {
                const filtered = exploreTeams.filter(team => {
                  const isClose = team.distanceKm <= 10;
                  const matchesSport = userSports.some(sportId => {
                    const sportObj = sportsOptions.find(s => s.id === sportId);
                    const sportName = sportObj ? sportObj.name.toLowerCase() : sportId.toLowerCase();
                    return team.sport.toLowerCase().includes(sportName) || sportName.includes(team.sport.toLowerCase());
                  });
                  return isClose && matchesSport;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center bg-card border border-border/60 rounded-3xl flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">No public teams matching your location or preferred sports nearby.</p>
                      <p className="text-xs text-muted-foreground/60">(Filtering out distant teams and matches like Pune/Thane/Gym)</p>
                    </div>
                  );
                }

                return (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {filtered.map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="group border-border/60 bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                          <div>
                            <div className="h-1.5 bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors" />
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base font-bold text-foreground">
                                    {team.name}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">
                                      {team.sport}
                                    </Badge>
                                    <Badge className="bg-[#6DFF3B]/10 text-[#6DFF3B] text-[9px] py-0 px-2 border-0 flex items-center gap-0.5">
                                      <MapPin className="h-2.5 w-2.5" /> {team.distance}
                                    </Badge>
                                  </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted py-0.5 px-2 rounded-full">
                                  {team.skillLevel}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 text-left">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Roster Size:</span>
                                <span className="font-bold text-foreground">{team.members} / {team.maxMembers} Players</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Captain/Host:</span>
                                <span className="font-semibold text-foreground">{team.hostName}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Reliability Score:</span>
                                <span className="font-semibold text-[#6DFF3B] flex items-center gap-1">
                                  🛡️ {team.hostReliability}%
                                </span>
                              </div>
                              <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40 text-[10px]">
                                <span className="font-bold text-muted-foreground uppercase block mb-1">Open Needs:</span>
                                <span className="text-[#6DFF3B] font-semibold">{team.neededPositions.join(", ")}</span>
                              </div>
                            </CardContent>
                          </div>
                          <div className="p-4 pt-0">
                            {team.status === "Explore" && (
                              <Button
                                className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-10 text-xs"
                                onClick={() => {
                                  setSelectedTeamToJoin(team);
                                  setJoinRole("");
                                  setJoinMessage("");
                                  setJoinModalOpen(true);
                                }}
                              >
                                Request to Join Team
                              </Button>
                            )}
                            {team.status === "Requested" && (
                              <Button
                                disabled
                                className="w-full bg-muted border border-border text-muted-foreground font-bold rounded-xl h-10 text-xs"
                              >
                                Requested ⏳
                              </Button>
                            )}
                            {team.status === "Joined" && (
                              <Button
                                disabled
                                className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl h-10 text-xs"
                              >
                                Joined ✓
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}

              {/* Join Request Dialog Modal Form */}
              <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <UserPlus className="h-5 w-5 text-[#6DFF3B]" /> Join Squad Lobby
                    </DialogTitle>
                  </DialogHeader>
                  {selectedTeamToJoin && (
                    <div className="space-y-4 py-3 text-left">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{selectedTeamToJoin.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedTeamToJoin.sport} • {selectedTeamToJoin.distance} • Host Reliability: {selectedTeamToJoin.hostReliability}%</p>
                      </div>

                      {/* Roster & Position Needs */}
                      <div className="border border-border/60 bg-muted/30 p-3.5 rounded-2xl space-y-3">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1.5">Current Roster</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {selectedTeamToJoin.joinedRoster.map((player, idx) => (
                              <div key={idx} className="bg-card px-2.5 py-1.5 rounded-xl border border-border/40 text-[10px] text-foreground flex items-center justify-between">
                                <span className="font-medium truncate max-w-[80px]">{player.name}</span>
                                <Badge variant="outline" className="text-[8px] border-zinc-700 text-slate-400 px-1 py-0">{player.role}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-border/40 pt-2.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Roles Needed</span>
                          <p className="text-xs font-bold text-[#6DFF3B]">
                            {selectedTeamToJoin.neededPositions.join(", ")}
                          </p>
                        </div>
                      </div>

                      {/* Role selection dropdown */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Your Role</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(selectedTeamToJoin.sport.toLowerCase() === "cricket" 
                            ? ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"] 
                            : selectedTeamToJoin.sport.toLowerCase() === "football"
                            ? ["Striker", "Midfielder", "Defender", "Goalkeeper"]
                            : ["Singles Player", "Doubles Player"]
                          ).map((pos) => {
                            const isNeeded = selectedTeamToJoin.neededPositions.includes(pos);
                            return (
                              <button
                                key={pos}
                                type="button"
                                className={`h-10 rounded-xl text-xs font-semibold px-3 flex items-center justify-between border transition-all ${
                                  joinRole === pos 
                                    ? "bg-[#6DFF3B] text-black border-[#6DFF3B]" 
                                    : "bg-card border-border hover:bg-muted text-foreground"
                                }`}
                                onClick={() => setJoinRole(pos)}
                              >
                                <span>{pos}</span>
                                {isNeeded && <Badge className="bg-blue-500/10 text-blue-400 text-[8px] font-bold px-1.5 border-none uppercase">Need</Badge>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Bio/Message text area */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Introduction / Bio Message</label>
                        <textarea
                          placeholder='e.g., "Hey captain, I am a striker, would love to join your match!"'
                          className="w-full bg-card border border-border text-foreground p-3 rounded-2xl text-xs focus:outline-none focus:border-[#6DFF3B] h-20 resize-none leading-relaxed"
                          value={joinMessage}
                          onChange={(e) => setJoinMessage(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-11 text-xs mt-2"
                        onClick={handleSendJoinRequest}
                      >
                        Send Join Request
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>


        {/* Sidebar: Current Team Roster & Team Invites */}
        <div className="space-y-6">
          {/* Incoming Team Invites (Recruitment Offers) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl ">Incoming Invites</h2>
              <Badge variant="outline" className="text-[9px] text-[#6DFF3B] border-[#6DFF3B]/30 bg-[#6DFF3B]/5 py-0 px-2 h-5 rounded-full font-bold">
                10km Filter
              </Badge>
            </div>
            <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-4 space-y-3">
                {(() => {
                  const filtered = teamInvites.filter(invite => {
                    const isClose = invite.distanceKm <= 10;
                    const matchesSport = userSports.some(sportId => {
                      const sportObj = sportsOptions.find(s => s.id === sportId);
                      const sportName = sportObj ? sportObj.name.toLowerCase() : sportId.toLowerCase();
                      return invite.sport.toLowerCase().includes(sportName) || sportName.includes(invite.sport.toLowerCase());
                    });
                    return isClose && matchesSport;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-6 text-center space-y-1">
                        <p className="text-xs text-muted-foreground">No matching invites within 10 km.</p>
                        <p className="text-[9px] text-muted-foreground/60">(Restricting Pune/Thane/Unrelated invites)</p>
                      </div>
                    );
                  }

                  return filtered.map((invite) => (
                    <div key={invite.id} className="flex flex-col gap-2.5 p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 transition-all text-left">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            {invite.teamName}
                          </h4>
                          <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                            {invite.sport}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Role: <span className="font-semibold text-foreground">{invite.roleInvited}</span> • {invite.distance}</p>
                        <p className="text-[10px] text-[#6DFF3B] font-semibold mt-0.5">🛡️ Host Reliability: {invite.hostReliability}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-[10px] bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-lg"
                          onClick={() => handleAcceptInvite(invite)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          onClick={() => handleDeclineInvite(invite.id, invite.teamName)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl ">Team Roster</h2>
            {userTeams.some(t => t.id === selectedTeamObject?.id) ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-primary h-8 px-2 rounded-xl text-xs flex items-center gap-1 font-bold shrink-0 cursor-pointer">
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border text-foreground sm:max-w-sm rounded-3xl p-5">
                    <DialogHeader className="text-left pb-3 border-b border-border/40">
                      <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                        <UserPlus className="h-5 w-5 text-indigo-400" /> Send Squad Invite
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Invite a player to join your active squad roster.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3 text-left">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Player Name / Username</label>
                        <Input placeholder="Enter username..." className="rounded-xl text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Position Role</label>
                        <Input placeholder="e.g. Batsman, Striker..." className="rounded-xl text-xs" />
                      </div>
                      <Button
                        className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-11 text-xs mt-2"
                        onClick={() => {
                          toast.success("📤 Invitation sent successfully!");
                        }}
                      >
                        Send Invite Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
          </div>
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{selectedTeamObject?.name || "Team"} Roster</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {activeRosterList.length > 0 ? (
                activeRosterList.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary ">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                            member.status === "online"
                              ? "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className=" text-sm truncate">{member.name}</p>
                          {member.role === "Captain" && (
                            <Shield className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground  uppercase tracking-wider">
                          {member.position}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Message member"
                      className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm ">
                  No members found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Statistics */}
      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl">Team Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                label: "Overall Win Rate",
                value: "75%",
                icon: Trophy,
                color: "text-amber-500",
                bgColor: "bg-amber-500/10",
                change: "+5% trend",
              },
              {
                label: "Avg. Runs / Match",
                value: "156",
                icon: TrendingUp,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                change: "Top 10% in league",
              },
              {
                label: "Active Members",
                value: "12",
                icon: Users,
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                change: "Full squad",
              },
              {
                label: "Season MVP",
                value: "Rahul S.",
                icon: Shield,
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                change: "456 points",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor} ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs  text-muted-foreground uppercase tracking-widest leading-tight">
                      {stat.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl ">{stat.value}</p>
                    <p className="text-[10px]  text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {/* Team Chat Dialog Modal */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto p-0 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                💬 {chatTeam?.name} Chat Room
              </DialogTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">{chatTeam?.sport} • {chatTeam?.members} active squad players online</p>
            </div>
          </div>
          
          <div className="p-4 flex-1 space-y-4 max-h-[300px] overflow-y-auto bg-muted/20">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground">{msg.sender}</span>
                  <span className="text-[9px] text-muted-foreground/60">{msg.time}</span>
                </div>
                <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  msg.isUser ? "bg-[#6DFF3B] text-black rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border flex gap-2 bg-background">
            <input
              type="text"
              placeholder="Type message to squad..."
              className="flex-1 bg-card border border-border text-foreground rounded-xl px-3 text-xs focus:outline-none focus:border-[#6DFF3B] h-10"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
            />
            <Button
              className="bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-10 px-4 text-xs cursor-pointer"
              onClick={handleSendChatMessage}
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Stats/Performance Dialog Modal */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Trophy className="h-5 w-5 text-[#6DFF3B]" /> Team Analytics & Leaderboard
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detailed performance metrics of {statsTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          {statsTeam && (
            <div className="space-y-4 py-3 text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card p-3 rounded-2xl border border-border/40 text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-xl font-bold mt-1 text-[#6DFF3B]">{Math.round((statsTeam.wins / (statsTeam.wins + statsTeam.losses || 1)) * 100)}%</p>
                </div>
                <div className="bg-card p-3 rounded-2xl border border-border/40 text-center">
                  <p className="text-xs text-muted-foreground">Matches</p>
                  <p className="text-xl font-bold mt-1 text-foreground">{statsTeam.wins + statsTeam.losses}</p>
                </div>
                <div className="bg-card p-3 rounded-2xl border border-border/40 text-center">
                  <p className="text-xs text-muted-foreground">Win Streak</p>
                  <p className="text-xl font-bold mt-1 text-blue-400">4 Wins</p>
                </div>
              </div>

              <div className="border border-border/60 bg-muted/30 p-4 rounded-3xl space-y-3">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Squad Leaderboard (Top Scorers)</span>
                <div className="space-y-2">
                  {[
                    { rank: "🥇", name: "Rahul Sharma", stat: statsTeam.sport === "Cricket" ? "245 Runs" : "12 Goals" },
                    { rank: "🥈", name: "Sanjay Kumar", stat: statsTeam.sport === "Cricket" ? "14 Wickets" : "8 Assists" },
                    { rank: "🥉", name: "Amit Patel", stat: statsTeam.sport === "Cricket" ? "189 Runs" : "6 Goals" },
                  ].map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-card p-2.5 rounded-xl border border-border/20 text-xs">
                      <span className="font-semibold">{p.rank} {p.name}</span>
                      <Badge className="bg-[#6DFF3B]/10 text-[#6DFF3B] border-none text-[10px] font-mono font-bold px-2 py-0.5">{p.stat}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Role Selection Modal */}
      <Dialog open={isStatsRoleModalOpen} onOpenChange={setIsStatsRoleModalOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-sm rounded-3xl p-5">
          <DialogHeader className="text-left pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-blue-400" /> Apply Position / Send Stats
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select which role you want to apply for in this team.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const team = userTeams.find(t => t.id === targetStatsTeamId);
            if (!team) return null;

            const roles = team.sport.toLowerCase() === "cricket"
              ? ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"]
              : team.sport.toLowerCase() === "football"
                ? ["Striker", "Midfielder", "Defender", "Goalkeeper"]
                : ["Singles Player", "Doubles Player"];

            return (
              <div className="space-y-4 py-3 text-left">
                {team.neededPositions && team.neededPositions.length > 0 && (
                  <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-2xl">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-1">Open Needs</span>
                    <p className="text-xs font-semibold text-foreground">
                      {team.neededPositions.join(", ")}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((pos) => {
                      const isNeeded = team.neededPositions?.includes(pos);
                      return (
                        <button
                          key={pos}
                          type="button"
                          className={`h-10 rounded-xl text-xs font-semibold px-3 flex items-center justify-between border transition-all ${selectedStatsRole === pos
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-card border-border hover:bg-muted text-foreground"
                            }`}
                          onClick={() => setSelectedStatsRole(pos)}
                        >
                          <span>{pos}</span>
                          {isNeeded && <Badge className="bg-[#6DFF3B]/15 text-[#6DFF3B] text-[8px] font-bold px-1.5 border-none uppercase">Need</Badge>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-11 text-xs mt-2"
                  disabled={!selectedStatsRole}
                  onClick={() => {
                    setIsStatsRoleModalOpen(false);
                    handleSendStatsToHost(team.id, team.name, selectedStatsRole);
                  }}
                >
                  Confirm & Send Stats
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Consolidated Payment & Entry Ticket Dialog */}
      <Dialog open={paymentModalMode !== null} onOpenChange={(open) => { if (!open) setPaymentModalMode(null); }}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md rounded-3xl p-5 overflow-hidden shadow-2xl relative">
          
          {paymentModalMode === "pay" && (
            <>
              <DialogHeader className="text-left pb-3 border-b border-border/40">
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5 text-indigo-400" /> Turf Cost Splitting
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Pay your split share to confirm your slot in the squad.
                </DialogDescription>
              </DialogHeader>

              {paymentTeam && (
                <div className="space-y-4 py-3 text-left">
                  {/* Venue details */}
                  {(() => {
                    const isBB = paymentTeam.sport === "Basketball";
                    const isCF = paymentTeam.sport === "Cricket" || paymentTeam.sport === "Football";
                    const turfName = isBB ? "Bandra Turf Plaza" : isCF ? "Powai Elite Arena" : "Juhu Sports Club";
                    const turfAddress = isBB
                      ? "Carter Road Promenade, Bandra West, Mumbai - 400050"
                      : isCF
                        ? "Saki Vihar Road, Near Powai Lake, Andheri East, Mumbai - 400072"
                        : "Juhu Tara Road, Juhu Beach, Mumbai - 400049";

                    return (
                      <div className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-2">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Turf Venue</span>
                        <h4 className="text-xs font-bold text-foreground">{turfName}</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1">
                          <span>📍</span> {turfAddress}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Cost Split breakdown info */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card p-3 rounded-2xl border border-border/40 text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold">Total Cost</p>
                      <p className="text-base font-bold mt-1 text-foreground">₹{totalTurfCost}</p>
                    </div>
                    <div className="bg-card p-3 rounded-2xl border border-border/40 text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold">Players</p>
                      <p className="text-base font-bold mt-1 text-foreground">{getSportFormatSize(paymentTeam.sport)}</p>
                    </div>
                    <div className="bg-card p-3 rounded-2xl border border-border/40 text-center bg-indigo-500/5 border-indigo-500/20">
                      <p className="text-[10px] text-indigo-400 font-bold">Your Share</p>
                      <p className="text-base font-bold mt-1 text-indigo-400">₹{shareAmount}</p>
                    </div>
                  </div>

                  {/* Roster payment status */}
                  <div className="border border-border/40 rounded-2xl p-3.5 space-y-2.5 max-h-[160px] overflow-y-auto bg-card">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Teammate Payments</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs p-1.5 rounded-lg border border-indigo-500/25 bg-indigo-500/5">
                        <span className="font-semibold text-foreground">You (Pending)</span>
                        <Badge variant="outline" className="text-[8px] border-amber-500/40 text-amber-500 px-1.5 uppercase font-bold">Pending</Badge>
                      </div>
                      {(() => {
                        const roster = paymentTeam.roster || paymentTeam.joinedRoster || [];
                        const otherPlayers = roster.filter(m => m.name !== "You" && m.name !== currentUser?.fullName);
                        return otherPlayers.map((player, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] p-1.5 rounded-lg hover:bg-muted/30">
                            <span className="text-muted-foreground">{player.name} ({player.position})</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">✓ Paid</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Confirm pay button */}
                  <Button
                    className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-11 text-xs mt-2"
                    onClick={handleConfirmPayment}
                  >
                    Confirm & Pay Share (₹{shareAmount})
                  </Button>
                </div>
              )}
            </>
          )}

          {paymentModalMode === "ticket" && (
            <>
              {/* Glowing ticket border line effects */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#6DFF3B]" />

              <DialogHeader className="sr-only">
                <DialogTitle>Match Entry Pass</DialogTitle>
                <DialogDescription>Your ticket pass receipt</DialogDescription>
              </DialogHeader>

              {!paymentTeam ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <span className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Entry Pass...</span>
                </div>
              ) : (
                <div className="text-center space-y-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-[4px] px-2 py-0.5 rounded-full">Match Ticket</span>
                    <h3 className="text-base font-black tracking-tight text-foreground uppercase mt-1.5">Entry Pass</h3>
                    <p className="text-[10px] text-muted-foreground">Show this barcode at the turf reception</p>
                  </div>

                  {/* Roster details header */}
                  <div className="bg-muted/40 p-3 rounded-2xl border border-border/40 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground uppercase font-mono">Team</span>
                      <span className="text-xs font-bold text-foreground">{paymentTeam?.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                      <span className="text-[9px] text-muted-foreground uppercase font-mono">Sport</span>
                      <span className="text-xs font-bold text-[#6DFF3B]">{paymentTeam?.sport} ({getSportFormatSize(paymentTeam?.sport || "")} Format)</span>
                    </div>
                  </div>

                  {/* Venue details with Google Maps Pin */}
                  {(() => {
                    const isBB = paymentTeam?.sport === "Basketball";
                    const isCF = paymentTeam?.sport === "Cricket" || paymentTeam?.sport === "Football";
                    const turfName = isBB ? "Bandra Turf Plaza" : isCF ? "Powai Elite Arena" : "Juhu Sports Club";
                    const turfAddress = isBB
                      ? "Carter Road Promenade, Bandra West, Mumbai - 400050"
                      : isCF
                        ? "Saki Vihar Road, Near Powai Lake, Andheri East, Mumbai - 400072"
                        : "Juhu Tara Road, Juhu Beach, Mumbai - 400049";

                    return (
                      <div className="bg-muted/40 p-3 rounded-2xl border border-border/40 text-left space-y-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-mono block mb-0.5">Venue & Address</span>
                        <h4 className="text-xs font-bold text-foreground leading-normal">{turfName}</h4>
                        <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                          <p className="text-[9px] text-muted-foreground leading-normal flex-1">
                            {turfAddress}
                          </p>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(turfName + " " + turfAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 transition-colors p-1.5 bg-blue-500/10 rounded-lg shrink-0 cursor-pointer flex items-center justify-center mt-0.5"
                            title="Open in Google Maps"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Date & Time details */}
                  <div className="bg-muted/40 p-3 rounded-2xl border border-border/40 text-left grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] text-muted-foreground uppercase font-mono block">Date</span>
                      <span className="text-xs font-bold text-foreground">Sunday, Oct 24</span>
                    </div>
                    <div className="border-l border-border/60 pl-2.5">
                      <span className="text-[8px] text-muted-foreground uppercase font-mono block">Time</span>
                      <span className="text-xs font-bold text-foreground">7:00 PM</span>
                    </div>
                  </div>

                  {/* Simulated barcode using pure CSS linear-gradient */}
                  <div className="border-t border-b border-dashed border-border/60 py-3.5 my-1 flex flex-col items-center gap-1.5">
                    <div
                      className="h-10 w-full bg-zinc-200 relative opacity-85 rounded-lg border border-border/40"
                      style={{
                        backgroundImage: "repeating-linear-gradient(90deg, #09090b, #09090b 2px, transparent 2px, transparent 5px, #09090b 5px, #09090b 8px, transparent 8px, transparent 10px)",
                        backgroundSize: "24px 100%"
                      }}
                    />
                    <span className="font-mono text-[9px] tracking-[5px] text-muted-foreground uppercase">SPX-TKT-{paymentTeam?.id || "99"}</span>
                  </div>

                  {/* Security stamp */}
                  <div className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs py-2 px-3 rounded-xl uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <ShieldCheck className="h-4 w-4" /> PAID & APPROVED ✓
                  </div>
                </div>
              )}
            </>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}
