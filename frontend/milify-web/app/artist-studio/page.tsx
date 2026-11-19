import { redirect } from "next/navigation";

export default function ArtistStudioRedirect() {
  redirect(process.env.NEXT_PUBLIC_ARTIST_ORIGIN ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3002" : "https://artist.milify.ir"));
}
