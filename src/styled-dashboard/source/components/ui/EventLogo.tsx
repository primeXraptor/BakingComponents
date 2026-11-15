import Image, { type ImageProps } from "../../../runtime/Image";
import type { Event } from "../../types/index";

type Props = Omit<ImageProps, "src" | "alt"> & {
  event: Pick<Event, "name" | "logoPath" | "darkLogoPath">;
  background?: "light" | "dark" | "theme";
};

/** logoPath is dark artwork; darkLogoPath stores light artwork for dark surfaces. */
export function EventLogo({ event, background = "theme", className = "", ...props }: Props) {
  if (background !== "theme")
    return (
      <Image
        {...props}
        src={background === "dark" ? event.darkLogoPath || event.logoPath : event.logoPath}
        alt={event.name}
        className={className}
      />
    );
  if (!event.darkLogoPath || event.darkLogoPath === event.logoPath) {
    return <Image {...props} src={event.logoPath} alt={event.name} className={className} />;
  }
  return (
    <>
      <Image
        {...props}
        src={event.logoPath}
        alt={event.name}
        className={`${className} dark:hidden`}
      />
      <Image
        {...props}
        src={event.darkLogoPath}
        alt={event.name}
        className={`${className} hidden dark:block`}
      />
    </>
  );
}
