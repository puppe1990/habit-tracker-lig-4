import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "./fonts/big-shoulders-display.woff2",
  variable: "--font-display",
  weight: "700 800",
  display: "swap",
});

const grotesk = localFont({
  src: "./fonts/schibsted-grotesk.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata = {
  title: "LIG-4 — Hábitos",
  description: "Marque o dia. Encaixe o disco. Quatro em linha com a sua rotina.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LIG-4",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1658c9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${grotesk.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const isProd = ${JSON.stringify(process.env.NODE_ENV === "production")};
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (!isProd) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      registrations.forEach(function(registration) {
                        registration.unregister();
                      });
                    });
                    if (window.caches) {
                      caches.keys().then(function(keys) {
                        keys.forEach(function(key) {
                          caches.delete(key);
                        });
                      });
                    }
                    return;
                  }

                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={grotesk.className}>{children}</body>
    </html>
  );
}
