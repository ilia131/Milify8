"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CatalogSearch from "@/features/search/ui/CatalogSearch";
import SearchShortVideo from "@/components/Search/SearchShortVideo/SearchShortVideo";
import SearchFilterAllCard from "@/components/Search/SearchFilter/SearchFilterAllCard";
import { useGetShortVideoQuery } from "@/redux/services/artistApislice";

function DiscoverSearch() {
  const { data } = useGetShortVideoQuery(3);
  return <div className="mt-6">
    <SearchFilterAllCard title="مرور بر اساس سبک موسیقی" />
    {!!data?.results.length && <SearchShortVideo shortvideo={data.results.slice(0, 3)} title="ویدیوهای کوتاه" />}
  </div>;
}

function Search() {
  const query = useSearchParams().get("q")?.trim().slice(0, 200) ?? "";
  return <CatalogSearch key={query} initialQuery={query}><DiscoverSearch /></CatalogSearch>;
}

export default function SearchPage() {
  return <Suspense fallback={<p role="status" className="milify-page">در حال بارگذاری جست‌وجو…</p>}><Search /></Suspense>;
}
