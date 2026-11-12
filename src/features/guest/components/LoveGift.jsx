import { motion } from "motion/react";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { cn } from "@/lib/utils";

export default function LoveGift() {
  const { config } = useConfig();
  const banks = config?.banks || [];

  return (
    <section
      className={cn("bg-gray-50 dark:bg-gray-800 py-8 px-4")}
      id="love-gift"
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
          Love Gift
        </h2>

        <p
          className={cn(
            "mb-6 text-gray-600 dark:text-gray-300",
          )}
        >
          Dengan hormat, bagi Anda yang ingin memberikan tanda kasih kepada kami,
          dapat melalui:
        </p>

        <div className={cn("space-y-4")}>
          {/* Bank Accounts */}
          {banks.map((bank, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mx-4 border border-gray-200 dark:border-gray-700 text-start",
              )}
            >
              <div className={cn("flex items-center gap-2 mb-2")}>
                <i className="fa-solid fa-money-bill-transfer text-gray-600 dark:text-gray-300" />
                <p className={cn("m-0 text-gray-800 dark:text-white")}>
                  Transfer
                </p>
              </div>

              <div className={cn("flex justify-between items-center mt-2")}>
                <p
                  className={cn("m-0 text-gray-700 dark:text-gray-200")}
                  style={{ fontSize: "0.95rem" }}
                >
                  <i className="fa-regular fa-user me-1" />
                  {bank.accountName}
                </p>
                <button
                  className={cn(
                    "btn btn-outline-gray btn-sm shadow-sm rounded-xl py-0 px-2",
                  )}
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => {
                    navigator.clipboard.writeText(bank.accountNumber);
                    alert("Nomor rekening disalin!");
                  }}
                >
                  <i className="fa-solid fa-copy" />
                </button>
              </div>

              <hr className={cn("my-2 py-1 border-gray-200 dark:border-gray-700")} />

              <div className={cn("space-y-1")}>
                <p className={cn("m-0 text-gray-700 dark:text-gray-200")}>
                  <i className="fa-solid fa-building-columns me-1" />
                  {bank.bank}
                </p>
                <div className={cn("flex justify-between items-center")}>
                  <p
                    className={cn("m-0 text-gray-600 dark:text-gray-300")}
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="fa-solid fa-credit-card me-1" />
                    {bank.accountNumber}
                  </p>
                  <button
                    className={cn(
                      "btn btn-outline-gray btn-sm shadow-sm rounded-xl py-0 px-2",
                    )}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => {
                      navigator.clipboard.writeText(bank.accountNumber);
                      alert("Nomor rekening disalin!");
                    }}
                  >
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* QRIS */}
          {config?.qrisImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: banks.length * 0.2, duration: 0.6 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mx-4 border border-gray-200 dark:border-gray-700 text-start",
              )}
            >
              <div className={cn("flex items-center gap-2 mb-2")}>
                <i className="fa-solid fa-qrcode text-gray-600 dark:text-gray-300" />
                <p className={cn("m-0 text-gray-800 dark:text-white")}>
                  Qris
                </p>
              </div>

              <div className={cn("flex justify-center my-2")}>
                <img
                  src={config.qrisImage}
                  alt="QRIS"
                  className={cn("w-48 h-48 object-contain bg-white p-2 rounded")}
                />
              </div>
            </motion.div>
          )}

          {/* Gift/Address */}
          {config?.giftContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mx-4 border border-gray-200 dark:border-gray-700 text-start",
              )}
            >
              <div className={cn("flex items-center gap-2 mb-2")}>
                <i className="fa-solid fa-gift text-gray-600 dark:text-gray-300" />
                <p className={cn("m-0 text-gray-800 dark:text-white")}>
                  Gift
                </p>
              </div>

              <div className={cn("flex justify-between items-center mt-2")}>
                <p
                  className={cn("m-0 text-gray-700 dark:text-gray-200")}
                  style={{ fontSize: "0.95rem" }}
                >
                  <i className="fa-regular fa-user me-1" />
                  {config.groomName || "Mempelai"}
                </p>
                <button
                  className={cn(
                    "btn btn-outline-gray btn-sm shadow-sm rounded-xl py-0 px-2",
                  )}
                  style={{ fontSize: "0.75rem" }}
                  data-bs-toggle="collapse"
                  data-bs-target="#gift-collapse"
                >
                  <i className="fa-solid fa-circle-info" />
                </button>
              </div>

              <div
                className={cn("collapse mt-2")}
                id="gift-collapse"
              >
                <hr className={cn("my-2 py-1 border-gray-200 dark:border-gray-700")} />
                {config.giftPhone && (
                  <div className={cn("flex justify-between items-center mb-2")}>
                    <p
                      className={cn("m-0 text-gray-700 dark:text-gray-200")}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="fa-solid fa-phone me-1" />
                      {config.giftPhone}
                    </p>
                    <button
                      className={cn(
                        "btn btn-outline-gray btn-sm shadow-sm rounded-xl py-0 px-2",
                      )}
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => {
                        navigator.clipboard.writeText(config.giftPhone);
                        alert("Nomor telepon disalin!");
                      }}
                    >
                      <i className="fa-solid fa-copy" />
                    </button>
                  </div>
                )}
                {config.address && (
                  <div className={cn("flex justify-between items-center")}>
                    <p
                      className={cn(
                        "my-0 text-gray-700 dark:text-gray-200 text-truncate",
                      )}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="fa-solid fa-location-dot me-1" />
                      {config.address}
                    </p>
                    <button
                      className={cn(
                        "btn btn-outline-gray btn-sm shadow-sm rounded-xl py-0 px-2",
                      )}
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => {
                        navigator.clipboard.writeText(config.address);
                        alert("Alamat disalin!");
                      }}
                    >
                      <i className="fa-solid fa-copy" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
