// ============================================================
// CONFIGURATION
// ============================================================

// LOCAL BACKEND
// const API_URL = "http://127.0.0.1:8000";

// RAILWAY BACKEND
// Deploy केल्यानंतर तुझ्या Railway backend URL ने replace कर.
const API_URL = "http://127.0.0.1:8000";

// ============================================================
// GLOBAL DATA
// ============================================================

let students = [];


// ============================================================
// PAGE NAVIGATION
// ============================================================

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        const page = item.dataset.page;

        showPage(page);

    });

});


function showPage(page) {

    document.querySelectorAll(".page").forEach(section => {

        section.classList.remove("active");

    });


    const selectedPage = document.getElementById(page);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    menuItems.forEach(item => {

        item.classList.remove("active");

        if (item.dataset.page === page) {

            item.classList.add("active");

        }

    });


    if (page === "dashboard") {

        loadDashboard();

    }

    if (page === "students") {

        loadStudents();

    }

    if (page === "update") {

        loadUpdatePage();

    }

    if (page === "delete") {

        loadDeletePage();

    }

}


// ============================================================
// API REQUEST
// ============================================================

async function apiRequest(url, options = {}) {

    try {

        const response = await fetch(url, {

            ...options,

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }

        });


        let data = {};

        try {

            data = await response.json();

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                `Server error: ${response.status}`
            );

        }


        return data;

    }

    catch (error) {

        console.error(error);

        throw error;

    }

}


// ============================================================
// GET STUDENTS
// ============================================================

async function getStudents() {

    const data = await apiRequest(
        `${API_URL}/students`
    );

    students = data.data || [];

    return students;

}


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        const data = await getStudents();


        const total = data.length;


        const marks = data.map(student =>
            Number(student.marks) || 0
        );


        const average = total
            ? marks.reduce((a, b) => a + b, 0) / total
            : 0;


        const highest = total
            ? Math.max(...marks)
            : 0;


        document.getElementById(
            "totalStudents"
        ).textContent = total;


        document.getElementById(
            "averageMarks"
        ).textContent = average.toFixed(1);


        document.getElementById(
            "highestMarks"
        ).textContent = highest;


        renderRecentStudents(data);

    }

    catch (error) {

        document.getElementById(
            "recentStudents"
        ).innerHTML = `
            <div class="empty">
                ❌ ${escapeHtml(error.message)}
            </div>
        `;

    }

}


// ============================================================
// RECENT STUDENTS
// ============================================================

function renderRecentStudents(data) {

    const container =
        document.getElementById("recentStudents");


    if (!data.length) {

        container.innerHTML = `
            <div class="empty">
                No students found.
            </div>
        `;

        return;

    }


    const recent = data.slice(-5).reverse();


    container.innerHTML = recent.map(student => `

        <div class="student-row">

            <div class="student-id">
                #${escapeHtml(student.id)}
            </div>

            <div class="student-name">
                ${escapeHtml(student.name)}
            </div>

            <div class="student-course">
                ${escapeHtml(student.course)}
            </div>

            <div class="marks">
                ${escapeHtml(student.marks)} / 100
            </div>

        </div>

    `).join("");

}


// ============================================================
// ADD STUDENT
// ============================================================

document
    .getElementById("addForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const name =
            document.getElementById("addName")
            .value
            .trim();


        const course =
            document.getElementById("addCourse")
            .value
            .trim();


        const marks =
            Number(
                document.getElementById("addMarks").value
            );


        if (!name) {

            showToast(
                "Warning",
                "Please enter student name."
            );

            return;

        }


        if (!course) {

            showToast(
                "Warning",
                "Please enter course."
            );

            return;

        }


        if (
            Number.isNaN(marks) ||
            marks < 0 ||
            marks > 100
        ) {

            showToast(
                "Warning",
                "Marks must be between 0 and 100."
            );

            return;

        }


        try {

            await apiRequest(

                `${API_URL}/students` +
                `?name=${encodeURIComponent(name)}` +
                `&course=${encodeURIComponent(course)}` +
                `&marks=${marks}`,

                {
                    method: "POST"
                }

            );


            this.reset();


            showToast(
                "Success",
                "Student added successfully!"
            );


            setTimeout(() => {

                showPage("dashboard");

            }, 700);

        }

        catch (error) {

            showToast(
                "Error",
                error.message
            );

        }

    });


// ============================================================
// VIEW STUDENTS
// ============================================================

