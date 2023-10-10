from armor_optimizer import find_best_set, get_score_functions, string_armor_set, scales
import streamlit as st
import random
sliders = {
    key: st.sidebar.slider(key,0.,float(scales[key]),None) for key in scales.keys()
}

st.title("Armor Optimizer")


print(sliders)
st.header(string_armor_set(find_best_set(get_score_functions(sliders))))