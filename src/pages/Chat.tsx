import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Send, Search, Users, Clock, Phone, Video, AlertTriangle } from "lucide-react"
import { useState } from "react"

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1)
  const [newMessage, setNewMessage] = useState("")

  const fellows = [
    {
      id: 1,
      name: "Alex Chen",
      role: "Senior Fellow",
      company: "Goldman Sachs",
      year: "2024",
      status: "online",
      lastMessage: "Thanks for the resume feedback! The changes really helped.",
      lastMessageTime: "2 min ago",
      unread: 0,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      role: "Fellow",
      company: "J.P. Morgan",
      year: "2023",
      status: "online",
      lastMessage: "Do you have any tips for the superday interviews?",
      lastMessageTime: "15 min ago",
      unread: 2,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "James Wilson",
      role: "Senior Fellow",
      company: "KKR",
      year: "2024",
      status: "away",
      lastMessage: "The PE modeling workshop was incredibly helpful!",
      lastMessageTime: "1 hour ago",
      unread: 0,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "Sarah Kim",
      role: "Fellow",
      company: "BlackRock",
      year: "2023",
      status: "offline",
      lastMessage: "Would love to connect and discuss asset management careers",
      lastMessageTime: "3 hours ago",
      unread: 1,
      avatar: "/api/placeholder/40/40"
    }
  ]

  const messages = [
    {
      id: 1,
      sender: "Alex Chen",
      message: "Hey! Hope you're doing well. I wanted to thank you for the resume feedback you gave me last week.",
      timestamp: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      sender: "You",
      message: "Of course! I'm glad it was helpful. How did the application process go?",
      timestamp: "10:32 AM",
      isOwn: true
    },
    {
      id: 3,
      sender: "Alex Chen",
      message: "Really well actually! I got callbacks from 3 of the 5 banks I applied to. The quantitative achievements section you suggested really made a difference.",
      timestamp: "10:35 AM",
      isOwn: false
    },
    {
      id: 4,
      sender: "You",
      message: "That's fantastic news! Congratulations! Which banks gave you callbacks?",
      timestamp: "10:36 AM",
      isOwn: true
    },
    {
      id: 5,
      sender: "Alex Chen",
      message: "Goldman, Morgan Stanley, and Barclays. I'm most excited about the Goldman opportunity. Any advice for the superday?",
      timestamp: "10:38 AM",
      isOwn: false
    },
    {
      id: 6,
      sender: "You",
      message: "Amazing lineup! For Goldman superdays, make sure you're comfortable with technical questions - especially DCF modeling and comparable company analysis. Also, be ready to discuss recent M&A deals.",
      timestamp: "10:40 AM",
      isOwn: true
    },
    {
      id: 7,
      sender: "Alex Chen",
      message: "Thanks for the resume feedback! The changes really helped.",
      timestamp: "10:42 AM",
      isOwn: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-academy-grey'
      default: return 'bg-academy-grey'
    }
  }

  const selectedFellow = fellows.find(f => f.id === selectedChat)

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)]">
      {/* Development Warning */}
      <Alert className="border-yellow-200 bg-yellow-50 mb-6">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Still in Development:</strong> The Chat with Fellows feature is currently being built. 
          We're setting up the messaging infrastructure and user verification system. Coming soon!
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Chat with UC IA Fellows</h1>
        <p className="text-academy-grey text-lg">
          Connect directly with current and former UC Investment Academy fellows for peer-to-peer learning and support.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Contacts Sidebar */}
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-academy-blue">
              <Users className="h-5 w-5" />
              Fellows ({fellows.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-academy-grey" />
              <Input placeholder="Search fellows..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {fellows.map((fellow) => (
                <div
                  key={fellow.id}
                  onClick={() => setSelectedChat(fellow.id)}
                  className={`p-3 cursor-pointer hover:bg-academy-grey-light transition-colors border-l-4 ${
                    selectedChat === fellow.id 
                      ? 'bg-academy-grey-light border-academy-blue' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={fellow.avatar} />
                        <AvatarFallback>{fellow.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(fellow.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-academy-blue text-sm">{fellow.name}</h4>
                        <div className="flex items-center gap-1">
                          {fellow.unread > 0 && (
                            <Badge className="bg-academy-blue text-white text-xs px-1.5 py-0.5">
                              {fellow.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-academy-grey mb-1">{fellow.company} • Class of {fellow.year}</p>
                      <p className="text-xs text-academy-grey truncate">{fellow.lastMessage}</p>
                      <p className="text-xs text-academy-grey mt-1">{fellow.lastMessageTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 bg-white shadow-card border-academy-grey-light flex flex-col">
          {selectedFellow ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b border-academy-grey-light">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedFellow.avatar} />
                        <AvatarFallback>{selectedFellow.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedFellow.status)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-academy-blue">{selectedFellow.name}</h3>
                      <p className="text-sm text-academy-grey">{selectedFellow.company} • {selectedFellow.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-academy-grey-light/30">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn 
                        ? 'bg-academy-blue text-white' 
                        : 'bg-white border border-academy-grey-light'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? 'text-white/70' : 'text-academy-grey'}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-academy-grey-light">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        // Handle send message
                        setNewMessage("")
                      }
                    }}
                  />
                  <Button className="bg-academy-blue hover:bg-academy-blue-dark">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-academy-grey mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-academy-grey mb-2">Select a Fellow to Start Chatting</h3>
                <p className="text-academy-grey">
                  Choose from the list of fellows to begin your conversation.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Community Guidelines */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="text-academy-blue">Community Guidelines</CardTitle>
          <CardDescription>Help us maintain a positive and professional environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-academy-blue mb-2">Be Respectful</h4>
              <p className="text-sm text-academy-grey">Treat all fellows with courtesy and respect. We're all here to learn and grow together.</p>
            </div>
            <div>
              <h4 className="font-semibold text-academy-blue mb-2">Stay Professional</h4>
              <p className="text-sm text-academy-grey">Keep conversations career-focused and maintain professional communication standards.</p>
            </div>
            <div>
              <h4 className="font-semibold text-academy-blue mb-2">Share Knowledge</h4>
              <p className="text-sm text-academy-grey">Help others by sharing your experiences, insights, and resources when appropriate.</p>
            </div>
            <div>
              <h4 className="font-semibold text-academy-blue mb-2">Protect Privacy</h4>
              <p className="text-sm text-academy-grey">Don't share personal information or confidential company details in group discussions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;