async function loadStudents() {

    const tbody =
        document.getElementById("studentTableBody");


    tbody.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="loading">
                    Loading students...
                </div>
            </td>
        </tr>
    `;


    try {

        const data = await getStudents();


        document.getElementById(
            "studentCount"
        ).textContent = data.length;


        renderStudentTable(data);

    }

    catch (error) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty">
                        ❌ ${escapeHtml(error.message)}
                    </div>
                </td>
            </tr>
        `;

    }

}


// ============================================================
// STUDENT TABLE
// ============================================================

function renderStudentTable(data) {

    const tbody =
        document.getElementById(
            "studentTableBody"
        );


    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">

                    <div class="empty">
                        No students found.
                    </div>

                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = data.map(student => {

        const marks =
            Number(student.marks) || 0;


        let performance =
            "Low";

        let className =
            "low";


        if (marks >= 80) {

            performance = "Excellent";

            className = "excellent";

        }

        else if (marks >= 60) {

            performance = "Good";

            className = "good";

        }

        else if (marks >= 40) {

            performance = "Average";

            className = "average";

        }


        const firstLetter =
            String(student.name || "?")
            .charAt(0)
            .toUpperCase();


        return `

            <tr>

                <td>
                    <span class="id-badge">
                        #${escapeHtml(student.id)}
                    </span>
                </td>


                <td>

                    <div class="student-cell">

                        <div class="student-avatar">
                            ${escapeHtml(firstLetter)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(student.name)}
                            </strong>

                            <small>
                                Student
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(student.course)}
                </td>


                <td>

                    <span class="mark-badge">
                        ${escapeHtml(student.marks)}
                    </span>

                    / 100

                </td>


                <td>

                    <span class="performance ${className}">
                        ${performance}
                    </span>

                </td>

            </tr>

        `;

    }).join("");

}


// ============================================================
// SEARCH
// ============================================================

document
    .getElementById("searchInput")
    .addEventListener("input", function() {

        const search =
            this.value
            .toLowerCase()
            .trim();


        const filtered =
            students.filter(student => {

                return (

                    String(student.id)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(student.name)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(student.course)
                        .toLowerCase()
                        .includes(search)

                );

            });


        renderStudentTable(filtered);

    });


// ============================================================
// UPDATE PAGE
// ============================================================

async function loadUpdatePage() {

    const container =
        document.getElementById(
            "updateContent"
        );


    container.innerHTML =
        `<div class="loading">Loading...</div>`;


    try {

        await getStudents();


        if (!students.length) {

            container.innerHTML = `
                <div class="empty">
                    No students available.
                </div>
            `;

            return;

        }


        container.innerHTML = `

            <div class="select-area">

                <label class="select-label">
                    Select Student
                </label>

                <select id="updateSelect">

                    ${students.map(student => `

                        <option value="${escapeHtml(student.id)}">

                            ${escapeHtml(student.id)}
                            -
                            ${escapeHtml(student.name)}

                        </option>

                    `).join("")}

                </select>

            </div>


            <div id="updateFormArea"></div>

        `;


        document
            .getElementById("updateSelect")
            .addEventListener(
                "change",
                renderUpdateForm
            );


        renderUpdateForm();

    }

    catch (error) {

        container.innerHTML = `
            <div class="empty">
                ❌ ${escapeHtml(error.message)}
            </div>
        `;

    }

}


// ============================================================
// UPDATE FORM
// ============================================================

function renderUpdateForm() {

    const id =
        document.getElementById(
            "updateSelect"
        ).value;


    const student =
        students.find(
            s => String(s.id) === String(id)
        );


    if (!student) return;


    document.getElementById(
        "updateFormArea"
    ).innerHTML = `

        <div class="selected-info">

            <strong>
                Updating Student #${escapeHtml(student.id)}
            </strong>

            <p>
                Modify the information below.
            </p>

        </div>


        <div class="form-grid">

            <div class="input-group">

                <label>
                    Student Name
                </label>

                <div class="input-wrapper">

                    <i data-lucide="user"></i>

                    <input
                        id="updateName"
                        value="${escapeAttr(student.name)}"
                    >

                </div>

            </div>


            <div class="input-group">

                <label>
                    Course
                </label>

                <div class="input-wrapper">

                    <i data-lucide="book-open"></i>

                    <input
                        id="updateCourse"
                        value="${escapeAttr(student.course)}"
                    >

                </div>

            </div>

        </div>


        <div class="input-group">

            <label>
                Marks
            </label>

            <div class="input-wrapper">

                <i data-lucide="percent"></i>

                <input
                    id="updateMarks"
                    type="number"
                    min="0"
                    max="100"
                    value="${Number(student.marks) || 0}"
                >

            </div>

        </div>


        <div class="form-actions">

            <button
                class="cancel-btn"
                onclick="showPage('dashboard')">

                Cancel

            </button>


            <button
                class="primary-btn"
                onclick="updateStudent()">

                <i data-lucide="save"></i>

                Save Changes

            </button>

        </div>

    `;


    lucide.createIcons();

}


