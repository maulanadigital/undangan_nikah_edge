import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { useTranslation } from "@/lib/i18n";
import { formatEventDate } from "@/lib/format-event-date";
import { cn } from "@/lib/utils";

export default function WeddingDate() {
  const { config } = useConfig();
  const { t } = useTranslation();

  const calculateTimeLeft = useCallback(() => {
    if (!config?.date) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const difference = +new Date(config.date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [config?.date]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const agendas = config?.agenda || [];

  return (
    <section
      className={cn("bg-gray-50 dark:bg-gray-800 py-8 px-4")}
      id="wedding-date"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn("max-w-4xl mx-auto text-center")}
      >
        <h2
          className={cn(
            "font-serif text-xl md:text-2xl text-gray-800 dark:text-white py-4",
          )}
          style={{ fontSize: "2.25rem" }}
        >
          Moment Bahagia
        </h2>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={cn(
            "border rounded-xl shadow-lg py-3 px-4 mt-4 mb-6 bg-white dark:bg-gray-900",
          )}
        >
          <div
            className={cn("grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4")}
          >
            {[
              { label: "Hari", value: timeLeft.days, key: "day" },
              { label: "Jam", value: timeLeft.hours, key: "hour" },
              { label: "Menit", value: timeLeft.minutes, key: "minute" },
              { label: "Detik", value: timeLeft.seconds, key: "second" },
            ].map((item) => (
              <div
                key={item.key}
                className={cn("text-center")}
              >
                <p
                  className={cn(
                    "text-xl md:text-2xl font-bold text-gray-800 dark:text-white",
                  )}
                >
                  {item.value}
                </p>
                <small
                  className={cn("text-gray-500 dark:text-gray-400")}
                >
                  {item.label}
                </small>
              </div>
            ))}
          </div>
        </motion.div>

        <p
          className={cn(
            "py-4 text-gray-600 dark:text-gray-300",
          )}
        >
          Demi kehangatan bersama, kami memohon kesediaan Anda untuk menghadiri
          acara:
        </p>

        {/* Wedding Events */}
        <div
          className={cn("grid md:grid-cols-2 gap-6 mt-8")}
        >
          {agendas.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700",
              )}
            >
              <h3
                className={cn(
                  "font-serif text-lg text-gray-800 dark:text-white mb-2",
                )}
              >
                {event.title}
              </h3>
              <p
                className={cn("text-sm text-gray-500 dark:text-gray-400")}
              >
                {event.startTime || event.time} - Selesai
              </p>
              <p
                className={cn("text-sm text-gray-600 dark:text-gray-300 mt-2")}
              >
                {event.location || config?.location}
              </p>
            </motion.div>
          ))}

          {!agendas.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700",
              )}
            >
              <h3
                className={cn(
                  "font-serif text-lg text-gray-800 dark:text-white mb-2",
                )}
              >
                Akad & Resepsi
              </h3>
              <p
                className={cn("text-sm text-gray-500 dark:text-gray-400")}
              >
                {config?.time || "Pukul 10.00 WIB"} - Selesai
              </p>
              <p
                className={cn("text-sm text-gray-600 dark:text-gray-300 mt-2")}
              >
                {config?.location || "Lokasi akan diumumkan"}
              </p>
            </motion.div>
          )}
        </div>

        {/* Dresscode */}
        {config?.dresscode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={cn("mt-8")}
          >
            <p
              className={cn(
                "py-2 text-gray-600 dark:text-gray-300",
              )}
            >
              Demi kehangatan bersama, kami memohon kesediaan Anda untuk mengenakan
              dresscode:
            </p>
            <div
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 inline-block",
              )}
            >
              <p
                className={cn("text-gray-800 dark:text-white font-medium")}
              >
                {config.dresscode}
              </p>
            </div>
          </motion.div>
        )}

        {/* Location */}
        {config?.maps_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className={cn("mt-8")}
          >
            <a
              href={config.maps_url}
              target="_blank"
              className={cn(
                "inline-flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition",
              )}
            >
              <i className="fa-solid fa-map-location-dot"></i>
              Lihat Google Maps
            </a>
            <p
              className={cn("text-sm text-gray-500 dark:text-gray-400 mt-2")}
            >
              {config?.address}
            </p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
