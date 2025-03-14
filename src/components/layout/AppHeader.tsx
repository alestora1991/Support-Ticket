import { Link } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Settings, User, Menu } from "lucide-react";
import { useState } from "react";

interface AppHeaderProps {
  showAuthButtons?: boolean;
  transparent?: boolean;
}

export default function AppHeader({
  showAuthButtons = true,
  transparent = false,
}: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full ${transparent ? "bg-transparent" : "bg-blue-700 shadow-md"}`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://i.ibb.co/hHRwpCv/logo-SOS-page-0001-removebg-preview-002.png"
              alt="SOS IT Support"
              className="h-10"
            />
            <span
              className={`font-bold text-xl hidden md:inline-block ${transparent ? "text-blue-700" : "text-white"}`}
            >
              IT Support
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className={`${transparent ? "text-blue-700 hover:bg-blue-100" : "text-white hover:bg-blue-600"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {user.email === "it@sos.com.om" && (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    className={`${transparent ? "text-blue-700 hover:bg-blue-100" : "text-white hover:bg-blue-600"}`}
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/tickets">
                <Button
                  variant="ghost"
                  className={`${transparent ? "text-blue-700 hover:bg-blue-100" : "text-white hover:bg-blue-600"}`}
                >
                  My Tickets
                </Button>
              </Link>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${transparent ? "text-blue-700 hover:bg-blue-100" : "text-white hover:bg-blue-600"}`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    2
                  </span>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar
                      className={`h-8 w-8 ${transparent ? "border-2 border-blue-700" : "border-2 border-white"}`}
                    >
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback
                        className={`${transparent ? "bg-blue-100 text-blue-700" : "bg-blue-600 text-white"}`}
                      >
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            showAuthButtons && (
              <div className="flex items-center space-x-2">
                <Link to="/">
                  <Button
                    variant="ghost"
                    className={`${transparent ? "text-blue-700 hover:bg-blue-100" : "text-white hover:bg-blue-600"}`}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant={transparent ? "default" : "outline"}
                    className={
                      transparent
                        ? "bg-blue-700 text-white hover:bg-blue-800"
                        : "bg-white text-blue-700 hover:bg-blue-50"
                    }
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 px-6 absolute w-full">
          {user ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b">
                <Avatar className="h-8 w-8 border-2 border-blue-700">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.email || ""}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              {user.email === "it@sos.com.om" && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-700 hover:bg-blue-50"
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              )}

              <Link to="/tickets" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-blue-700 hover:bg-blue-50"
                >
                  My Tickets
                </Button>
              </Link>

              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-blue-700 hover:bg-blue-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>

              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-blue-700 hover:bg-blue-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          ) : (
            showAuthButtons && (
              <div className="flex flex-col space-y-3">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-blue-700 hover:bg-blue-50"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full justify-center bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </header>
  );
}
