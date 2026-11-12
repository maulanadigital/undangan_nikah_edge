import { motion } from "motion/react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { useInvitation } from "@/features/invitation";
import { cn } from "@/lib/utils";

export default function WelcomePage({ onOpen }) {
  const { config } = useConfig();
  const { guest } = useInvitation();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm",
      )}
      style={{ opacity: 1 }}
      id="welcome"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn("text-center")}
      >
        <h2
          className={cn(
            "font-serif text-2xl md:text-3xl text-gray-800 mb-4",
          )}
        >
          The Wedding Of
        </h2>

        {config?.ogImage && (
          <motion.img
            src={config.ogImage}
            alt="background"
            className={cn(
              "w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg mx-auto mb-6 object-cover",
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        )}

        <h2
          className={cn(
            "font-serif text-2xl md:text-3xl text-gray-800 mb-4",
          )}
        >
          {config?.groomName} & {config?.brideName}
        </h2>

        <div
          className={cn("mb-6 text-gray-600")}
          id="guest-name"
        >
          {guest?.name ? (
            <p className={cn("text-lg text-gray-800")}>
              Kepada Yth {guest.name}
            </p>
          ) : (
            <p className={cn("text-lg text-gray-800")}>
              Kepada Yth Bapak/Ibu/Saudara/i
            </p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={onOpen}
          className={cn(
            "bg-white border border-gray-300 shadow-lg rounded-full px-6 py-3 text-gray-800 hover:bg-gray-50 transition-all",
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fa-solid fa-envelope-open fa-bounce me-2"></i>
          Open Invitation
        </motion.button>
      </motion.div>
    </div>
  );
}
