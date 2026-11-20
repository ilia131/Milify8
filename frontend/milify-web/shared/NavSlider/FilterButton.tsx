"use client";
import { useEffect } from "react";
import { FilterItem } from "./NavSlider";
import { useRouter } from "next/navigation";

interface FilterButtonProps {
  item: FilterItem;
  isActive: boolean;
  onClick: () => void; 
}

export const FilterButton = ({ item, isActive, onClick  }: FilterButtonProps) => {
  const router = useRouter();
  useEffect(() => {
    if (!isActive) {
      router.prefetch(item.href);
    }
  }, [item.href, isActive, router])
  const baseClasses =
    "flex items-center justify-center rounded-[19px] text-[13px] transition-colors";
    const activeClasses =
    "bg-[var(--milify-green)] text-black font-semibold";
  
  const inactiveClasses =
    "bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-white/10";
  const handlePrefetch = () => {
    if (!isActive) {
      router.prefetch(item.href);
    }
  };
  
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`${item.width} ${item.height} ${item.padding} ${baseClasses} ${
        isActive ? activeClasses : inactiveClasses
      }`}
      onMouseEnter={handlePrefetch} 
      onTouchStart={handlePrefetch}
    >
      {item.name}
    </button>
  );
};