import os
from typing import List
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()

# Read API Key from Streamlit Secrets, environment, or fallback
API_KEY = None
try:
    import streamlit as st
    if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
        API_KEY = st.secrets["GEMINI_API_KEY"]
except Exception:
    pass

if not API_KEY:
    API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY must be set in Streamlit secrets or the environment.")

client = genai.Client(api_key=API_KEY)

# Flexible schema that handles BOTH symptoms and ANY general health question
class MedicalResponse(BaseModel):
    is_symptom_diagnosis: bool = Field(description="True if the user is describing symptoms to diagnose; False if it is a general question or greeting")
    title_en: str = Field(description="Title or topic in English")
    title_ta: str = Field(description="Title or topic in Tamil (தமிழ் தலைப்பு)")
    confidence: str = Field(default="Informational", description="Likelihood (High/Moderate/Low) if symptoms, or 'Informational'")
    main_answer: str = Field(description="Direct, comprehensive explanation or answer in the requested language")
    detailed_points: List[str] = Field(description="Key biological causes, mechanisms, or important health points in the requested language")
    triggers_or_precautions: List[str] = Field(description="Triggers, lifestyle tips, or precautions in the requested language")
    search_keyword_en: str = Field(description="Standard English keyword to find the best educational medical video on YouTube")
    doctor_advice_or_questions: List[str] = Field(description="Questions to ask a doctor, or general medical guidance in the requested language")
    is_emergency: bool = Field(default=False, description="True if input indicates an emergency like heart attack or stroke")
    emergency_warning: str = Field(default="", description="Urgent medical warning if emergency")

def analyze_symptoms(user_input: str, language: str = "Tamil") -> MedicalResponse:
    system_instruction = f"""
    You are an expert, compassionate clinical AI assistant.
    The user may:
    1. Describe symptoms and want to know possible diseases and causes.
    2. Ask ANY medical, health, biological, medication, or wellness question (e.g. 'why does fever happen?', 'how to lower cholesterol?', 'what to eat in dengue?').
    3. Say hello or type conversational input.

    YOUR INSTRUCTIONS:
    - Respond in: {language}.
    - If language is 'Tamil', write main_answer, detailed_points, triggers_or_precautions, and doctor_advice_or_questions in clear, fluent TAMIL (தமிழ்).
    - If the input is a general question, set is_symptom_diagnosis to False and answer the question thoroughly.
    - If the input is a greeting or general text, warmly explain how you can help with medical questions and symptoms.
    - Always provide an educational video search query (search_keyword_en) related to the topic.
    - If life-threatening symptoms appear (chest pain, stroke symptoms, acute breathlessness), set is_emergency=True.
    - Never crash or output invalid text; always provide a helpful, educational response.
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"User query ({language}): {user_input}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=MedicalResponse,
                temperature=0.2,
            ),
        )
        return MedicalResponse.model_validate_json(response.text)
    except Exception as e:
        # Fallback if anything unexpected happens so the app NEVER crashes
        return MedicalResponse(
            is_symptom_diagnosis=False,
            title_en="Health Guidance",
            title_ta="மருத்துவ வழிகாட்டுதல்",
            confidence="Informational",
            main_answer=f"உங்கள் கேள்விக்கான பதில் தயாராகிறது: {user_input}" if language == "Tamil" else f"Here is information regarding: {user_input}",
            detailed_points=["மருத்துவ ஆலோசனைக்கு தகுந்த மருத்துவரை அணுகவும்." if language == "Tamil" else "Please consult a healthcare professional for specific clinical advice."],
            triggers_or_precautions=["ஆரோக்கியமான உணவு மற்றும் ஓய்வு அவசியம்." if language == "Tamil" else "Maintain adequate hydration and rest."],
            search_keyword_en="general health wellness medical",
            doctor_advice_or_questions=["அறிகுறிகள் தொடர்ந்தால் மருத்துவரிடம் செல்லவும்." if language == "Tamil" else "Consult a physician if symptoms persist."],
            is_emergency=False,
            emergency_warning=""
        )
