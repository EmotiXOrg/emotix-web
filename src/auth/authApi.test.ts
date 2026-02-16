import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  discoverAuthMethods,
  debugSession,
  doSignOut,
  getAuthMethods,
  isSignedIn,
  nativeConfirm,
  nativeConfirmReset,
  nativeRequestReset,
  nativeResend,
  nativeSignIn,
  nativeSignUp,
  setPassword,
} from "./authApi";

const {
  signUpMock,
  confirmSignUpMock,
  resendSignUpCodeMock,
  signInMock,
  signOutMock,
  resetPasswordMock,
  confirmResetPasswordMock,
  getCurrentUserMock,
  fetchAuthSessionMock,
  fetchMock,
} = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  confirmSignUpMock: vi.fn(),
  resendSignUpCodeMock: vi.fn(),
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  resetPasswordMock: vi.fn(),
  confirmResetPasswordMock: vi.fn(),
  getCurrentUserMock: vi.fn(),
  fetchAuthSessionMock: vi.fn(),
  fetchMock: vi.fn(),
}));

// All Amplify boundaries are mocked so these tests validate only wrapper behavior.
vi.mock("aws-amplify/auth", () => ({
  signUp: signUpMock,
  confirmSignUp: confirmSignUpMock,
  resendSignUpCode: resendSignUpCodeMock,
  signIn: signInMock,
  signOut: signOutMock,
  resetPassword: resetPasswordMock,
  confirmResetPassword: confirmResetPasswordMock,
  getCurrentUser: getCurrentUserMock,
  fetchAuthSession: fetchAuthSessionMock,
}));

describe("authApi", () => {
  beforeEach(() => {
    signUpMock.mockReset();
    confirmSignUpMock.mockReset();
    resendSignUpCodeMock.mockReset();
    signInMock.mockReset();
    signOutMock.mockReset();
    resetPasswordMock.mockReset();
    confirmResetPasswordMock.mockReset();
    getCurrentUserMock.mockReset();
    fetchAuthSessionMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("nativeSignUp returns ok on successful sign up", async () => {
    signUpMock.mockResolvedValue(undefined);

    const result = await nativeSignUp("dev@emotix.net", "Password123!");

    // Failure means signup payload/wrapper contract changed and new accounts may break.
    expect(signUpMock).toHaveBeenCalledWith({
      username: "dev@emotix.net",
      password: "Password123!",
      options: { userAttributes: { email: "dev@emotix.net" } },
    });
    expect(result).toEqual({ ok: true });
  });

  it("nativeSignUp maps Amplify errors to AuthResult", async () => {
    signUpMock.mockRejectedValue({
      name: "UsernameExistsException",
      message: "User already exists",
    });

    const result = await nativeSignUp("dev@emotix.net", "Password123!");

    // Failure means UI may lose machine-readable error code handling.
    expect(result).toEqual({
      ok: false,
      code: "UsernameExistsException",
      message: "User already exists",
    });
  });

  it("nativeSignIn maps non-object errors to generic auth message", async () => {
    signInMock.mockRejectedValue("unexpected");

    const result = await nativeSignIn("dev@emotix.net", "Password123!");

    // Failure means unstructured backend errors may leak inconsistent messages into UI.
    expect(result).toEqual({ ok: false, message: "Authentication error" });
  });

  it("nativeConfirm and nativeResend return ok on success", async () => {
    confirmSignUpMock.mockResolvedValue(undefined);
    resendSignUpCodeMock.mockResolvedValue(undefined);

    const confirmResult = await nativeConfirm("dev@emotix.net", "123456");
    const resendResult = await nativeResend("dev@emotix.net");

    // Failure means email verification flows are no longer wired to Cognito wrappers.
    expect(confirmSignUpMock).toHaveBeenCalledWith({
      username: "dev@emotix.net",
      confirmationCode: "123456",
    });
    expect(resendSignUpCodeMock).toHaveBeenCalledWith({ username: "dev@emotix.net" });
    expect(confirmResult).toEqual({ ok: true });
    expect(resendResult).toEqual({ ok: true });
  });

  it("nativeRequestReset always returns ok to prevent account enumeration", async () => {
    resetPasswordMock.mockRejectedValue({
      name: "UserNotFoundException",
      message: "User does not exist",
    });

    const result = await nativeRequestReset("missing@emotix.net");

    // Failure here is a security/UX regression: callers could infer account existence.
    expect(resetPasswordMock).toHaveBeenCalledWith({ username: "missing@emotix.net" });
    expect(result).toEqual({ ok: true });
  });

  it("nativeConfirmReset returns mapped error when reset confirmation fails", async () => {
    confirmResetPasswordMock.mockRejectedValue({
      name: "CodeMismatchException",
      message: "Invalid code",
    });

    const result = await nativeConfirmReset("dev@emotix.net", "000000", "NewPassword123!");

    // Failure means reset-password UI cannot reliably distinguish specific failure reasons.
    expect(result).toEqual({
      ok: false,
      code: "CodeMismatchException",
      message: "Invalid code",
    });
  });

  it("doSignOut returns ok when sign out succeeds", async () => {
    signOutMock.mockResolvedValue(undefined);

    const result = await doSignOut();

    // Failure means logout completion status can no longer be trusted by callers.
    expect(signOutMock).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: true });
  });

  it("isSignedIn returns true for valid session and false when session lookup fails", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ userId: "123" });
    getCurrentUserMock.mockRejectedValueOnce(new Error("no session"));

    const first = await isSignedIn();
    const second = await isSignedIn();

    // Failure means route guards may misclassify authenticated vs unauthenticated users.
    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it("debugSession returns fetchAuthSession result unchanged", async () => {
    const session = { tokens: { accessToken: { toString: () => "token" } } };
    fetchAuthSessionMock.mockResolvedValue(session);

    const result = await debugSession();

    // Failure means diagnostics tooling loses direct visibility into auth session shape.
    expect(result).toBe(session);
  });

  it("discoverAuthMethods posts email to backend discover endpoint", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ email: "dev@emotix.net", methods: ["password"], nextAction: "password" }),
    });

    const result = await discoverAuthMethods("dev@emotix.net");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/discover"),
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(result.nextAction).toBe("password");
  });

  it("getAuthMethods sends bearer token and returns parsed payload", async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: { accessToken: { toString: () => "token-123" } },
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ methods: [{ method: "password", provider: "COGNITO", verified: true }] }),
    });

    const result = await getAuthMethods();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/methods"),
      expect.objectContaining({
        method: "GET",
        headers: { authorization: "Bearer token-123" },
      })
    );
    expect(result.methods[0].method).toBe("password");
  });

  it("setPassword returns ok false when backend rejects request", async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: { accessToken: { toString: () => "token-123" } },
    });
    fetchMock.mockResolvedValue({
      ok: false,
    });

    const result = await setPassword("Password123!");

    expect(result).toEqual({ ok: false, message: "Failed to set password" });
  });
});
