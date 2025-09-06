document.addEventListener("DOMContentLoaded", function () {
  const logCookieBtn = document.getElementById("logCookieBtn");
  const statusDiv = document.getElementById("status");

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type} show`;

    setTimeout(() => {
      statusDiv.classList.remove("show");
    }, 3000);
  }

  logCookieBtn.addEventListener("click", async function () {
    logCookieBtn.disabled = true;
    logCookieBtn.textContent = "Logging...";

    try {
      const response = await fetch("/log-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Server response:", data.message);
      showStatus("Cookie logged to server console!", "success");
    } catch (error) {
      console.error("Error:", error);
      showStatus("Error logging cookie", "error");
    } finally {
      logCookieBtn.disabled = false;
      logCookieBtn.textContent = "Log HTTP-Only Cookie";
    }
  });
});
