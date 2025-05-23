document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm") as HTMLFormElement;
  const storageSelector = document.getElementById("storageType") as HTMLSelectElement;
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  const popup = document.getElementById("customPopup") as HTMLDivElement;
  const table = document.getElementById("dataTable") as HTMLTableElement;
  const tbody = table.querySelector("tbody") as HTMLTableSectionElement;

  let editIndex: number | null = null;
  let registrationIdCounter = parseInt(localStorage.getItem("leoRegIdCounter") || "660100");

  if (!storageSelector.value) {
    storageSelector.value = "local";
  }

  loadFromStorage();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const dob = form.dob.value;
    const contactNumber = form.contactNumber.value.trim();
    const ageGroup = form.ageGroup.value;
    const address = form.address.value.trim();
    const reason = form.reason.value.trim();

    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;

    if (!nameRegex.test(fullName)) return alert("Invalid name.");
    if (!phoneRegex.test(contactNumber)) return alert("Invalid phone number.");

    const data = getStorageData();
    let newEntry: any;

    if (editIndex !== null) {
      newEntry = { ...data[editIndex], fullName, email, dob, contactNumber, ageGroup, address, reason };
      data[editIndex] = newEntry;
      editIndex = null;
      submitButton.textContent = "Submit";
      showPopup("Entry updated successfully.");
    } else {
      const registrationId = registrationIdCounter++;
      localStorage.setItem("leoRegIdCounter", registrationIdCounter.toString());
      newEntry = { registrationId, fullName, email, dob, contactNumber, ageGroup, address, reason };
      data.push(newEntry);
      showPopup("Registration submitted successfully.");
    }

    setStorageData(data);
    renderTable(data);
    form.reset();
  });

  storageSelector.addEventListener("change", () => {
    editIndex = null;
    submitButton.textContent = "Submit";
    loadFromStorage();
  });

  function loadFromStorage(): void {
    const data = getStorageData();
    renderTable(data);
  }

  function renderTable(data: any[]): void {
    tbody.innerHTML = "";

    if (data.length === 0) {
      table.style.display = "none";
      return;
    }

    data.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.registrationId}</td>
        <td>${entry.fullName}</td>
        <td>${entry.email}</td>
        <td>${entry.dob}</td>
        <td>${entry.contactNumber}</td>
        <td>${entry.ageGroup}</td>
        <td>${entry.address}</td>
        <td>${entry.reason}</td>
        <td>
          <button class="edit-btn action-btn">Edit</button>
          <button class="delete-btn action-btn">Delete</button>
        </td>
      `;

      row.querySelector(".edit-btn")?.addEventListener("click", () => {
        form.fullName.value = entry.fullName;
        form.email.value = entry.email;
        form.dob.value = entry.dob;
        form.contactNumber.value = entry.contactNumber;
        form.ageGroup.value = entry.ageGroup;
        form.address.value = entry.address;
        form.reason.value = entry.reason;
        editIndex = index;
        submitButton.textContent = "Save";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      row.querySelector(".delete-btn")?.addEventListener("click", () => {
        if (confirm("Delete this entry?")) {
          data.splice(index, 1);
          setStorageData(data);
          renderTable(data);
        }
      });

      tbody.appendChild(row);
    });

    table.style.display = "table";
  }

  function getStorageData(): any[] {
    const type = storageSelector.value;
    try {
      if (type === "local") return JSON.parse(localStorage.getItem("leoRegistrations") || "[]");
      if (type === "session") return JSON.parse(sessionStorage.getItem("leoRegistrations") || "[]");
      if (type === "cookie") return JSON.parse(getCookie("leoRegistrations") || "[]");
    } catch {
      return [];
    }
    return [];
  }

  function setStorageData(data: any[]): void {
    const type = storageSelector.value;
    const str = JSON.stringify(data);
    if (type === "local") localStorage.setItem("leoRegistrations", str);
    else if (type === "session") sessionStorage.setItem("leoRegistrations", str);
    else if (type === "cookie") setCookie("leoRegistrations", str, 7);
  }

  function setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  function getCookie(name: string): string {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
  }

  function showPopup(message: string): void {
    popup.textContent = message;
    popup.style.display = "block";
    setTimeout(() => (popup.style.display = "none"), 3000);
  }
});
