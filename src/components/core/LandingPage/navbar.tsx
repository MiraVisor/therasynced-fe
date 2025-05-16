import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/utils";
import { useTheme } from "next-themes";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // To track menu state (open/close)
  const [hash, setHash] = useState("#home"); // Active section state

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  console.log("resolvedTheme", resolvedTheme);
  const MobileNavbar = () => (
    <>
      <div className="flex items-center justify-between px-6 py-4 shadow-lg">
        <Link href={"/"}>
          <Image
            src={
              resolvedTheme === "dark"
                ? "/svgs/next_dark.jpeg"
                : "/svgs/next.svg"
            }
            alt="logo"
            width={54}
            height={54}
          />
        </Link>
        {/* Toggle the menu visibility when the icon is clicked */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isMenuOpen ? (
            <XIcon
              size={24}
              onClick={toggleMenu}
              className="cursor-pointer animate-in fade-in zoom-in duration-300 text-black dark:text-black"
            />
          ) : (
            <MenuIcon
              size={24}
              onClick={toggleMenu}
              className="cursor-pointer animate-in fade-in zoom-in duration-300 text-black dark:text-black"
            />
          )}{" "}
        </div>
      </div>

      {/* The mobile menu */}
      {isMenuOpen && (
        <div
          className={`flex flex-col items-center gap-6 p-4 bg-white shadow-lg transition-all duration-300 ease-in-out transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`} // Slide menu in/out based on `isMenuOpen`
        >
          <Link
            href={"#home"}
            onClick={() => {
              setHash("#home");
              setIsMenuOpen(false); // Close menu after clicking a link
            }}
            className={`capitalize text-sm ${
              hash === "#home" ? "text-primary" : "text-[#767676]"
            } transition-colors`}
          >
            home
          </Link>
          <Link
            href={"#about"}
            onClick={() => {
              setHash("#about");
              setIsMenuOpen(false); // Close menu after clicking a link
            }}
            className={`capitalize text-sm ${
              hash === "#about" ? "text-primary" : "text-[#767676]"
            } transition-colors`}
          >
            about us
          </Link>
          <Link
            href={"#services"}
            onClick={() => {
              setHash("#services");
              setIsMenuOpen(false); // Close menu after clicking a link
            }}
            className={`capitalize text-sm ${
              hash === "#services" ? "text-primary" : "text-[#767676]"
            } transition-colors`}
          >
            our services
          </Link>
          <Link
            href={"#pricing"}
            onClick={() => {
              setHash("#pricing");
              setIsMenuOpen(false); // Close menu after clicking a link
            }}
            className={`capitalize text-sm ${
              hash === "#pricing" ? "text-primary" : "text-[#767676]"
            } transition-colors`}
          >
            pricing
          </Link>

          {/* You can also include action buttons in the mobile menu */}
          <Button
            variant={"ghost"}
            className="capitalize w-36 h-10 rounded-sm bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            sign up
          </Button>
          <Button className="capitalize w-36 h-10 rounded-sm">log in</Button>
        </div>
      )}
    </>
  );

  const DesktopNavbar = () => (
    <div className="flex items-center justify-between px-14 py-4 shadow-lg font-semibold">
      <div className="flex items-center gap-11">
        <Link href={"/"}>
          <Image
            src={
              resolvedTheme === "dark"
                ? "/svgs/next_dark.jpeg"
                : "/svgs/next.svg"
            }
            alt="logo"
            width={54}
            height={54}
          />
        </Link>
        <div className="flex gap-6">
          <Link
            href={"#home"}
            onClick={() => setHash("#home")}
            className={`capitalize border-b-2 ${
              hash === "#home"
                ? "text-primary border-b-primary"
                : "text-foreground border-b-transparent"
            } text-sm`}
          >
            home
          </Link>
          <Link
            href={"#about"}
            onClick={() => setHash("#about")}
            className={`capitalize border-b-2 ${
              hash === "#about"
                ? "text-primary border-b-primary"
                : "text-foreground border-b-transparent"
            } text-sm`}
          >
            about us
          </Link>
          <Link
            href={"#services"}
            onClick={() => setHash("#services")}
            className={`capitalize border-b-2 ${
              hash === "#services"
                ? "text-primary border-b-primary"
                : "text-foreground border-b-transparent"
            } text-sm`}
          >
            our services
          </Link>
          <Link
            href={"#pricing"}
            onClick={() => setHash("#pricing")}
            className={`capitalize border-b-2 ${
              hash === "#pricing"
                ? "text-primary border-b-primary"
                : "text-foreground border-b-transparent"
            } text-sm`}
          >
            pricing
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Button variant={"ghost"} className="capitalize w-36 h-10 rounded-sm">
          sign up
        </Button>
        <Button className="capitalize w-36 h-10 rounded-sm">log in</Button>
      </div>
    </div>
  );

  return <>{isMobile ? <MobileNavbar /> : <DesktopNavbar />}</>;
};

export default Navbar;
