import { motion } from "motion/react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { cn } from "@/lib/utils";

export default function BrideSection() {
  const { config } = useConfig();

  return (
    <section
      className={cn("bg-white dark:bg-gray-900 py-12 px-4")}
      id="bride"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn("max-w-4xl mx-auto text-center")}
      >
        <h2
          className={cn(
            "text-2xl md:text-3xl font-arabic text-gray-800 dark:text-white mb-4",
          )}
          style={{ fontSize: "2rem" }}
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </h2>

        <h2
          className={cn(
            "text-xl md:text-2xl text-gray-800 dark:text-white mb-6",
          )}
          style={{ fontSize: "2rem" }}
        >
          Assalamualaikum Warahmatullahi Wabarakatuh
        </h2>

        <p
          className={cn(
            "text-sm md:text-base text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto",
          )}
        >
          Tanpa mengurangi rasa hormat, kami mengundang Anda untuk berkenan
          menghadiri acara pernikahan kami:
        </p>

        {/* Bride & Groom Cards */}
        <div
          className={cn(
            "grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto",
          )}
        >
          {/* Groom */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={cn("text-center")}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-full mb-4 mx-auto",
              )}
              style={{ width: "180px", height: "180px" }}
            >
              {(config?.groomPhoto || config?.ogImage) && (
                <img
                  src={config.groomPhoto || config.ogImage}
                  alt={config?.groomName}
                  className={cn(
                    "w-full h-full rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover cursor-pointer",
                  )}
                />
              )}
            </div>

            <h2
              className={cn(
                "font-serif text-xl md:text-2xl text-gray-800 dark:text-white",
              )}
              style={{ fontSize: "2.125rem" }}
            >
              {config?.groomName || "Nama Pria"}
            </h2>

            <p className={cn("text-sm text-gray-500 dark:text-gray-400 mt-2")}>
              {config?.groomTitle || "Putra ke-1"}
            </p>

            {config?.parentGroom && (
              <p className={cn("text-xs text-gray-500 dark:text-gray-400")}>
                Putra dari {config.parentGroom}
              </p>
            )}
          </motion.div>

          {/* Separator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={cn(
              "flex items-center justify-center md:items-start md:justify-center md:pt-8",
            )}
          >
            <h2
              className={cn("font-serif text-4xl text-gray-800 dark:text-white")}
              style={{ fontSize: "4.5rem" }}
            >
              &
            </h2>
          </motion.div>

          {/* Bride */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={cn("text-center")}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-full mb-4 mx-auto",
              )}
              style={{ width: "180px", height: "180px" }}
            >
              {(config?.bridePhoto || config?.ogImage) && (
                <img
                  src={config.bridePhoto || config.ogImage}
                  alt={config?.brideName}
                  className={cn(
                    "w-full h-full rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover cursor-pointer",
                  )}
                />
              )}
            </div>

            <h2
              className={cn(
                "font-serif text-xl md:text-2xl text-gray-800 dark:text-white",
              )}
              style={{ fontSize: "2.125rem" }}
            >
              {config?.brideName || "Nama Wanita"}
            </h2>

            <p className={cn("text-sm text-gray-500 dark:text-gray-400 mt-2")}>
              {config?.brideTitle || "Putri ke-1"}
            </p>

            {config?.parentBride && (
              <p className={cn("text-xs text-gray-500 dark:text-gray-400")}>
                Putri dari {config.parentBride}
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
