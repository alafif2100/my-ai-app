import streamlit as st
import google.generativeai as genai

# إعداد شكل الموقع
st.set_page_config(page_title="أداة الذكاء الاصطناعي", page_icon="⚙️", layout="centered")
st.title("مرحباً بك في أداة العمل 🚀")

# جلب مفتاح الربط بأمان من إعدادات الاستضافة
try:
    API_KEY = st.secrets["GEMINI_API_KEY"]
    genai.configure(api_key=API_KEY)
except:
    st.warning("يرجى وضع مفتاح API في إعدادات Streamlit.")

# مربع الإدخال (نفس فكرة المعاينة)
user_input = st.text_area("أدخل البيانات أو النص هنا:", height=150)

if st.button("تنفيذ"):
    if user_input:
        with st.spinner("جاري المعالجة..."):
            try:
                # يمكنك وضع نفس التعليمات (System Instructions) التي كتبتها في AI Studio هنا بين علامتي التنصيص
                system_instruction = "أنت مساعد محترف، أجب بناءً على المعطيات."
                
                model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=system_instruction
                )
                
                response = model.generate_content(user_input)
                st.success("تمت المهمة بنجاح!")
                st.info(response.text)
            except Exception as e:
                st.error("تأكد من إعدادات مفتاح الربط.")
    else:
        st.warning("الرجاء إدخال البيانات أولاً.")
