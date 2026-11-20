import FilterSlider from "@/components/FilterSlider/FilterSlider";
import BrowseWelcome from "./BrowseWelcome";
import ListeningSections from "./ListeningSections";

export default function BrowsePage() {
  return (
    <main className="milify-browse">
      <BrowseWelcome />
      <ListeningSections />
      <FilterSlider />
    </main>
  );
}
