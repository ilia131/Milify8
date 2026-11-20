import React from 'react'
import HeaderLibrary from './HeaderLibrary'
import { FilterList } from './FilterList'
import { FilterItem } from '../FilterSlider/types'

interface FilterListProps {
    filters: FilterItem[];
    activeFilter: FilterItem | null;
    handleClick: (item: FilterItem) => void;
    handleClose: () => void;
    handleOpen: (isOpen: boolean) => void
    isSearching: boolean;
    setIsSearching: (v: boolean) => void;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}

const HeaderSection = ({filters , activeFilter , handleClick , handleClose , handleOpen , isSearching , setIsSearching,
   searchTerm , setSearchTerm


}:FilterListProps) => {
  return (
     <div className="w-full max-w-xl">
        <div className="flex flex-col gap-3">
         <HeaderLibrary handleOpen={handleOpen}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
         />   
         <FilterList
            filters={filters}
            activeFilter={activeFilter}
            onFilterClick={handleClick}
            onClose={handleClose}
          /> 
       </div>
     </div>
 
  )
}

export default HeaderSection