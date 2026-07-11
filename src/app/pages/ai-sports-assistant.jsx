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

const suggestions = [
  "Find cricket venues near me",
  "Best badminton courts in Mumbai",
  "Upcoming football tournaments",
  "Find players for tennis doubles",
];

const initialMessages = [
  {
    id: 1,
    type: "bot",
    content: "Hello! I'm your AI Sports Assistant. How can I help you today?",
    suggestions: suggestions,
  },
];

export function AISportsAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    const currentInput = input.trim();
    if (!currentInput) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response with a short delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: `I found several options for "${currentInput}". Here are some recommendations:

1. **Elite Sports Arena** - 1.2 km away
   • Rating: 4.9/5 • ₹800/hour
   • Available today at 6 PM

2. **Champions Sports Complex** - 2.5 km away
   • Rating: 4.8/5 • ₹600/hour
   • Available today at 7 PM

3. **Ace Tennis Academy** - 3.8 km away
   • Rating: 4.7/5 • ₹500/hour
   • Available tomorrow at 8 AM

Would you like to book any of these venues?`,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  return (
    <Container className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Bot className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl ">AI Sports Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Get personalized recommendations for venues, players, and tournaments
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            icon: MapPin,
            title: "Venue Suggestions",
            description: "Find perfect venues",
          },
          {
            icon: Trophy,
            title: "Tournament Info",
            description: "Get tournament details",
          },
          {
            icon: Users,
            title: "Player Matching",
            description: "Connect with players",
          },
          {
            icon: Sparkles,
            title: "Smart Tips",
            description: "Improve your game",
          },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className=" text-sm mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages */}
          <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
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
                          onClick={() => setInput(suggestion)}
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
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about sports..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />

            <Button onClick={handleSend} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground w-full mb-2">
              Quick Actions:
            </p>
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Personalized Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Peak Booking Time",
                value: "6-8 PM",
                description: "Best availability during weekdays",
              },
              {
                title: "Recommended Sport",
                value: "Cricket",
                description: "Based on your activity",
              },
              {
                title: "Savings This Month",
                value: "₹450",
                description: "Through AI recommendations",
              },
            ].map((insight) => (
              <div
                key={insight.title}
                className="p-4 rounded-lg border border-border/50 bg-muted/30"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  {insight.title}
                </p>
                <p className="text-2xl  mb-1">{insight.value}</p>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
