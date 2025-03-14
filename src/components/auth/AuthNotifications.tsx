import React from "react";
import { useNotification } from "@/components/ui/notification";

// Create a context to provide notifications throughout the auth components
const AuthNotificationsContext = React.createContext<{
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  NotificationsContainer: React.FC;
} | null>(null);

export function AuthNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showNotification, closeNotification, NotificationsContainer } =
    useNotification();

  const showSuccess = (title: string, message: string) => {
    return showNotification("success", title, message, 5000, "top-center");
  };

  const showError = (title: string, message: string) => {
    return showNotification("error", title, message, 5000, "top-center");
  };

  return (
    <AuthNotificationsContext.Provider
      value={{ showSuccess, showError, NotificationsContainer }}
    >
      {children}
      <NotificationsContainer />
    </AuthNotificationsContext.Provider>
  );
}

export function useAuthNotifications() {
  const context = React.useContext(AuthNotificationsContext);
  if (!context) {
    throw new Error(
      "useAuthNotifications must be used within an AuthNotificationsProvider",
    );
  }
  return context;
}
