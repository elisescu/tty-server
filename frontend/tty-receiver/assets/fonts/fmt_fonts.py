import re

from pathlib import Path

family = "Sauce_Code_Pro"

pat = r"^" + family + r"_?(?P<weight>[a-zA-Z]*)_?(?P<italic>[a-zA-Z]*)\.ttf"

weights = {
  "medium" : 400,
  "" : 400,
  "extralight" : 250,
  "light" : 300,
  "semibold" : 600,
  "bold" : 700,
  "black": 800
}

styles = {
  "italic" : "italic",
  "" : "normal"
}

p = Path('.')
out = []

for font in p.iterdir():
    m = re.match(pat, font.name)

    match_dict = {"weight" : "", "italic" : ""}
    if m: 
        match_dict = m.groupdict(default = "")
    else:
        print(f"No match for: {font.name}!")

    weight = match_dict["weight"].lower()
    italic = match_dict["italic"].lower()
    
    css_weight = weights[""]
    css_style  = styles[""]
    if weight in weights: css_weight = weights[weight]
    if italic in styles: css_style = styles[italic]

    out += [f"""
@font-face  {{
  font-family: {family};
  font-style: {css_style};
  font-weight: {css_weight};
  src: url("assets/fonts/{font.name}");
}}           
"""]

for f in out:
    print(f)

