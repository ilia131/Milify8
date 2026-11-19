"use client"
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchHeader from '@/components/Search/SearchHeaders/SearchHeader';
import SearchShortVideo from '@/components/Search/SearchShortVideo/SearchShortVideo';
import SearchFilterAllCard from '@/components/Search/SearchFilter/SearchFilterAllCard';
import { useGetShortVideoQuery } from '@/redux/services/artistApislice';



const Search = () => {
  const query = useSearchParams().get("q")?.trim().slice(0, 200) ?? "";
  const [scrolled, setScrolled] = useState(false);
  const { data} = useGetShortVideoQuery(3)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
       <div className="flex flex-col pt-7.5 ">
          <SearchHeader scrolled={scrolled} query={query} />
          {/* <SearchFilterSection categories={categories} title='Start browsing' /> */}
          {(data?.results.length ?? 0) > 0 && (
                     <SearchShortVideo shortvideo={data?.results.slice(0,3)} title='ویدیوهای کوتاه' />
          )}
          <SearchFilterAllCard  title='مرور بر اساس سبک موسیقی' />
       </div>
   
  )
}

export default function SearchPage() {
  return <Suspense fallback={<p role="status" className="p-4">در حال بارگذاری جستجو…</p>}><Search /></Suspense>;
}