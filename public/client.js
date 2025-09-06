document.addEventListener("DOMContentLoaded", function () {
  const getCookieBtn = document.getElementById("getCookieBtn");
  const setCookieBtn = document.getElementById("setCookieBtn");
  const cookieNameInput = document.getElementById("cookieName");
  const cookieValueInput = document.getElementById("cookieValue");
  const statusDiv = document.getElementById("status");
  const cookieTableBody = document.getElementById("cookieTableBody");

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type} show`;

    setTimeout(() => {
      statusDiv.classList.remove("show");
    }, 3000);
  }

  function setCookie(name, value) {
    document.cookie = `${name}=${value}; Path=/`;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/;`;
  }

  function populateCookieTable(cookies) {
    cookieTableBody.innerHTML = "";

    if (cookies.length === 0) {
      cookieTableBody.innerHTML = `
        <tr class="no-data">
          <td colspan="4">No cookies found. Click "Get All Cookies" to load them.</td>
        </tr>
      `;
      return;
    }

    cookies.forEach((cookie) => {
      const row = document.createElement("tr");
      const typeClass = cookie.type === "HTTP-Only" ? "http-only" : "regular";

      row.innerHTML = `
        <td class="cookie-name">${cookie.name}</td>
        <td class="cookie-value">${cookie.value}</td>
        <td><span class="cookie-type ${typeClass}">${cookie.type}</span></td>
        <td>
          ${
            cookie.type === "Regular"
              ? `<button class="btn-danger" onclick="deleteCookie('${cookie.name}')">Delete</button>`
              : '<span style="color: #718096;">Server Only</span>'
          }
        </td>
      `;

      cookieTableBody.appendChild(row);
    });
  }

  // Get cookies from server
  getCookieBtn.addEventListener("click", async function () {
    getCookieBtn.disabled = true;
    getCookieBtn.textContent = "Loading...";

    try {
      const response = await fetch("/get-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Server response:", data);

      populateCookieTable(data.parsedCookies);
      showStatus("Cookies loaded successfully!", "success");
    } catch (error) {
      console.error("Error:", error);
      showStatus("Error loading cookies", "error");
    } finally {
      getCookieBtn.disabled = false;
      getCookieBtn.textContent = "Get All Cookies";
    }
  });

  // Set new cookie
  setCookieBtn.addEventListener("click", function () {
    const name = cookieNameInput.value.trim();
    const value = cookieValueInput.value.trim();

    if (!name || !value) {
      showStatus("Please enter both cookie name and value", "error");
      return;
    }

    setCookie(name, value);
    cookieNameInput.value = "";
    cookieValueInput.value = "";
    showStatus(`Cookie "${name}" set successfully!`, "success");
  });

  // Allow Enter key to set cookie
  cookieNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      setCookieBtn.click();
    }
  });

  cookieValueInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      setCookieBtn.click();
    }
  });

  // Make deleteCookie function globally available
  window.deleteCookie = function (name) {
    deleteCookie(name);
    showStatus(`Cookie "${name}" deleted!`, "success");
    // Refresh the table
    setTimeout(() => {
      getCookieBtn.click();
    }, 500);
  };
});
