import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function FirmanAllah() {
  return (
    <section
      className={cn("bg-gray-50 dark:bg-gray-800 py-8 px-4")}
      id="firman"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn("max-w-4xl mx-auto text-center")}
      >
        <h2
          className={cn(
            "font-serif text-xl md:text-2xl text-gray-800 dark:text-white pt-2 pb-4",
          )}
          style={{ fontSize: "2rem" }}
        >
          Allah Subhanahu Wa Ta'ala berfirman
        </h2>

        {/* Ayat 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={cn(
            "bg-white dark:bg-gray-900 mt-4 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
          )}
        >
          <p
            className={cn(
              "p-2 mb-2 text-gray-700 dark:text-gray-300",
            )}
            style={{ fontSize: "0.95rem" }}
          >
            Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu
            mengingat (kebesaran Allah).
          </p>
          <p
            className={cn(
              "m-0 p-0 text-gray-600 dark:text-gray-400",
            )}
            style={{ fontSize: "0.95rem" }}
          >
            QS. Adh-Dhariyat: 49
          </p>
        </motion.div>

        {/* Ayat 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={cn(
            "bg-white dark:bg-gray-900 mt-4 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700",
          )}
        >
          <p
            className={cn(
              "p-2 mb-2 text-gray-700 dark:text-gray-300",
            )}
            style={{ fontSize: "0.95rem" }}
          >
            dan sesungguhnya Dialah yang menciptakan pasangan laki-laki dan
            perempuan
          </p>
          <p
            className={cn(
              "m-0 p-0 text-gray-600 dark:text-gray-400",
            )}
            style={{ fontSize: "0.95rem" }}
          >
            QS. An-Najm: 45
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
