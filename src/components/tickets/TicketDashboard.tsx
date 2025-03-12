import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import {
  PlusCircle,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  TicketCheck,
  BarChart3,
  Calendar,
} from "lucide-react";
import NewTicketDialog from "./NewTicketDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "../layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  created_at: string;
  updated_at: string;
}

export default function TicketDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTickets();

      // Set up real-time subscription for ticket updates
      const ticketsSubscription = supabase
        .channel("user-tickets-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_tickets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("New ticket received:", payload);
            fetchTickets();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "support_tickets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Ticket update received:", payload);
            fetchTickets();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ticketsSubscription);
      };
    }

    // No longer needed as we're showing the toast directly in the NewTicketDialog component
  }, [user, toast]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // First check if the user exists in the public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // If error is not 'no rows returned', it's a real error
        console.error("Error checking user:", userError);
        throw userError;
      }

      // If user doesn't exist in public.users table, create them
      if (!userData) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user?.id,
            email: user?.email || "",
            full_name: user?.user_metadata?.full_name || "",
          },
        ]);

        if (insertError) {
          console.error("Error creating user record:", insertError);
          // Continue anyway to try to fetch tickets
        }
      }

      // Now fetch tickets
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketCreated = () => {
    fetchTickets();
    setIsDialogOpen(false);
  };

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

  const filteredTickets = tickets.filter((ticket) => {
    // Search filter
    const matchesSearch = searchQuery
      ? ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="bg-blue-600 text-white py-8 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Support Tickets</h1>
                <p className="text-blue-100 mt-1">
                  Manage and track your IT support requests
                </p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <TicketCheck className="h-5 w-5 text-blue-500" />
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
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Open Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {openTickets.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Awaiting resolution
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Resolved Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {closedTickets.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Successfully completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-3">
                <div className="w-40">
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? null : value)
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
                <div className="w-40">
                  <Select
                    value={priorityFilter || "all"}
                    onValueChange={(value) =>
                      setPriorityFilter(value === "all" ? null : value)
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
                <div className="w-40">
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={(value) =>
                      setCategoryFilter(value === "all" ? null : value)
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
                <TabsTrigger value="closed">Resolved</TabsTrigger>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No tickets found
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Create a new ticket to get started
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
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
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
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
                ) : openTickets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No open tickets
                    </h3>
                    <p className="text-gray-500 mt-1">
                      All your tickets have been resolved
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
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
                        </tr>
                      </thead>
                      <tbody>
                        {openTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="closed">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : closedTickets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No resolved tickets
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Your tickets are still being processed
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">
                            Ticket
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
                        </tr>
                      </thead>
                      <tbody>
                        {closedTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <NewTicketDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onTicketCreated={handleTicketCreated}
            userName={user?.user_metadata?.full_name || ""}
          />
        </div>
      </div>
      <Toaster />
    </>
  );
}
