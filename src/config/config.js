const config = {
  data: {
    // Main invitation title that appears on the page
    title: "Pernikahan Fulan & Fulana",
    // Opening message/description of the invitation
    description:
      "Kami akan menikah dan mengundang Anda untuk turut merayakan momen istimewa ini.",
    // Groom's name
    groomName: "Fulan",
    // Bride's name
    brideName: "Fulana",
    // Groom's title (e.g., "Putra ke-1")
    groomTitle: "Putra ke-1",
    // Bride's title (e.g., "Putri ke-1")
    brideTitle: "Putri ke-1",
    // Groom's parents names
    parentGroom: "Bapak Groom & Ibu Groom",
    // Bride's parents names
    parentBride: "Bapak Bride & Ibu Bride",
    // Wedding date (format: YYYY-MM-DD)
    date: "2024-12-24",
    // Wedding time
    time: "16:16 - 17:30 WIB",
    // Dresscode
    dresscode: "Busana batik dan bersepatu",
    // Google Maps link for location (short clickable link)
    maps_url: "https://goo.gl/maps/abcdef",
    // Google Maps embed code to display map on website
    maps_embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0000000000005!2d106.8270733147699!3d-6.175392995514422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f4f1b6d7b1e7%3A0x2e69f4f1b6d7b1e7!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1633666820004!5m2!1sid!2sid",
    // Venue/building name
    location: "Grand Ballroom, Hotel Majesty",
    // Full address of the wedding venue
    address: "Jl. Jend. Sudirman No.1, Jakarta",
    // Groom photo URL
    groomPhoto: "",
    // Bride photo URL
    bridePhoto: "",
    // OG Image (for social media sharing)
    ogImage: "",
    // Icon that appears in browser tab
    favicon: "/favicon.svg",
    // QRIS image URL
    qrisImage: "",
    // Gift contact phone
    giftContact: "",
    giftPhone: "",
    // Gallery images
    galleryImages: [],
    // Love story entries
    loveStory: [],
    // Firman Allah verses
    firmanVerses: [
      {
        text: "Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah).",
        surah: "QS. Adh-Dhariyat",
        ayat: "49",
      },
      {
        text: "dan sesungguhnya Dialah yang menciptakan pasangan laki-laki dan perempuan",
        surah: "QS. An-Najm",
        ayat: "45",
      },
    ],
    // List of event agenda/schedule
    agenda: [
      {
        title: "Akad Nikah",
        date: "2024-12-24",
        startTime: "16:16",
        endTime: "17:30",
        location: "Grand Ballroom, Hotel Majesty",
        address: "Jl. Jend. Sudirman No.1, Jakarta",
      },
      {
        title: "Resepsi Nikah",
        date: "2024-12-24",
        startTime: "16:16",
        endTime: "17:30",
        location: "Grand Ballroom, Hotel Majesty",
        address: "Jl. Jend. Sudirman No.1, Jakarta",
      },
    ],

    // Background music settings
    audio: {
      src: "/audio/fulfilling-humming.mp3",
      title: "Fulfilling Humming",
      autoplay: true,
      loop: true,
    },

    // List of bank accounts for digital envelope/gifts
    banks: [
      {
        bank: "Bank Central Asia",
        accountNumber: "1234567890",
        accountName: "FULAN",
      },
      {
        bank: "Bank Mandiri",
        accountNumber: "0987654321",
        accountName: "FULANA",
      },
    ],
  },
};

export default config;
