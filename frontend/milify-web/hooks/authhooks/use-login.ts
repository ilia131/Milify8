import { useAppDispatch } from "@/redux/hook";
import { useLoginMutation } from "@/redux/services/authApiSlice";
import { setAuth } from "@/redux/features/authSlice";
import useSpotifyRouter from "./useSpotifyRouter";
import { useToast } from "@/components/ToastProvider/ToastProvider";

export default function useLogin() {
  const { replace } = useSpotifyRouter();
  const { success, error } = useToast();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      await login({ email: email.trim().toLowerCase(), password }).unwrap();
      dispatch(setAuth());
      success("با موفقیت وارد حساب شدید.");
      replace("/browse");
    } catch (failure) {
      const invalid = typeof failure === "object" && failure !== null &&
        "status" in failure && failure.status === 401;
      error(invalid ? "ایمیل یا رمز عبور درست نیست." : "ورود انجام نشد. دوباره تلاش کنید.");
    }
  };

  return { onSubmit, isLoading };
}
