var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("registerForm");
    var storageSelector = document.getElementById("storageType");
    var submitButton = form.querySelector('button[type="submit"]');
    var popup = document.getElementById("customPopup");
    var table = document.getElementById("dataTable");
    var tbody = table.querySelector("tbody");
    var editIndex = null;
    var registrationIdCounter = parseInt(localStorage.getItem("leoRegIdCounter") || "660100");
    if (!storageSelector.value) {
        storageSelector.value = "local";
    }
    loadFromStorage();
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fullName = form.fullName.value.trim();
        var email = form.email.value.trim();
        var dob = form.dob.value;
        var contactNumber = form.contactNumber.value.trim();
        var ageGroup = form.ageGroup.value;
        var address = form.address.value.trim();
        var reason = form.reason.value.trim();
        var nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        var phoneRegex = /^\+?[1-9]\d{7,14}$/;
        if (!nameRegex.test(fullName))
            return alert("Invalid name.");
        if (!phoneRegex.test(contactNumber))
            return alert("Invalid phone number.");
        var data = getStorageData();
        var newEntry;
        if (editIndex !== null) {
            newEntry = __assign(__assign({}, data[editIndex]), { fullName: fullName, email: email, dob: dob, contactNumber: contactNumber, ageGroup: ageGroup, address: address, reason: reason });
            data[editIndex] = newEntry;
            editIndex = null;
            submitButton.textContent = "Submit";
            showPopup("Entry updated successfully.");
        }
        else {
            var registrationId = registrationIdCounter++;
            localStorage.setItem("leoRegIdCounter", registrationIdCounter.toString());
            newEntry = { registrationId: registrationId, fullName: fullName, email: email, dob: dob, contactNumber: contactNumber, ageGroup: ageGroup, address: address, reason: reason };
            data.push(newEntry);
            showPopup("Registration submitted successfully.");
        }
        setStorageData(data);
        renderTable(data);
        form.reset();
    });
    storageSelector.addEventListener("change", function () {
        editIndex = null;
        submitButton.textContent = "Submit";
        loadFromStorage();
    });
    function loadFromStorage() {
        var data = getStorageData();
        renderTable(data);
    }
    function renderTable(data) {
        tbody.innerHTML = "";
        if (data.length === 0) {
            table.style.display = "none";
            return;
        }
        data.forEach(function (entry, index) {
            var _a, _b;
            var row = document.createElement("tr");
            row.innerHTML = "\n        <td>".concat(entry.registrationId, "</td>\n        <td>").concat(entry.fullName, "</td>\n        <td>").concat(entry.email, "</td>\n        <td>").concat(entry.dob, "</td>\n        <td>").concat(entry.contactNumber, "</td>\n        <td>").concat(entry.ageGroup, "</td>\n        <td>").concat(entry.address, "</td>\n        <td>").concat(entry.reason, "</td>\n        <td>\n          <button class=\"edit-btn action-btn\">Edit</button>\n          <button class=\"delete-btn action-btn\">Delete</button>\n        </td>\n      ");
            (_a = row.querySelector(".edit-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
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
            (_b = row.querySelector(".delete-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
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
    function getStorageData() {
        var type = storageSelector.value;
        try {
            if (type === "local")
                return JSON.parse(localStorage.getItem("leoRegistrations") || "[]");
            if (type === "session")
                return JSON.parse(sessionStorage.getItem("leoRegistrations") || "[]");
            if (type === "cookie")
                return JSON.parse(getCookie("leoRegistrations") || "[]");
        }
        catch (_a) {
            return [];
        }
        return [];
    }
    function setStorageData(data) {
        var type = storageSelector.value;
        var str = JSON.stringify(data);
        if (type === "local")
            localStorage.setItem("leoRegistrations", str);
        else if (type === "session")
            sessionStorage.setItem("leoRegistrations", str);
        else if (type === "cookie")
            setCookie("leoRegistrations", str, 7);
    }
    function setCookie(name, value, days) {
        var expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = "".concat(name, "=").concat(encodeURIComponent(value), "; expires=").concat(expires, "; path=/");
    }
    function getCookie(name) {
        return document.cookie.split('; ').reduce(function (r, v) {
            var parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, "");
    }
    function showPopup(message) {
        popup.textContent = message;
        popup.style.display = "block";
        setTimeout(function () { return (popup.style.display = "none"); }, 3000);
    }
});
