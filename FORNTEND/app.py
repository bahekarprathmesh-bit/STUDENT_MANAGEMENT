import streamlit as st
import requests


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "http://127.0.0.1:8000"


# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="Student Management System",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# CUSTOM CSS
# ============================================================

st.markdown(
    """
    <style>

    /* Main background */
    .stApp {
        background-color: #f5f7fb;
    }

    /* Header */
    .main-title {
        font-size: 38px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 5px;
    }

    .subtitle {
        color: #6b7280;
        font-size: 16px;
        margin-bottom: 30px;
    }

    /* Cards */
    .card {
        background-color: white;
        padding: 20px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.05);
        margin-bottom: 20px;
    }

    /* Statistics */
    .stat-card {
        background-color: white;
        padding: 22px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        text-align: center;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.05);
    }

    .stat-number {
        font-size: 30px;
        font-weight: 700;
        color: #2563eb;
    }

    .stat-label {
        color: #6b7280;
        font-size: 14px;
    }

    /* Sidebar */
    section[data-testid="stSidebar"] {
        background-color: #111827;
    }

    section[data-testid="stSidebar"] * {
        color: white;
    }

    /* Buttons */
    .stButton > button {
        border-radius: 8px;
        font-weight: 600;
    }

    /* Table */
    .student-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 10px;
        overflow: hidden;
    }

    .student-table th {
        background-color: #2563eb;
        color: white;
        padding: 14px;
        text-align: left;
    }

    .student-table td {
        padding: 14px;
        border-bottom: 1px solid #e5e7eb;
        color: #374151;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ============================================================
# HEADER
# ============================================================

st.markdown(
    '<div class="main-title">🎓 Student Management System</div>',
    unsafe_allow_html=True
)

st.markdown(
    '<div class="subtitle">Manage students easily using FastAPI + Supabase</div>',
    unsafe_allow_html=True
)


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("🎓 Student Manager")

st.sidebar.markdown("---")

menu = st.sidebar.radio(
    "Select Operation",
    [
        "🏠 Dashboard",
        "➕ Add Student",
        "👁️ View Students",
        "✏️ Update Student",
        "🗑️ Delete Student"
    ]
)

st.sidebar.markdown("---")

st.sidebar.info(
    "Backend API\n\n"
    "FastAPI: 127.0.0.1:8000\n\n"
    "Database: Supabase"
)


# ============================================================
# FUNCTION: GET STUDENTS
# ============================================================

def get_students():

    try:

        response = requests.get(
            f"{API_URL}/students",
            timeout=5
        )

        if response.status_code == 200:

            return response.json().get("data", [])

        else:

            st.error(
                f"Unable to fetch students.\n\n"
                f"Status Code: {response.status_code}"
            )

            return []

    except requests.exceptions.ConnectionError:

        st.error(
            "❌ Cannot connect to FastAPI backend.\n\n"
            "Please make sure FastAPI is running on port 8000."
        )

        return []

    except requests.exceptions.RequestException as e:

        st.error(f"Connection error: {e}")

        return []


# ============================================================
# DASHBOARD
# ============================================================

if menu == "🏠 Dashboard":

    students = get_students()

    total_students = len(students)

    if total_students > 0:

        total_marks = sum(
            student.get("marks", 0)
            for student in students
        )

        average_marks = total_marks / total_students

        highest_marks = max(
            student.get("marks", 0)
            for student in students
        )

    else:

        average_marks = 0
        highest_marks = 0


    # Statistics

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown(
            f"""
            <div class="stat-card">
                <div class="stat-number">{total_students}</div>
                <div class="stat-label">Total Students</div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col2:

        st.markdown(
            f"""
            <div class="stat-card">
                <div class="stat-number">
                    {average_marks:.1f}
                </div>
                <div class="stat-label">Average Marks</div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col3:

        st.markdown(
            f"""
            <div class="stat-card">
                <div class="stat-number">
                    {highest_marks}
                </div>
                <div class="stat-label">Highest Marks</div>
            </div>
            """,
            unsafe_allow_html=True
        )


    st.markdown("### 📋 Recent Students")

    if students:

        for student in students[-5:]:

            col1, col2, col3, col4 = st.columns(
                [1, 3, 3, 2]
            )

            col1.write(student.get("id"))
            col2.write(student.get("name"))
            col3.write(student.get("course"))
            col4.write(
                f"{student.get('marks')} marks"
            )

    else:

        st.info("No students found.")


# ============================================================
# ADD STUDENT
# ============================================================

elif menu == "➕ Add Student":

    st.header("➕ Add New Student")

    st.write("Enter student information below.")

    st.markdown("---")

    col1, col2 = st.columns(2)

    with col1:

        name = st.text_input(
            "Student Name",
            placeholder="Enter full name"
        )

    with col2:

        course = st.text_input(
            "Course",
            placeholder="e.g. Python, Data Analytics"
        )

    marks = st.number_input(
        "Marks",
        min_value=0,
        max_value=100,
        value=0,
        step=1
    )


    if st.button(
        "➕ Add Student",
        type="primary",
        use_container_width=True
    ):

        if not name.strip():

            st.warning("Please enter student name.")

        elif not course.strip():

            st.warning("Please enter course.")

        else:

            try:

                response = requests.post(
                    f"{API_URL}/students",
                    params={
                        "name": name,
                        "course": course,
                        "marks": marks
                    },
                    timeout=5
                )


                if response.status_code == 200:

                    st.success(
                        "✅ Student added successfully!"
                    )

                    st.balloons()

                    st.rerun()

                else:

                    st.error(
                        f"Failed to add student.\n\n"
                        f"{response.text}"
                    )


            except requests.exceptions.ConnectionError:

                st.error(
                    "❌ FastAPI backend is not running."
                )


# ============================================================
# VIEW STUDENTS
# ============================================================

elif menu == "👁️ View Students":

    st.header("👁️ All Students")

    students = get_students()


    if students:

        st.success(
            f"Total students: {len(students)}"
        )

        st.markdown("---")


        for student in students:

            with st.container():

                col1, col2, col3, col4 = st.columns(
                    [1, 3, 3, 2]
                )

                with col1:
                    st.write(
                        f"**ID**\n\n{student.get('id')}"
                    )

                with col2:
                    st.write(
                        f"**Name**\n\n{student.get('name')}"
                    )

                with col3:
                    st.write(
                        f"**Course**\n\n{student.get('course')}"
                    )

                with col4:
                    st.write(
                        f"**Marks**\n\n{student.get('marks')}"
                    )

                st.divider()


    else:

        st.info(
            "No students found in database."
        )


# ============================================================
# UPDATE STUDENT
# ============================================================

elif menu == "✏️ Update Student":

    st.header("✏️ Update Student")

    students = get_students()


    if students:

        student_options = {
            f"{s['id']} - {s['name']}": s
            for s in students
        }


        selected = st.selectbox(
            "Select Student",
            list(student_options.keys())
        )


        student = student_options[selected]


        st.markdown("---")

        st.write(
            f"Updating Student ID: **{student['id']}**"
        )


        col1, col2 = st.columns(2)

        with col1:

            new_name = st.text_input(
                "Student Name",
                value=student["name"]
            )

        with col2:

            new_course = st.text_input(
                "Course",
                value=student["course"]
            )


        new_marks = st.number_input(
            "Marks",
            min_value=0,
            max_value=100,
            value=int(student["marks"]),
            step=1
        )


        if st.button(
            "✏️ Update Student",
            type="primary",
            use_container_width=True
        ):

            try:

                response = requests.put(
                    f"{API_URL}/students/{student['id']}",
                    params={
                        "name": new_name,
                        "course": new_course,
                        "marks": new_marks
                    },
                    timeout=5
                )


                if response.status_code == 200:

                    st.success(
                        "✅ Student updated successfully!"
                    )

                    st.rerun()

                else:

                    st.error(
                        f"Update failed.\n\n"
                        f"{response.text}"
                    )


            except requests.exceptions.ConnectionError:

                st.error(
                    "❌ FastAPI backend is not running."
                )


    else:

        st.info("No students available to update.")


# ============================================================
# DELETE STUDENT
# ============================================================

elif menu == "🗑️ Delete Student":

    st.header("🗑️ Delete Student")

    students = get_students()


    if students:

        student_options = {
            f"{s['id']} - {s['name']}": s
            for s in students
        }


        selected = st.selectbox(
            "Select Student to Delete",
            list(student_options.keys())
        )


        student = student_options[selected]


        st.warning(
            f"You are about to delete "
            f"**{student['name']}** "
            f"(ID: {student['id']})."
        )


        if st.button(
            "🗑️ Delete Student",
            type="primary",
            use_container_width=True
        ):

            try:

                response = requests.delete(
                    f"{API_URL}/students/{student['id']}",
                    timeout=5
                )


                if response.status_code == 200:

                    st.success(
                        "✅ Student deleted successfully!"
                    )

                    st.rerun()

                else:

                    st.error(
                        f"Delete failed.\n\n"
                        f"{response.text}"
                    )


            except requests.exceptions.ConnectionError:

                st.error(
                    "❌ FastAPI backend is not running."
                )


    else:

        st.info(
            "No students available to delete."
        )