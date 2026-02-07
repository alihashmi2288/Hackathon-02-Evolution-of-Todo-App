"""
Script to drop the 'todos' and 'todo_tags' tables.
This forces SQLModel to recreate them with the latest schema (including due_date and priority).
"""
import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.getcwd())

from sqlmodel import create_engine, text
from app.config import settings

def nuke_todos_table():
    print(f"Connecting to database...")
    # Convert PostgresDsn to string
    engine = create_engine(str(settings.database_url))
    
    with engine.connect() as conn:
        print("Dropping todo_tags table (if exists)...")
        conn.execute(text("DROP TABLE IF EXISTS todo_tags CASCADE;"))
        
        print("Dropping todos table (if exists)...")
        conn.execute(text("DROP TABLE IF EXISTS todos CASCADE;"))
        
        print("Dropping priority enum type (if exists)...")
        conn.execute(text("DROP TYPE IF EXISTS priority_enum CASCADE;"))
        
        conn.commit()
        print("Tables dropped successfully.")

if __name__ == "__main__":
    nuke_todos_table()
