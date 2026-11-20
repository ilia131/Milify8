import { CloseButton } from "./CloseButton";
import { FilterItem } from "../FilterSlider/types";
import { FilterButton } from "../../shared/NavSlider/FilterButton";
import { useFilterLogic } from "@/hooks/libraryhooks/useFilterLogic";
interface FilterListProps {
    filters: FilterItem[];
    activeFilter: FilterItem | null;
    onFilterClick: (item: FilterItem) => void;
    onClose: () => void;
  }
  
export const FilterList = ({ filters, activeFilter, onFilterClick, onClose  }: FilterListProps) => {
    const { isActive, visibleFilters } = useFilterLogic(filters, activeFilter);

    return (
      <div className="flex min-h-9 flex-wrap items-center gap-2">
       {visibleFilters.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          {isActive(item) && <CloseButton onClick={onClose} />}
            <FilterButton
                item={item}
                isActive={isActive(item)}
                onClick={() => onFilterClick(item)}
            />
        </div>
      ))}
      </div>
    );
  };