// ============================================================
// UPDATE STUDENT
// ============================================================

async function updateStudent() {

    const id =
        document.getElementById(
            "updateSelect"
        ).value;


    const name =
        document.getElementById(
            "updateName"
        ).value.trim();


    const course =
        document.getElementById(
            "updateCourse"
        ).value.trim();


    const marks =
        Number(
            document.getElementById(
                "updateMarks"
            ).value
        );


    if (!name || !course) {

        showToast(
            "Warning",
            "Name and course are required."
        );

        return;

    }


    try {

        await apiRequest(

            `${API_URL}/students/${encodeURIComponent(id)}` +
            `?name=${encodeURIComponent(name)}` +
            `&course=${encodeURIComponent(course)}` +
            `&marks=${marks}`,

            {
                method: "PUT"
            }

        );


        showToast(
            "Success",
            "Student updated successfully!"
        );


        setTimeout(() => {

            showPage("students");

        }, 700);

    }

    catch (error) {

        showToast(
            "Error",
            error.message
        );

    }

}


// ============================================================
// DELETE PAGE
// ============================================================

async function loadDeletePage() {

    const container =
        document.getElementById(
            "deleteContent"
        );


    container.innerHTML =
        `<div class="loading">Loading...</div>`;


    try {

        await getStudents();


        if (!students.length) {

            container.innerHTML = `
                <div class="empty">
                    No students available.
                </div>
            `;

            return;

        }


        container.innerHTML = `

            <div class="select-area">

                <label class="select-label">
                    Select Student
                </label>

                <select id="deleteSelect">

                    ${students.map(student => `

                        <option value="${escapeHtml(student.id)}">

                            ${escapeHtml(student.id)}
                            -
                            ${escapeHtml(student.name)}

                        </option>

                    `).join("")}

                </select>

            </div>


            <div id="deleteArea"></div>

        `;


        document
            .getElementById("deleteSelect")
            .addEventListener(
                "change",
                renderDeleteArea
            );


        renderDeleteArea();

    }

    catch (error) {

        container.innerHTML = `
            <div class="empty">
                ❌ ${escapeHtml(error.message)}
            </div>
        `;

    }

}


// ============================================================
// DELETE AREA
// ============================================================

function renderDeleteArea() {

    const id =
        document.getElementById(
            "deleteSelect"
        ).value;


    const student =
        students.find(
            s => String(s.id) === String(id)
        );


    if (!student) return;


    document.getElementById(
        "deleteArea"
    ).innerHTML = `

        <div class="danger-warning">

            <strong>
                ⚠️ Warning
            </strong>

            <br><br>

            You are about to delete

            <strong>
                ${escapeHtml(student.name)}
            </strong>

            (ID: ${escapeHtml(student.id)}).

            <br><br>

            This action cannot be undone.

        </div>


        <button
            class="delete-btn"
            onclick="deleteStudent()">

            🗑 Delete Student

        </button>

    `;

}


// ============================================================
// DELETE STUDENT
// ============================================================

async function deleteStudent() {

    const id =
        document.getElementById(
            "deleteSelect"
        ).value;


    const student =
        students.find(
            s => String(s.id) === String(id)
        );


    if (!student) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete ${student.name}?`
        );


    if (!confirmed) return;


    try {

        await apiRequest(

            `${API_URL}/students/${encodeURIComponent(id)}`,

            {
                method: "DELETE"
            }

        );


        showToast(
            "Success",
            "Student deleted successfully!"
        );


        setTimeout(() => {

            showPage("students");

        }, 700);

    }

    catch (error) {

        showToast(
            "Error",
            error.message
        );

    }

}


// ============================================================
// REFRESH
// ============================================================

function refreshCurrentPage() {

    const activePage =
        document.querySelector(
            ".page.active"
        );


    if (!activePage) return;


    const page =
        activePage.id;


    showPage(page);

}


// ============================================================
// TOAST
// ============================================================

function showToast(title, message) {

    const toast =
        document.getElementById("toast");


    document.getElementById(
        "toastTitle"
    ).textContent = title;


    document.getElementById(
        "toastMessage"
    ).textContent = message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// ============================================================
// SECURITY HELPERS
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, character => {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character];

        });

}


function escapeAttr(value) {

    return escapeHtml(value);

}


// ============================================================
// INITIAL LOAD
// ============================================================

loadDashboard();