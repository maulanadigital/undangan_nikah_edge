import { motion } from "motion/react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const { config } = useConfig();

  // Default images if not provided in config
  const images = config?.galleryImages || [
    "https://picsum.photos/1280/720?random=1",
    "https://picsum.photos/1280/720?random=2",
    "https://picsum.photos/1280/720?random=3",
    "https://picsum.photos/1280/720?random=4",
    "https://picsum.photos/1280/720?random=5",
    "https://picsum.photos/1280/720?random=6",
  ];

  return (
    <section
      className={cn("bg-white dark:bg-gray-900 py-8 px-4")}
      id="gallery"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn("max-w-4xl mx-auto")}
      >
        <div
          className={cn(
            "border rounded-xl shadow-lg p-4 md:p-6 bg-gray-50 dark:bg-gray-800",
          )}
        >
          <h2
            className={cn(
              "font-serif text-center text-xl md:text-2xl text-gray-800 dark:text-white py-2 mb-6",
            )}
            style={{ fontSize: "2.25rem" }}
          >
            Galeri
          </h2>

          <div
            className={cn("grid md:grid-cols-2 gap-4")}
          >
            {/* First Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={cn("rounded-xl overflow-hidden shadow-lg")}
            >
              <div
                id="carousel-1"
                className={cn("carousel slide")}
              >
                <div className={cn("carousel-inner")}>
                  {images.slice(0, 3).map((img, index) => (
                    <div
                      key={index}
                      className={cn(
                        `carousel-item ${index === 0 ? "active" : ""}`,
                      )}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className={cn("d-block w-full h-64 object-cover")}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className={cn(
                    "carousel-control-prev",
                  )}
                  type="button"
                  data-bs-target="#carousel-1"
                  data-bs-slide="prev"
                >
                  <span
                    className={cn("carousel-control-prev-icon")}
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className={cn("carousel-control-next")}
                  type="button"
                  data-bs-target="#carousel-1"
                  data-bs-slide="next"
                >
                  <span
                    className={cn("carousel-control-next-icon")}
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </motion.div>

            {/* Second Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={cn("rounded-xl overflow-hidden shadow-lg")}
            >
              <div
                id="carousel-2"
                className={cn("carousel slide")}
              >
                <div className={cn("carousel-inner")}>
                  {images.slice(3, 6).map((img, index) => (
                    <div
                      key={index}
                      className={cn(
                        `carousel-item ${index === 0 ? "active" : ""}`,
                      )}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${index + 4}`}
                        className={cn("d-block w-full h-64 object-cover")}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className={cn("carousel-control-prev")}
                  type="button"
                  data-bs-target="#carousel-2"
                  data-bs-slide="prev"
                >
                  <span
                    className={cn("carousel-control-prev-icon")}
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className={cn("carousel-control-next")}
                  type="button"
                  data-bs-target="#carousel-2"
                  data-bs-slide="next"
                >
                  <span
                    className={cn("carousel-control-next-icon")}
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
