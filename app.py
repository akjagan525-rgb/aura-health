import streamlit as st
from analyzer import analyze_symptoms
from video_service import get_video_url_for_disease

st.set_page_config(
    page_title="Medical AI Assistant (தமிழ் / English)",
    page_icon="🩺",
    layout="wide"
)

# Header & Language Choice
top_col1, top_col2 = st.columns([3, 1])
with top_col1:
    st.title("🩺 AI மருத்துவ உதவியாளர் / Medical AI Assistant")
    st.write("அறிகுறிகளை உள்ளிடுங்கள் — சாத்தியமான நோய், அதன் காரணங்கள் மற்றும் விளக்க வீடியோவை தமிழில் பாருங்கள்.")
with top_col2:
    language = st.selectbox("🌐 மொழி / Language:", ["Tamil (தமிழ்)", "English"])

is_tamil = "Tamil" in language
lang_code = "Tamil" if is_tamil else "English"

# Quick Example Buttons
st.markdown("**மாதிரி அறிகுறிகள் / Quick Examples:**")
q1, q2, q3 = st.columns(3)
preset_text = ""

if is_tamil:
    if q1.button("🔥 நெஞ்செரிச்சல் (Acid Reflux)"):
        preset_text = "சாப்பிட்ட பிறகு நெஞ்சில் கடுமையான எரிச்சல், வாயில் புளித்த நீர் வருதல், படுக்கும்போது அதிகமாகிறது."
    if q2.button("⚡ ஒற்றைத் தலைவலி (Migraine)"):
        preset_text = "தலையின் ஒரு பகுதியில் தாங்க முடியாத வலி, குமட்டல், வெளிச்சமும் சத்தமும் பார்த்தால் வலி அதிகமாகிறது."
    if q3.button("🫁 ஆஸ்துமா / மூச்சுத்திணறல் (Asthma)"):
        preset_text = "மூச்சு விடும்போது விசில் சத்தம், நெஞ்சு இறுக்கம், இரவில் கடுமையான இருமல்."
else:
    if q1.button("🔥 Heartburn / GERD"):
        preset_text = "Burning pain behind breastbone after meals, acid regurgitation, worse when lying down."
    if q2.button("⚡ Throbbing Migraine"):
        preset_text = "Severe throbbing headache on one side with nausea and extreme sensitivity to bright light."
    if q3.button("🫁 Shortness of Breath / Asthma"):
        preset_text = "Wheezing sound while exhaling, chest tightness, and severe coughing spells at night."

# Input Box
input_label = "உங்கள் உடல் உபாதைகள் மற்றும் அறிகுறிகளை விவரிக்கவும் (தமிழ் அல்லது ஆங்கிலத்தில்):" if is_tamil else "Describe your symptoms in detail:"
symptoms = st.text_area(
    input_label,
    value=preset_text,
    placeholder="உதாரணம்: 2 நாட்களாக கடுமையான தலைவலி மற்றும் காய்ச்சல்..." if is_tamil else "e.g. Throbbing headache for 2 days with mild fever...",
    height=110
)

btn_label = "🔍 அறிகுறிகளை ஆராய்க & வீடியோவை காண்க" if is_tamil else "🔍 Analyze Symptoms & Find Video"

if st.button(btn_label, type="primary"):
    if not symptoms.strip():
        st.warning("தயவுசெய்து உங்கள் அறிகுறிகளை உள்ளிடவும்." if is_tamil else "Please enter your symptoms first.")
    else:
        with st.spinner("அறிகுறிகள் ஆராயப்பட்டு தமிழ் வீடியோ தேடப்படுகிறது..." if is_tamil else "Analyzing symptoms and searching medical video..."):
            try:
                result = analyze_symptoms(symptoms, language=lang_code)

                # Emergency Alert
                if result.is_emergency:
                    st.error(f"🚨 **அவசர எச்சரிக்கை / EMERGENCY WARNING**: {result.emergency_warning}")
                    st.stop()

                # Title Badge
                display_name = f"{result.disease_name_ta} ({result.disease_name_en})" if is_tamil else f"{result.disease_name_en}"
                st.success(f"**{'சாத்தியமான நோய்' if is_tamil else 'Possible Condition'}**: {display_name} | **{'நம்பகத்தன்மை' if is_tamil else 'Likelihood'}**: {result.confidence}")

                # 2-Column Display
                left_col, right_col = st.columns([1, 1], gap="large")

                with left_col:
                    st.subheader("📖 இந்நோய் பற்றிய விளக்கம்" if is_tamil else "📖 About this Condition")
                    st.write(result.summary)

                    st.subheader("🔬 சாத்தியமான காரணங்கள்" if is_tamil else "🔬 Biological Causes & Mechanisms")
                    for cause in result.possible_causes:
                        st.markdown(f"- {cause}")

                    st.subheader("⚡ தூண்டும் காரணிகள் (Triggers)" if is_tamil else "⚡ Triggers & Risk Factors")
                    for trigger in result.triggers_or_risk_factors:
                        st.markdown(f"- {trigger}")

                    st.subheader("📋 மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்" if is_tamil else "📋 Questions to Ask Your Doctor")
                    for q in result.questions_for_doctor:
                        st.markdown(f"- {q}")

                with right_col:
                    st.subheader("🎥 மருத்துவ விளக்க வீடியோ (Tamil Video)" if is_tamil else "🎥 Educational Medical Video")
                    
                    # Fetch dynamic Tamil or English video for this disease
                    video_url = get_video_url_for_disease(result.search_keyword_en, language=lang_code)
                    
                    st.video(video_url)
                    st.markdown(f"👉 [யூடியூபில் நேரடியாக பார்க்க / Open in YouTube]({video_url})")
                    st.caption(f"Medical explanation for: **{display_name}**")

            except Exception as e:
                st.error(f"Error occurred: {e}")

st.divider()
st.caption("⚠️ **மருத்துவ மறுப்பு (Disclaimer)**: இந்த செயலி கல்வி மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே. இது ஒரு முழுமையான மருத்துவ பரிசோதனைக்கு மாற்றாகாது. தகுந்த மருத்துவரை அணுகவும்.")