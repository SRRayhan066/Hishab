export const captureInstallPromptScript = `
window.__installPrompt = null;
window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  window.__installPrompt = event;
});
window.addEventListener("appinstalled", function () {
  window.__installPrompt = null;
  window.__appInstalled = true;
});
`;
