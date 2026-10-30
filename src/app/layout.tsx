import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SneakerDrop - Premium Sneaker Showcase",
  description:
    "SneakerDrop is a fictional premium sneaker house. Small batches, numbered pairs, honest materials.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Theme
          appearance="dark"
          accentColor="jade"
          grayColor="sage"
          radius="medium"
          panelBackground="solid"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
