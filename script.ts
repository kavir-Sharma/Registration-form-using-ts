interface RegistrationData {
    registrationId: number;
    fullName: string;
    email: string;
    dob: string;
    contactNumber: string;
    ageGroup: string;
    address: string;
    reason: string;
  }
  
  type StorageType = 'local' | 'session' | 'cookie';
  
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm') as HTMLFormElement;
    const storageSelector = document.getElementById('storageType') as HTMLSelectElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const table = document.getElementById('dataTable') as HTMLTableElement;
    const tbody = table.querySelector('tbody') as HTMLTableSectionElement;
    const popup = document.getElementById('customPopup') as HTMLDivElement;
  
    let editIndex: number | null = null;
    let registrationIdCounter = parseInt(localStorage.getItem('leoRegIdCounter') || '660100', 10);
  
    loadFromStorage();
  
    form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
  
      const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim();
      const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
      const dob = (form.elements.namedItem('dob') as HTMLInputElement).value;
      const contactNumber = (form.elements.namedItem('contactNumber') as HTMLInputElement).value.trim();
      const ageGroup = (form.elements.namedItem('ageGroup') as HTMLSelectElement).value;
      const address = (form.elements.namedItem('address') as HTMLInputElement).value.trim();
      const reason = (form.elements.namedItem('reason') as HTMLTextAreaElement).value.trim();
  
      const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
      const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  
      if (!nameRegex.test(fullName)) {
        alert('Invalid name.');
        return;
      }
  
      if (!phoneRegex.test(contactNumber)) {
        alert('Invalid phone number.');
        return;
      }
  
      const data = getStorageData();
      let newEntry: RegistrationData;
  
      if (editIndex !== null) {
        newEntry = { ...data[editIndex], fullName, email, dob, contactNumber, ageGroup, address, reason };
        data[editIndex] = newEntry;
        editIndex = null;
        submitButton.textContent = 'Submit';
        showPopup('Entry updated successfully.');
      } else {
        const registrationId = registrationIdCounter++;
        localStorage.setItem('leoRegIdCounter', registrationIdCounter.toString());
        newEntry = { registrationId, fullName, email, dob, contactNumber, ageGroup, address, reason };
        data.push(newEntry);
      }
  
      setStorageData(data);
      renderTable(data);
      form.reset();
    });
  
    storageSelector.addEventListener('change', () => {
      editIndex = null;
      submitButton.textContent = 'Submit';
      loadFromStorage();
    });
  
    function loadFromStorage(): void {
      renderTable(getStorageData());
    }
  
    function renderTable(data: RegistrationData[]): void {
      tbody.innerHTML = '';
  
      if (data.length === 0) {
        table.style.display = 'none';
        return;
      }
  
      data.forEach((entry, index) => {
        const row = document.createElement('tr');
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
  
        const editBtn = row.querySelector('.edit-btn') as HTMLButtonElement;
        const deleteBtn = row.querySelector('.delete-btn') as HTMLButtonElement;
  
        editBtn.addEventListener('click', () => {
          (form.elements.namedItem('fullName') as HTMLInputElement).value = entry.fullName;
          (form.elements.namedItem('email') as HTMLInputElement).value = entry.email;
          (form.elements.namedItem('dob') as HTMLInputElement).value = entry.dob;
          (form.elements.namedItem('contactNumber') as HTMLInputElement).value = entry.contactNumber;
          (form.elements.namedItem('ageGroup') as HTMLSelectElement).value = entry.ageGroup;
          (form.elements.namedItem('address') as HTMLInputElement).value = entry.address;
          (form.elements.namedItem('reason') as HTMLTextAreaElement).value = entry.reason;
          editIndex = index;
          submitButton.textContent = 'Save';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
  
        deleteBtn.addEventListener('click', () => {
          if (confirm('Delete this entry?')) {
            data.splice(index, 1);
            setStorageData(data);
            renderTable(data);
          }
        });
  
        tbody.appendChild(row);
      });
  
      table.style.display = 'table';
    }
  
    function getStorageData(): RegistrationData[] {
      const type = storageSelector.value as StorageType;
      if (type === 'local') return JSON.parse(localStorage.getItem('leoRegistrations') || '[]') as RegistrationData[];
      if (type === 'session') return JSON.parse(sessionStorage.getItem('leoRegistrations') || '[]') as RegistrationData[];
      if (type === 'cookie') return JSON.parse(getCookie('leoRegistrations') || '[]') as RegistrationData[];
      return [];
    }
  
    function setStorageData(data: RegistrationData[]): void {
      const type = storageSelector.value as StorageType;
      const str = JSON.stringify(data);
      if (type === 'local') localStorage.setItem('leoRegistrations', str);
      else if (type === 'session') sessionStorage.setItem('leoRegistrations', str);
      else if (type === 'cookie') setCookie('leoRegistrations', str, 7);
    }
  
    function setCookie(name: string, value: string, days: number): void {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }
  
    function getCookie(name: string): string {
      return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
      }, '');
    }
  
    function showPopup(message: string): void {
      popup.textContent = message;
      popup.style.display = 'block';
      setTimeout(() => (popup.style.display = 'none'), 3000);
    }
  });
