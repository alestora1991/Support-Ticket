import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TicketCheck, Clock, HeadphonesIcon } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-10 md:py-0 text-white order-2 md:order-1">
        <div className="mb-8 self-start">
          <motion.img
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            src="https://i.ibb.co/hHRwpCv/logo-SOS-page-0001-removebg-preview-002.png"
            alt="SOS IT Support"
            className="h-16"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Support <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
              Platform
            </span>
          </h1>
          <p className="text-white/90 mb-10 text-lg">
            Experience seamless customer support with real-time collaboration
          </p>
          <div className="space-y-6">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="rounded-full bg-purple-500/40 p-2.5 shadow-lg shadow-purple-500/20">
                <TicketCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">Quick ticket submission</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-4"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="rounded-full bg-pink-500/40 p-2.5 shadow-lg shadow-pink-500/20">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">Real-time status updates</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-4"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="rounded-full bg-indigo-500/40 p-2.5 shadow-lg shadow-indigo-500/20">
                <HeadphonesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">24/7 Dedicated support team</span>
            </motion.div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-[-150px] right-[-100px] w-64 h-64 bg-pink-500/20 rounded-full blur-3xl hidden md:block"></div>
          <div className="absolute bottom-[-100px] left-[-150px] w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl hidden md:block"></div>
        </motion.div>
      </div>
      <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center relative overflow-hidden min-h-[50vh] md:min-h-screen order-1 md:order-2">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white opacity-80"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxMnYtNmgtMTJ6bTEyIDEydjZoNnYtNmgtNnptLTYgMTJ2Nmg2di02aC02em0tMTIgMHY2aDZ2LTZoLTZ6bS0xMiAwdjZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02em0xMi0xMnY2aDZ2LTZoLTZ6bS02IDB2Nmg2di02aC02em0tNiAwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-100"></div>

        <div className="w-full max-w-md px-4 py-8 md:py-0 relative z-10">
          {children}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium text-white/90 z-20 bg-black/20 py-2 backdrop-blur-sm"
      >
        © 2023 Hamed Al-Ghaithi. All rights reserved.
      </motion.div>
    </div>
  );
}
