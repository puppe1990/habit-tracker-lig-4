export function createAuthView({
  authView,
  trackerView,
  logoutBtn,
  subtitle,
  tabSignin,
  tabSignup,
  signinForm,
  signupForm,
  authError,
}) {
  function setError(message) {
    if (!message) {
      authError.textContent = "";
      authError.classList.add("hidden");
      return;
    }

    authError.textContent = message;
    authError.classList.remove("hidden");
  }

  function setMode(mode) {
    const signinActive = mode === "signin";
    tabSignin.classList.toggle("active", signinActive);
    tabSignup.classList.toggle("active", !signinActive);
    signinForm.classList.toggle("hidden", !signinActive);
    signupForm.classList.toggle("hidden", signinActive);
    setError("");
  }

  function updateSession({ loggedIn, userName }) {
    authView.classList.toggle("hidden", loggedIn);
    trackerView.classList.toggle("hidden", !loggedIn);
    logoutBtn.classList.toggle("hidden", !loggedIn);

    if (subtitle) {
      subtitle.textContent = loggedIn ? `Logado como ${userName}` : "LIG-4 no popup";
    }
  }

  function setupPasswordToggles() {
    for (const button of document.querySelectorAll(".password-toggle")) {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        const nextShown = button.getAttribute("data-shown") !== "true";
        input.type = nextShown ? "text" : "password";
        button.setAttribute("data-shown", String(nextShown));
        button.textContent = nextShown ? "🙈" : "👁";
        button.setAttribute("aria-label", nextShown ? "Ocultar senha" : "Mostrar senha");
      });
    }
  }

  return { setError, setMode, updateSession, setupPasswordToggles };
}
