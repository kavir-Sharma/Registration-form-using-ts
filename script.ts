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
  
    // Load data from storage based on the selected storage type.
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
  
    // Function to load data from the selected storage type
    function loadFromStorage(): void {
      const data = getStorageData();
      renderTable(data);
    }
  
    // Function to render the table with data
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
        const editButton = row.querySelector('.edit-btn') as HTMLButtonElement;
        const deleteButton = row.querySelector('.delete-btn') as HTMLButtonElement;
  
        editButton.addEventListener('click', () => {
          const { fullName, email, dob, contactNumber, ageGroup, address, reason } = entry;
          (form.elements.namedItem('fullName') as HTMLInputElement).value = fullName;
          (form.elements.namedItem('email') as HTMLInputElement).value = email;
          (form.elements.namedItem('dob') as HTMLInputElement).value = dob;
          (form.elements.namedItem('contactNumber') as HTMLInputElement).value = contactNumber;
          (form.elements.namedItem('ageGroup') as HTMLSelectElement).value = ageGroup;
          (form.elements.namedItem('address') as HTMLInputElement).value = address;
          (form.elements.namedItem('reason') as HTMLTextAreaElement).value = reason;
          editIndex = index;
          submitButton.textContent = 'Update';
        });
  
        deleteButton.addEventListener('click', () => {
          if (confirm('Are you sure you want to delete this entry?')) {
            data.splice(index, 1);
            setStorageData(data);
            renderTable(data);
            showPopup('Entry deleted successfully.');
          }
        });
  
        tbody.appendChild(row);
      });
  
      table.style.display = 'block';
    }
  
    // Function to show a popup message
    function showPopup(message: string): void {
      popup.textContent = message;
      popup.style.display = 'block';
      setTimeout(() => {
        popup.style.display = 'none';
      }, 3000);
    }
  
    // Function to get data from the selected storage type
    function getStorageData(): RegistrationData[] {
      const storageType = storageSelector.value as StorageType;
      let data: RegistrationData[] = [];
  
      if (storageType === 'local') {
        data = JSON.parse(localStorage.getItem('leoClubRegistrations') || '[]');
      } else if (storageType === 'session') {
        data = JSON.parse(sessionStorage.getItem('leoClubRegistrations') || '[]');
      } else if (storageType === 'cookie') {
        const cookieData = document.cookie.split(';').find(cookie => cookie.startsWith('leoClubRegistrations='));
        if (cookieData) {
          data = JSON.parse(decodeURIComponent(cookieData.split('=')[1]));
        }
      }
  
      return data;
    }
  
    // Function to store data in the selected storage type
    function setStorageData(data: RegistrationData[]): void {
      const storageType = storageSelector.value as StorageType;
  
      if (storageType === 'local') {
        localStorage.setItem('leoClubRegistrations', JSON.stringify(data));
      } else if (storageType === 'session') {
        sessionStorage.setItem('leoClubRegistrations', JSON.stringify(data));
      } else if (storageType === 'cookie') {
        document.cookie = `leoClubRegistrations=${encodeURIComponent(JSON.stringify(data))}; path=/`;
      }
    }
  });
  