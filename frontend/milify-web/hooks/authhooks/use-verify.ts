"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { finishInitialLoad, setAuth } from "@/redux/features/authSlice";
import { useRetrieveUserQuery } from "@/redux/services/authApiSlice";

export default function useVerify() {
  const dispatch = useAppDispatch();
  const finished = useAppSelector((state) => state.auth.initialLoadFinished);
  const { isSuccess, isError } = useRetrieveUserQuery(undefined, { skip: finished });

  useEffect(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }, []);

  useEffect(() => {
    if (finished) return;
    if (isSuccess) dispatch(setAuth());
    if (isError) dispatch(finishInitialLoad());
  }, [dispatch, finished, isError, isSuccess]);
}
