import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export interface NotificationProps {
  type: "success" | "error";
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const getPositionStyles = (position: NotificationProps["position"]) => {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    case "top-center":
      return "top-4 left-1/2 -translate-x-1/2";
    case "bottom-center":
      return "bottom-4 left-1/2 -translate-x-1/2";
    case "top-right":
    default:
      return "top-4 right-4";
  }
};

export function Notification({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
  position = "top-right",
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const positionClasses = getPositionStyles(position);

  const variants = {
    hidden: {
      opacity: 0,
      y: position?.includes("top") ? -20 : 20,
      x: position?.includes("center")
        ? 0
        : position?.includes("left")
          ? -20
          : 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: position?.includes("center") ? 0 : 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.1,
      },
    },
  };

  const colors = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-500",
      title: "text-green-800",
      message: "text-green-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-500",
      title: "text-red-800",
      message: "text-red-700",
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionClasses} max-w-sm w-full shadow-lg rounded-lg overflow-hidden`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          layout
        >
          <div
            className={`${colors[type].bg} ${colors[type].border} border p-4 rounded-lg shadow-md flex items-start gap-3`}
          >
            <motion.div
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              className={`flex-shrink-0 ${colors[type].icon}`}
            >
              {type === "success" ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </motion.div>

            <div className="flex-1">
              <motion.h4
                className={`font-semibold ${colors[type].title}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h4>
              <motion.p
                className={`text-sm mt-1 ${colors[type].message}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useNotification() {
  const [notifications, setNotifications] = React.useState<
    (NotificationProps & { id: string })[]
  >([]);

  const showNotification = (
    type: "success" | "error",
    title: string,
    message: string,
    duration?: number,
    position?: NotificationProps["position"],
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        message,
        isVisible: true,
        onClose: () => {},
        duration,
        position,
      },
    ]);

    return id;
  };

  const closeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isVisible: false }
          : notification,
      ),
    );

    // Remove from state after animation completes
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    }, 300);
  };

  const NotificationsContainer = () => {
    return (
      <>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => closeNotification(notification.id)}
          />
        ))}
      </>
    );
  };

  return {
    showNotification,
    closeNotification,
    NotificationsContainer,
  };
}
