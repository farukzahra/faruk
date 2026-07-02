(function () {
  const dialog = document.getElementById("send-dialog");
  const form = document.getElementById("send-form");
  const openBtn = document.getElementById("send-resume-btn");
  const cancelBtn = document.getElementById("send-cancel");
  const submitBtn = document.getElementById("send-submit");
  const emailInput = document.getElementById("recipient-email");
  const statusEl = document.getElementById("send-status");

  function setStatus(message, type) {
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.className = "send-dialog__status";
    if (type) statusEl.classList.add("send-dialog__status--" + type);
  }

  function formatError(message) {
    if (!message) return "Erro ao enviar. Tente novamente.";
    if (message.includes("Email not configured")) {
      return "E-mail não configurado no servidor (Gmail API).";
    }
    return message;
  }

  function resetDialog() {
    setStatus("");
    emailInput.value = "";
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar';
  }

  openBtn.addEventListener("click", function () {
    resetDialog();
    dialog.showModal();
    emailInput.focus();
  });

  cancelBtn.addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("close", resetDialog);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const to = emailInput.value.trim();
    if (!to) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando…';
    setStatus("");

    try {
      const response = await fetch("/api/send-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email.");
      }

      setStatus("Currículo enviado de farukz@gmail.com!", "success");
      setTimeout(function () {
        dialog.close();
      }, 1500);
    } catch (err) {
      setStatus(formatError(err.message), "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar';
    }
  });
})();
