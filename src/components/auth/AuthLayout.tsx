import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TicketCheck, Clock, HeadphonesIcon } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-10 md:py-0 text-white order-2 md:order-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="mb-8">
            <img
              src="https://i.ibb.co/hHRwpCv/logo-SOS-page-0001-removebg-preview-002.png"
              alt="SOS IT Support"
              className="h-12"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            IT Support <br />
            <span className="text-blue-300">Made Simple</span>
          </h1>
          <p className="text-white/90 mb-10 text-lg">
            Submit and track your IT support requests with ease. Our dedicated
            team is here to help you resolve technical issues quickly and
            efficiently.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/30 p-2.5">
                <TicketCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">Quick ticket submission</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/30 p-2.5">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">Real-time status updates</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/30 p-2.5">
                <HeadphonesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">24/7 Dedicated support team</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-[-150px] right-[-100px] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl hidden md:block"></div>
          <div className="absolute bottom-[-100px] left-[-150px] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl hidden md:block"></div>
        </motion.div>

        <div className="mt-10 md:mt-0 md:absolute md:bottom-8 md:left-16 text-sm text-white/70 text-center md:text-left">
          © 2023 Hamed Al-Ghaithi. All rights reserved.
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center relative overflow-hidden min-h-[50vh] md:min-h-screen order-1 md:order-2">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white opacity-80"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxMnYtNmgtMTJ6bTEyIDEydjZoNnYtNmgtNnptLTYgMTJ2Nmg2di02aC02em0tMTIgMHY2aDZ2LTZoLTZ6bS0xMiAwdjZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02em0xMi0xMnY2aDZ2LTZoLTZ6bS02IDB2Nmg2di02aC02em0tNiAwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-100"></div>

        <div className="w-full max-w-md px-4 py-8 md:py-0 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
