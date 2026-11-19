import { apiSlice, sessionRequest } from "./apiSlice";

/* =========================================================
   USER
========================================================= */

interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  profile_pic?: string | null;
  is_artist?: boolean;
}

/* =========================================================
   REGISTER
========================================================= */

type RegisterRequest = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  re_password: string;
  favorite_artists: string[];
};

type RegisterResponse = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  favorite_artists?: string[];
};

/* =========================================================
   LOGIN
========================================================= */

type LoginResponse = Record<string, never>;

/* =========================================================
   GOOGLE LOGIN
========================================================= */

/**
 * Google ID Token
 *
 * Google
 *   ↓
 * Google ID Token
 *   ↓
 * Django /google/login/
 *   ↓
 * Milify JWT
 */

interface GoogleTokenLoginRequest {
  id_token: string;
}

interface GoogleTokenLoginResponse {
  created?: boolean;

  user?: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

/* =========================================================
   API
========================================================= */

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // =====================================================
    // GET CURRENT USER
    // =====================================================

    retrieveUser: builder.query<User, void>({
      query: () => "/users/me/",
      providesTags: ["UserProfile"],
    }),

    // =====================================================
    // NORMAL LOGIN
    // =====================================================

    login: builder.mutation<
      LoginResponse,
      {
        email: string;
        password: string;
      }
    >({
      query: (body) => sessionRequest("login", body),

      invalidatesTags: ["UserProfile"],
    }),

    // =====================================================
    // GOOGLE LOGIN
    // =====================================================

    /**
     * Google ID Token
     *       ↓
     * Django verifies Google
     *       ↓
     * Find / Create UserListener
     *       ↓
     * Milify Access + Refresh JWT
     */

    googleTokenLogin: builder.mutation<
      GoogleTokenLoginResponse,
      GoogleTokenLoginRequest
    >({
      query: (body) => sessionRequest("google", body),

      invalidatesTags: ["UserProfile"],
    }),

    // =====================================================
    // REGISTER
    // =====================================================

    register: builder.mutation<
      RegisterResponse,
      RegisterRequest
    >({
      query: (body) => ({
        url: "/users/",
        method: "POST",
        body,
      }),

      invalidatesTags: ["UserProfile"],
    }),

    // =====================================================
    // LOGOUT
    // =====================================================

    logout: builder.mutation<
      unknown,
      void
    >({
      query: () => sessionRequest("logout"),

      invalidatesTags: ["UserProfile"],
    }),

    // =====================================================
    // ACTIVATION
    // =====================================================

    activation: builder.mutation<
      unknown,
      {
        uid: string;
        token: string;
      }
    >({
      query: ({ uid, token }) => ({
        url: "/users/activation/",
        method: "POST",
        body: {
          uid,
          token,
        },
      }),
    }),

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    resetPassword: builder.mutation<
      unknown,
      string
    >({
      query: (email) => ({
        url: "/users/reset_password/",
        method: "POST",
        body: {
          email,
        },
      }),
    }),

    // =====================================================
    // RESET PASSWORD CONFIRM
    // =====================================================

    resetPasswordConfirm: builder.mutation<
      unknown,
      {
        uid: string;
        token: string;
        new_password: string;
        re_new_password: string;
      }
    >({
      query: ({
        uid,
        token,
        new_password,
        re_new_password,
      }) => ({
        url: "/users/reset_password_confirm/",
        method: "POST",
        body: {
          uid,
          token,
          new_password,
          re_new_password,
        },
      }),
    }),
  }),
});

/* =========================================================
   EXPORT HOOKS
========================================================= */

export const {
  // Current User
  useRetrieveUserQuery,

  // Normal Login
  useLoginMutation,

  // Google
  useGoogleTokenLoginMutation,

  // Register
  useRegisterMutation,

  // Logout
  useLogoutMutation,

  // Activation
  useActivationMutation,

  // Password Reset
  useResetPasswordMutation,
  useResetPasswordConfirmMutation,

} = authApiSlice;