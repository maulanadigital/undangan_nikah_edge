import { motion } from "motion/react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { cn } from "@/lib/utils";

export default function LoveStory() {
  const { config } = useConfig();

  const stories = config?.loveStory || [
    {
      title: "Awal Pertemuan Sederhana",
      icon: "💼",
      content:
        "Pada Januari 2025, Wahyu, seorang desainer grafis berusia 28 tahun, bertemu Riski, copywriter yang dikenal cerdas dan pendiam, dalam proyek branding perusahaan. Interaksi mereka di ruang rapat terbatas pada urusan kerja, penuh adab dan profesional.",
    },
    {
      title: "Benih Cinta dalam Ujian",
      icon: "💞",
      content:
        "Memasuki Februari 2025, proyek mereka menghadapi krisis: klien menolak konsep awal dan mengancam membatalkan kontrak. Di tengah tekanan, Riski tampil dengan solusi kreatif yang menyelamatkan proyek, membuat Wahyu terkesan dengan ketenangan dan kecerdasannya.",
    },
    {
      title: "Langkah Menuju Ridha Allah",
      icon: "💍",
      content:
        "Proses taaruf berjalan penuh keikhlasan, dengan pendamping yang memastikan setiap langkah sesuai syariat. Wahyu dan Riski saling terbuka tentang impian membangun keluarga yang diridhai Allah.",
    },
  ];

  return (
    <section
      className={cn("bg-white dark:bg-gray-900 py-8 px-4")}
      id="love-story"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn("max-w-4xl mx-auto")}
      >
        <div
          className={cn(
            "bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6",
          )}
        >
          <h2
            className={cn(
              "font-serif text-center text-xl md:text-2xl text-gray-800 dark:text-white py-2 mb-4",
            )}
            style={{ fontSize: "2.125rem" }}
          >
            Kisah Cinta
          </h2>

          <div
            className={cn("space-y-6")}
          >
            {stories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className={cn("row items-center")}
              >
                <div className={cn("col-auto position-relative flex justify-center")}>
                  <div
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-bold",
                    )}
                    style={{ backgroundColor: "#f3f4f6" }}
                  >
                    {index + 1}
                  </div>
                  {index < stories.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gray-300 dark:bg-gray-600 rounded-full",
                      )}
                    />
                  )}
                </div>

                <div className={cn("col mt-1 mb-3 ps-0 md:ps-4")}>
                  <p
                    className={cn("fw-bold mb-2 text-gray-800 dark:text-white")}
                  >
                    {story.icon} {story.title}
                  </p>
                  <p
                    className={cn("text-sm text-gray-600 dark:text-gray-300 mb-0")}
                  >
                    {story.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
