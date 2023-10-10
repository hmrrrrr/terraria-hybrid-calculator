from armor_optimizer import find_best_set, get_score_functions, string_armor_set, scales
import streamlit as st

sliders = {
    key: st.sidebar.slider(key,0.,float(scales[key]),None) for key in scales.keys()
}
progression = st.sidebar.slider("Progression",0,5,None)

st.title("Armor Optimizer")

st.header(string_armor_set(find_best_set(get_score_functions(sliders),progression)))