/**
 * Guest App - New invitation layout based on maulanadigital/undangan_nikah
 */

import { useState, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useInvitation } from "@/features/invitation";
import { useMeta } from "@/hooks/use-meta";
import { useAudio } from "@/hooks/use-audio";
import staticConfig from "@/config/config";
import { LanguageProvider } from "@/lib/i18n";
import { useMotionPreset } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout";
import WelcomePage from "./components/WelcomePage";
import BrideSection from "./components/BrideSection";
import FirmanAllah from "./components/FirmanAllah";
import LoveStory from "./components/LoveStory";
import WeddingDate from "./components/WeddingDate";
import Gallery from "./components/Gallery";
import LoveGift from "./components/LoveGift";
import CommentSection from "@/features/wishes/components/wishes";

export default function GuestApp() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const { config, guest, isLoading, guestLoading, error } = useInvitation();
  const pageEnter = useMotionPreset("pageEnter");
  const pageExit = useMotionPreset("pageExit");

  const activeConfig = config || staticConfig.data;

  const audioControls = useAudio({
    src: activeConfig?.audio?.src || "/audio/fulfilling-humming.mp3",
    loop: activeConfig?.audio?.loop !== false,
  });

  const handleOpenInvitation = async () => {
    await audioControls.play();
    setIsInvitationOpen(true);
  };

  useMeta(activeConfig);

  // Show error state
  if (error) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50",
        )}
      >
        <div className={cn("text-center max-w-md mx-auto p-6")}>
          <div className={cn("text-rose-500 text-6xl mb-4")}>!</div>
          <h1 className={cn("text-2xl font-serif text-gray-800 mb-2")}>
            Invitation Not Found
          </h1>
          <p className={cn("text-gray-600 mb-4")}>{error}</p>
          <p className={cn("text-sm text-gray-500")}>
            Please check your URL or contact the organizer.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || guestLoading) {
    return (
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-[#faf9f7]",
        )}
        role="status"
        aria-label="Loading invitation"
      >
        <div className={cn("text-center")}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className={cn(
              "font-serif text-xs text-gray-400 tracking-[6px] uppercase",
            )}
          >
            Preparing
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 44 }}
            transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
            className={cn("h-px bg-rose-600 mx-auto mt-4")}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <LanguageProvider language={activeConfig?.language || "id"}>
      <AnimatePresence mode="wait">
        {!isInvitationOpen ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomePage onOpen={handleOpenInvitation} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            variants={pageEnter}
            initial="hidden"
            animate="visible"
            exit={pageExit}
          >
            <Layout audioControls={audioControls}>
              <Suspense fallback={null}>
                {/* Home Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={cn("min-h-screen relative overflow-hidden")}
                  id="home"
                >
                  {/* Background Image Slider */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-white via-rose-50/30 to-white",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-rose-100/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-pink-100/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2",
                    )}
                  />

                  <div
                    className={cn(
                      "relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16",
                    )}
                  >
                    <div
                      className={cn(
                        "w-full max-w-md text-center space-y-4",
                      )}
                    >
                      <p
                        className={cn(
                          "text-gray-500 font-light italic text-base sm:text-lg",
                        )}
                      >
                        Pernikahan
                      </p>
                      <h2
                        className={cn(
                          "text-3xl sm:text-5xl font-serif bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600",
                        )}
                      >
                        {activeConfig.groomName} & {activeConfig.brideName}
                      </h2>

                      <div
                        className={cn(
                          "relative max-w-md mx-auto my-4",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-b from-rose-50/50 to-white/50 backdrop-blur-md rounded-2xl",
                          )}
                        />
                        <div
                          className={cn(
                            "relative px-4 sm:px-8 py-8 sm:py-10 rounded-2xl border border-rose-100/50",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px",
                            )}
                          >
                            <div
                              className={cn(
                                "w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-rose-200 to-transparent",
                              )}
                            />
                          </div>

                          <div className={cn("space-y-6 text-center")}>
                            <div className={cn("space-y-3")}>
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className={cn(
                                  "flex items-center justify-center space-x-2",
                                )}
                              >
                                <p className={cn("text-gray-700 font-medium")}>
                                  {activeConfig.date
                                    ? new Date(activeConfig.date).toLocaleDateString(
                                        "id-ID",
                                        {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        },
                                      )
                                    : "Tanggal menunggu"}
                                </p>
                              </motion.div>
                            </div>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, duration: 0.6 }}
                              className={cn(
                                "flex items-center justify-center space-x-2",
                              )}
                            >
                              <p className={cn("text-gray-700 font-medium")}>
                                {activeConfig.time}
                              </p>
                            </motion.div>
                          </div>

                          {guest?.name && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6, duration: 0.6 }}
                              className={cn("space-y-2")}
                            >
                              <p
                                className={cn(
                                  "text-gray-500 font-serif italic text-sm",
                                )}
                              >
                                Kepada Yth
                              </p>
                              <p
                                className={cn(
                                  "text-rose-500 font-semibold text-lg",
                                )}
                              >
                                {guest.name}
                              </p>
                            </motion.div>
                          )}

                          <div
                            className={cn(
                              "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-px",
                            )}
                          >
                            <div
                              className={cn(
                                "w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-rose-200 to-transparent",
                              )}
                            />
                          </div>
                        </div>

                        <div
                          className={cn(
                            "absolute -top-2 -right-2 w-16 sm:w-24 h-16 sm:h-24 bg-rose-100/20 rounded-full blur-xl",
                          )}
                        />
                        <div
                          className={cn(
                            "absolute -bottom-2 -left-2 w-16 sm:w-24 h-16 sm:h-24 bg-rose-100/20 rounded-full blur-xl",
                          )}
                        />
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className={cn("pt-6 relative")}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <span className={cn("text-rose-500")}>
                            <i className="fa-solid fa-heart text-2xl" />
                          </span>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.section>

                {/* Bride Section */}
                <BrideSection />

                {/* Firman Allah */}
                <FirmanAllah />

                {/* Love Story */}
                <LoveStory />

                {/* Wedding Date */}
                <WeddingDate />

                {/* Gallery */}
                <Gallery />

                {/* Love Gift */}
                <LoveGift />

                {/* Comment Section */}
                <CommentSection />

                {/* Footer */}
                <footer
                  className={cn(
                    "bg-white dark:bg-gray-900 py-8 text-center",
                  )}
                >
                  <p
                    className={cn("text-gray-600 dark:text-gray-300 mb-2")}
                  >
                    Terima kasih atas perhatian dan doa restu Anda, yang menjadi
                    kebahagiaan serta kehormatan besar bagi kami.
                  </p>
                  <h2
                    className={cn(
                      "font-serif text-xl text-gray-800 dark:text-white",
                    )}
                  >
                    Wassalamualaikum Warahmatullahi Wabarakatuh
                  </h2>
                  <h2
                    className={cn(
                      "font-arabic text-xl text-gray-800 dark:text-white pt-2",
                    )}
                  >
                    اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَۙ
                  </h2>

                  <hr className={cn("my-4 border-gray-200 dark:border-gray-700")} />

                  <div
                    className={cn(
                      "row align-items-center justify-content-between flex-column pb-3",
                    )}
                  >
                    <div className={cn("col-auto")}>
                      <small className={cn("text-gray-500 dark:text-gray-400")}>
                        Build with <i className="fa-solid fa-heart mx-1 text-rose-500" />
                        Sakeenah
                      </small>
                    </div>
                  </div>
                </footer>
              </Suspense>
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>
    </LanguageProvider>
  );
}
