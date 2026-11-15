"use client";

import { useKunchanadaLogout } from "../../../hooks/useKunchanadaLogout";
import Image from "../../../../runtime/Image";
import { ChevronDown, LoaderCircle, LogOut, Moon, Sun } from "lucide-react";
import { Button, Menu, MenuItem, MenuTrigger, Popover, Separator } from "react-aria-components";
import { useTheme } from "../../../hooks/useTheme";
import styles from "./KunchanadaAccountMenu.module.css";

export function KunchanadaAccountMenu({
  schoolName,
  mediaUnitLogoUrl,
}: {
  schoolName: string;
  mediaUnitLogoUrl: string | null;
}) {
  const { isDark, toggleTheme } = useTheme();
  const { loggingOut, error, logout } = useKunchanadaLogout();

  return (
    <div className={styles.account}>
      <MenuTrigger>
        <Button
          aria-label={`${schoolName} account menu`}
          aria-busy={loggingOut}
          isDisabled={loggingOut}
          className={styles.trigger}
        >
          <span className={styles.logo}>
            {loggingOut ? (
              <LoaderCircle className={styles.spinner} size={16} aria-hidden />
            ) : mediaUnitLogoUrl ? (
              <Image src={mediaUnitLogoUrl} alt="" fill sizes="32px" className={styles.image} />
            ) : (
              <span aria-hidden="true">{schoolName.trim().charAt(0).toUpperCase() || "S"}</span>
            )}
          </span>
          <span className={styles.schoolName}>{schoolName}</span>
          <ChevronDown className={styles.chevron} size={14} aria-hidden />
        </Button>
        <Popover placement="bottom start" offset={8} className={styles.popover} data-lenis-prevent>
          <Menu aria-label="School account options" className={styles.menu}>
            <MenuItem
              id="theme"
              onAction={toggleTheme}
              className={styles.item}
              textValue={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </MenuItem>
            <Separator className={styles.separator} />
            <MenuItem
              id="logout"
              onAction={() => void logout()}
              isDisabled={loggingOut}
              className={`${styles.item} ${styles.logout}`}
              textValue="Log out"
            >
              <LogOut size={17} aria-hidden />
              <span>Log out</span>
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
