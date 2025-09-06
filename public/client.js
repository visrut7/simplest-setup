document.addEventListener("DOMContentLoaded", function () {
  const getCookieBtn = document.getElementById("getCookieBtn");
  const setCookieBtn = document.getElementById("setCookieBtn");
  const setHttpOnlyCookieBtn = document.getElementById("setHttpOnlyCookieBtn");
  const cookieNameInput = document.getElementById("cookieName");
  const cookieValueInput = document.getElementById("cookieValue");
  const httpOnlyCookieNameInput = document.getElementById("httpOnlyCookieName");
  const httpOnlyCookieValueInput = document.getElementById(
    "httpOnlyCookieValue"
  );
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

    // Get client-side accessible cookies
    const clientCookies = document.cookie
      .split(";")
      .map((c) => c.trim().split("=")[0]);

    cookies.forEach((cookie) => {
      const row = document.createElement("tr");
      const isHttpOnly = !clientCookies.includes(cookie.name);
      const type = isHttpOnly ? "HTTP-Only" : "Regular";
      const typeClass = isHttpOnly ? "http-only" : "regular";

      row.innerHTML = `
        <td class="cookie-name">${cookie.name}</td>
        <td class="cookie-value">${cookie.value}</td>
        <td><span class="cookie-type ${typeClass}">${type}</span></td>
        <td>
          ${
            type === "Regular"
              ? `<button class="btn-danger" onclick="deleteCookie('${cookie.name}')">Delete</button>`
              : `<button class="btn-danger" onclick="deleteHttpOnlyCookie('${cookie.name}')">Delete</button>`
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

  // Set HTTP-only cookie
  setHttpOnlyCookieBtn.addEventListener("click", async function () {
    const name = httpOnlyCookieNameInput.value.trim();
    const value = httpOnlyCookieValueInput.value.trim();

    if (!name || !value) {
      showStatus("Please enter both cookie name and value", "error");
      return;
    }

    setHttpOnlyCookieBtn.disabled = true;
    setHttpOnlyCookieBtn.textContent = "Setting...";

    try {
      const response = await fetch("/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, value }),
      });

      const data = await response.json();

      if (response.ok) {
        httpOnlyCookieNameInput.value = "";
        httpOnlyCookieValueInput.value = "";
        showStatus(data.message, "success");
      } else {
        showStatus(data.error || "Error setting HTTP-only cookie", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("Error setting HTTP-only cookie", "error");
    } finally {
      setHttpOnlyCookieBtn.disabled = false;
      setHttpOnlyCookieBtn.textContent = "Set HTTP-Only Cookie";
    }
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

  // Allow Enter key to set HTTP-only cookie
  httpOnlyCookieNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      setHttpOnlyCookieBtn.click();
    }
  });

  httpOnlyCookieValueInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      setHttpOnlyCookieBtn.click();
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

  // Make deleteHttpOnlyCookie function globally available
  window.deleteHttpOnlyCookie = async function (name) {
    try {
      const response = await fetch("/delete-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        showStatus(data.message, "success");
        // Refresh the table
        setTimeout(() => {
          getCookieBtn.click();
        }, 500);
      } else {
        showStatus(data.error || "Error deleting cookie", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("Error deleting cookie", "error");
    }
  };
});
