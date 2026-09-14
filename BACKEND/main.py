from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Create FastAPI application
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://student-management-iuef.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


print("SUPABASE URL:", SUPABASE_URL)
print("KEY FOUND:", SUPABASE_KEY is not None)

# Connect Python to Supabase
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)




# CREATE student
@app.post("/students")
def create_student(name: str, course: str, marks: int):

    student = {
        "name": name,
        "course": course,
        "marks": marks
    }

    response = (
        supabase
        .table("students")
        .insert(student)
        .execute()
    )

    return {
        "message": "Student created successfully",
        "data": response.data
    }


# READ all students
@app.get("/students")
def get_students():

    response = (
        supabase
        .table("students")
        .select("*")
        .execute()
    )

    return {
        "data": response.data
    }


# UPDATE student
@app.put("/students/{id}")
def update_student(id: int, name: str, course: str, marks: int):

    student = {
        "name": name,
        "course": course,
        "marks": marks
    }

    response = (
        supabase
        .table("students")
        .update(student)
        .eq("id", id)
        .execute()
    )

    return {
        "message": "Student updated successfully",
        "data": response.data
    }


# DELETE student
@app.delete("/students/{id}")
def delete_student(id: int):

    response = (
        supabase
        .table("students")
        .delete()
        .eq("id", id)
        .execute()
    )

    return {
        "message": "Student deleted successfully",
        "data": response.data
    }