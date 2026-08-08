import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Bot, Send, MapPin, Trophy, Users, Sparkles } from "lucide-react";
import { Container } from "../components/ui/container";
import { useAuth } from "../providers/auth-provider";
import { aiAssistantService } from "../services/ai-assistant.service";

const suggestions = [
  "Find cricket venues near me",
  "Best badminton courts in Mumbai",
  "Upcoming football tournaments",
  "Find players for tennis doubles",
];

const initialMessages = [
  {
    id: "welcome",
    type: "bot",
    content: "Hello! I can check live SportXClub venues, games, tournaments, players, and your profile activity. What would you like to find?",
    suggestions,
  },
];

const features = [
  { icon: MapPin, title: "Venue Suggestions", description: "Search active venues" },
  { icon: Trophy, title: "Tournament Info", description: "See live events and games" },
  { icon: Users, title: "Player Matching", description: "Find active players" },
  { icon: Sparkles, title: "Smart Tips", description: "Get sports guidance" },
];

export function AISportsAssistant() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (value = input) => {
    const currentInput = value.trim();
    if (!currentInput || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, type: "user", content: currentInput },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await aiAssistantService.chat({ message: currentInput, user: currentUser });
      setMessages((previous) => [
        ...previous,
        {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: answer.content,
          suggestions: answer.suggestions,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          type: "bot",
          content: error.message || "I could not reach the live SportXClub data. Please try again.",
          suggestions,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Bot className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl">AI Sports Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Get answers from SportXClub&apos;s live venues, games, players, and tournaments
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  {message.suggestions && message.type === "bot" && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {message.suggestions.map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleSend(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {message.type === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-4 text-muted-foreground">
                  Checking live SportXClub data...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about venues, games, players, or tournaments..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => handleSend()} className="gap-2" disabled={isLoading}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground w-full mb-2">Quick Actions:</p>
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSend(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
