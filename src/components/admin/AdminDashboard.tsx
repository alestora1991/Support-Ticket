import React from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  BarChart3,
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  UserPlus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface TicketType {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  user_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

interface UserType {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch data and set up subscriptions
  useEffect(() => {
    if (user) {
      // Initial data fetch
      fetchTickets();
      fetchUsers();

      // Set up polling for new tickets every 30 seconds as a fallback
      const pollingInterval = setInterval(() => {
        fetchTickets();
      }, 30000);

      // Set up real-time subscription for new tickets
      const channel = supabase.channel("admin-realtime");

      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_tickets",
          },
          () => {
            console.log("New ticket received!");
            fetchTickets();
            // Show notification toast for new ticket
            toast({
              variant: "default",
              title: "New Ticket Received",
              description: "A new support ticket has been submitted.",
              duration: 10000, // 10 seconds
            });
            // Play notification sound
            const audio = new Audio(
              "https://assets.mixkit.co/active_storage/sfx/922/922-preview.mp3",
            );
            audio
              .play()
              .catch((e) =>
                console.error("Could not play notification sound:", e),
              );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "support_tickets",
          },
          () => {
            console.log("Ticket update received!");
            fetchTickets();
          },
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status !== "SUBSCRIBED") {
            console.error("Failed to subscribe to realtime changes");
          }
        });

      return () => {
        clearInterval(pollingInterval);
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching tickets...");
      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          `
          *,
          user:user_id(email, full_name)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Tickets fetched:", data?.length || 0);
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // Create user in auth
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
        },
      });

      if (error) throw error;

      // User is automatically created in public.users via trigger
      toast({
        variant: "success",
        title: "User Created",
        description: `Successfully created user ${newUserFullName}`,
      });

      // Refresh users list
      fetchUsers();
      setIsNewUserDialogOpen(false);
      resetUserForm();
    } catch (error: any) {
      console.error("Error creating user:", error);
      setFormError(error.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetUserForm = () => {
    setNewUserEmail("");
    setNewUserFullName("");
    setNewUserPassword("");
    setFormError("");
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    newStatus: string,
  ) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;

      // Update local state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus as any }
            : ticket,
        ),
      );

      // Close dialog if open
      if (isTicketDialogOpen) {
        setIsTicketDialogOpen(false);
      }

      toast({
        variant: "success",
        title: "Ticket Updated",
        description: `Ticket status changed to ${newStatus}`,
      });

      // Notify user about status change
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket && ticket.user?.email) {
        try {
          await supabase.functions.invoke(
            "supabase-functions-send-notification-email",
            {
              body: {
                to: ticket.user.email,
                subject: `Your IT Support Ticket Status Updated: ${ticket.title}`,
                ticketId: ticketId,
                ticketTitle: ticket.title,
                userName: ticket.user.full_name,
                status: newStatus,
                type: "status-update",
              },
            },
          );
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError);
          // Continue with ticket update even if email fails
        }
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update ticket status",
      });
    }
  };

  const handleAssignTicket = async (ticketId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          assigned_to: userId,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) throw error;

      // Update local state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                assigned_to: userId,
                status: "in_progress",
              }
            : ticket,
        ),
      );

      toast({
        variant: "success",
        title: "Ticket Assigned",
        description:
          "Ticket has been assigned and status updated to In Progress",
      });

      // Close dialog if open
      if (isTicketDialogOpen) {
        setIsTicketDialogOpen(false);
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: "Failed to assign ticket",
      });
    }
  };

  const exportTicketsToCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Category",
      "Created At",
      "User",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredTickets.map((ticket) =>
        [
          ticket.id,
          `"${ticket.title.replace(/"/g, '""')}"`,
          `"${ticket.description.replace(/"/g, '""')}"`,
          ticket.status,
          ticket.priority,
          ticket.category,
          new Date(ticket.created_at).toLocaleString(),
          `"${ticket.user?.full_name || ""}"`,
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tickets_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    // Search filter
    const matchesSearch = searchQuery
      ? ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.user?.email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (ticket.user?.full_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ? true : ticket.status === statusFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === "all" ? true : ticket.priority === priorityFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === "all" ? true : ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const openTickets = filteredTickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "in_progress",
  );
  const closedTickets = filteredTickets.filter(
    (ticket) => ticket.status === "resolved" || ticket.status === "closed",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "resolved":
      case "closed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-blue-700 text-white py-8 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100 mt-1">
                  Manage tickets, users, and system settings
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsNewUserDialogOpen(true)}
                  className="bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  New User
                </Button>
                <Button
                  onClick={() => {
                    fetchTickets();
                    fetchUsers();
                  }}
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-blue-600 flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-blue-500" />
                  Total Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {tickets.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  All support requests
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Open Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {tickets.filter((t) => t.status === "open").length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Awaiting assignment
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {tickets.filter((t) => t.status === "in_progress").length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Currently being worked on
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">
                  {users.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Registered accounts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tickets Management */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Ticket Management
              </h2>

              <div className="flex gap-3">
                <Button
                  onClick={exportTicketsToCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-3 flex-wrap md:flex-nowrap">
                <div className="w-full md:w-40">
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "all" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-40">
                  <Select
                    value={priorityFilter || "all"}
                    onValueChange={(value) =>
                      setPriorityFilter(value === "all" ? "all" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-40">
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={(value) =>
                      setCategoryFilter(value === "all" ? "all" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR and Admin">HR and Admin</SelectItem>
                      <SelectItem value="Procurement">Procurement</SelectItem>
                      <SelectItem value="Accounting and Warehouse">
                        Accounting and Warehouse
                      </SelectItem>
                      <SelectItem value="Operation QHSSE and Maintenance">
                        Operation QHSSE and Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <Ticket className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No tickets found
                    </h3>
                    <p className="text-gray-500 mt-1">
                      No tickets match your current filters
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Department
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Priority
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Created
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setIsTicketDialogOpen(true);
                            }}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {getStatusIcon(ticket.status)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {ticket.title}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                    {ticket.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              <div>
                                <div className="font-medium">
                                  {ticket.user?.full_name || "Unknown"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ticket.user?.email || ""}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {ticket.category}
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={`${getStatusColor(ticket.status)} font-normal`}
                              >
                                {ticket.status
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={`${getPriorityColor(ticket.priority)} font-normal`}
                              >
                                {ticket.priority.replace(/\b\w/g, (l) =>
                                  l.toUpperCase(),
                                )}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {formatDate(ticket.created_at)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                {ticket.status === "open" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTicketStatus(
                                        ticket.id,
                                        "in_progress",
                                      );
                                    }}
                                  >
                                    Start
                                  </Button>
                                )}
                                {ticket.status === "in_progress" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTicketStatus(
                                        ticket.id,
                                        "resolved",
                                      );
                                    }}
                                  >
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="open">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : filteredTickets.filter((t) => t.status === "open")
                    .length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <Ticket className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No open tickets
                    </h3>
                    <p className="text-gray-500 mt-1">
                      All tickets have been assigned or resolved
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Department
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Priority
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Created
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets
                          .filter((t) => t.status === "open")
                          .map((ticket) => (
                            <tr
                              key={ticket.id}
                              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsTicketDialogOpen(true);
                              }}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {ticket.title}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                      {ticket.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <div>
                                  <div className="font-medium">
                                    {ticket.user?.full_name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ticket.user?.email || ""}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {ticket.category}
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`${getPriorityColor(ticket.priority)} font-normal`}
                                >
                                  {ticket.priority.replace(/\b\w/g, (l) =>
                                    l.toUpperCase(),
                                  )}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {formatDate(ticket.created_at)}
                              </td>
                              <td className="py-4 px-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateTicketStatus(
                                      ticket.id,
                                      "in_progress",
                                    );
                                  }}
                                >
                                  Start Working
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in_progress">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : filteredTickets.filter((t) => t.status === "in_progress")
                    .length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <Ticket className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No tickets in progress
                    </h3>
                    <p className="text-gray-500 mt-1">
                      No tickets are currently being worked on
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Department
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Priority
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Created
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets
                          .filter((t) => t.status === "in_progress")
                          .map((ticket) => (
                            <tr
                              key={ticket.id}
                              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsTicketDialogOpen(true);
                              }}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {ticket.title}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                      {ticket.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <div>
                                  <div className="font-medium">
                                    {ticket.user?.full_name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ticket.user?.email || ""}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {ticket.category}
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`${getPriorityColor(ticket.priority)} font-normal`}
                                >
                                  {ticket.priority.replace(/\b\w/g, (l) =>
                                    l.toUpperCase(),
                                  )}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {formatDate(ticket.created_at)}
                              </td>
                              <td className="py-4 px-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateTicketStatus(
                                      ticket.id,
                                      "resolved",
                                    );
                                  }}
                                >
                                  Mark Resolved
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resolved">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : filteredTickets.filter(
                    (t) => t.status === "resolved" || t.status === "closed",
                  ).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <Ticket className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No resolved tickets
                    </h3>
                    <p className="text-gray-500 mt-1">
                      No tickets have been resolved yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Department
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Priority
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Created
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets
                          .filter(
                            (t) =>
                              t.status === "resolved" || t.status === "closed",
                          )
                          .map((ticket) => (
                            <tr
                              key={ticket.id}
                              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsTicketDialogOpen(true);
                              }}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {ticket.title}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                      {ticket.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <div>
                                  <div className="font-medium">
                                    {ticket.user?.full_name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ticket.user?.email || ""}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {ticket.category}
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`${getStatusColor(ticket.status)} font-normal`}
                                >
                                  {ticket.status
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`${getPriorityColor(ticket.priority)} font-normal`}
                                >
                                  {ticket.priority.replace(/\b\w/g, (l) =>
                                    l.toUpperCase(),
                                  )}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {formatDate(ticket.created_at)}
                              </td>
                              <td className="py-4 px-4">
                                {ticket.status === "resolved" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTicketStatus(
                                        ticket.id,
                                        "closed",
                                      );
                                    }}
                                  >
                                    Close Ticket
                                  </Button>
                                )}
                                {ticket.status === "closed" && (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    Closed
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Users Management */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                User Management
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tickets
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                              alt={user.full_name || ""}
                            />
                            <AvatarFallback>
                              {user.full_name?.[0] || user.email?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            {user.full_name || "Unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-blue-50">
                            {
                              tickets.filter((t) => t.user_id === user.id)
                                .length
                            }{" "}
                            tickets
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-50">
                            {
                              tickets.filter(
                                (t) =>
                                  t.user_id === user.id &&
                                  (t.status === "open" ||
                                    t.status === "in_progress"),
                              ).length
                            }{" "}
                            active
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* New User Dialog */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {formError && (
              <div className="text-sm text-red-500">{formError}</div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewUserDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedTicket.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <Badge
                      className={getPriorityColor(selectedTicket.priority)}
                    >
                      {selectedTicket.priority.replace(/\b\w/g, (l) =>
                        l.toUpperCase(),
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {formatDate(selectedTicket.created_at)}
                </div>
              </div>

              <div className="border-t border-b py-4">
                <Label className="text-sm text-gray-500 mb-1 block">
                  Description
                </Label>
                <p className="whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-gray-500 mb-1">
                  User Information
                </Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTicket.user?.email || "user"}`}
                      alt={selectedTicket.user?.full_name || ""}
                    />
                    <AvatarFallback>
                      {selectedTicket.user?.full_name?.[0] ||
                        selectedTicket.user?.email?.[0] ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedTicket.user?.full_name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedTicket.user?.email || ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedTicket.status === "open" && (
                  <Button
                    onClick={() =>
                      handleUpdateTicketStatus(selectedTicket.id, "in_progress")
                    }
                  >
                    Start Working
                  </Button>
                )}
                {selectedTicket.status === "in_progress" && (
                  <Button
                    onClick={() =>
                      handleUpdateTicketStatus(selectedTicket.id, "resolved")
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Resolved
                  </Button>
                )}
                {selectedTicket.status === "resolved" && (
                  <Button
                    onClick={() =>
                      handleUpdateTicketStatus(selectedTicket.id, "closed")
                    }
                    variant="outline"
                  >
                    Close Ticket
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsTicketDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
