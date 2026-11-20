"use client";

import { Plus, Search, X } from "lucide-react";

interface HeaderLibraryProps {
  handleOpen: (isOpen: boolean) => void;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function HeaderLibrary({ handleOpen, isSearching, setIsSearching, searchTerm, setSearchTerm }: HeaderLibraryProps) {
  return <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
    <h1 className="text-3xl font-black">کتابخانهٔ من</h1>
    <div className="flex items-center gap-1">
      <button type="button" className="milify-icon" aria-label="جست‌وجو در کتابخانه" aria-expanded={isSearching}
        onClick={() => {
          setIsSearching(!isSearching);
          if (isSearching) setSearchTerm("");
        }}>{isSearching ? <X size={20} /> : <Search size={20} />}</button>
      <button type="button" className="milify-icon" aria-label="ساخت پلی‌لیست" onClick={() => handleOpen(true)}><Plus size={21} /></button>
    </div>
    {isSearching && <label className="milify-search w-full">
      <Search size={18} aria-hidden />
      <input autoFocus type="search" aria-label="جست‌وجو در کتابخانه" placeholder="جست‌وجو در کتابخانه" dir="auto"
        value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
    </label>}
  </div>;
}
