import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { adminApi } from "../../services/admin-api";

export function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    sport: "Football",
    location: "Green Turf Arena, Mumbai",
    date: new Date().toISOString().split("T")[0],
    time: "06:00 PM",
    players_joined: 6,
    max_players: 14,
    price_per_player: 250,
    status: "Open",
    organizer: "Admin",
  });

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("games");
      setGames(data);
    } catch (err) {
      console.warn("Failed loading games from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    try {
      const newG = await adminApi.create("games", formData);
      setGames([newG, ...games]);
      setIsAddOpen(false);
      setFormData({
        title: "",
        sport: "Football",
        location: "Green Turf Arena, Mumbai",
        date: new Date().toISOString().split("T")[0],
        time: "06:00 PM",
        players_joined: 6,
        max_players: 14,
        price_per_player: 250,
        status: "Open",
        organizer: "Admin",
      });
    } catch (err) {
      alert("Error adding game: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("games", id, { status: newStatus });
      setGames(games.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game lobby from MySQL?")) return;
    try {
      await adminApi.delete("games", id);
      setGames(games.filter((g) => g.id !== id));
    } catch (err) {
      alert("Error deleting game: " + err.message);
    }
  };

  const filteredGames = games.filter(
    (g) =>
      g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.sport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Lobbies</h1>
          <p className="text-muted-foreground">Manage active match lobbies dynamically in MySQL (`games` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadGames} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Lobby
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Open Lobbies ({filteredGames.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lobby, sport..."
                className="pl-9 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Lobby Title</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Location & Time</TableHead>
                  <TableHead>Price/Player</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading games from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredGames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No game lobbies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.title}</TableCell>
                      <TableCell><Badge variant="outline">{game.sport}</Badge></TableCell>
                      <TableCell className="font-bold">
                        {game.players_joined ?? 1} / {game.max_players ?? 10}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">{game.location}</div>
                        <div className="text-xs text-muted-foreground">{game.date} @ {game.time}</div>
                      </TableCell>
                      <TableCell className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{game.price_per_player}</TableCell>
                      <TableCell>
                        <Select value={game.status} onValueChange={(val) => handleStatusChange(game.id, val)}>
                          <SelectTrigger className={`w-[110px] h-8 text-xs border ${
                            game.status === "Open"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : game.status === "Full"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Full">Full</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteGame(game.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Game Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Game Lobby</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGame} className="space-y-4 py-2">
            <div>
              <Label>Lobby Title</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Evening Football 7v7" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sport</Label>
                <Input value={formData.sport} onChange={(e) => setFormData({ ...formData, sport: e.target.value })} placeholder="Football" />
              </div>
              <div>
                <Label>Price / Player (₹)</Label>
                <Input type="number" required value={formData.price_per_player} onChange={(e) => setFormData({ ...formData, price_per_player: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location / Turf</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Green Turf Arena, Mumbai" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Players</Label>
                <Input type="number" value={formData.max_players} onChange={(e) => setFormData({ ...formData, max_players: e.target.value })} />
              </div>
              <div>
                <Label>Time</Label>
                <Input value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="06:00 PM" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Lobby</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
