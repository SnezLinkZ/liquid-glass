my attempt at liquid glass for the web

not physical refraction (yet) but it takes an orthographic projection from the top and has the ray be the surface normal of a custom smoothed calibrated rounded corner with a flat top to use liquid glass on an element, give it the .liquid-glass class in css css variables: --glass-depth: 3d distance from the background (for distortion calculations) --glass-frost: gaussian blur applied BEFORE displacement, on the unmodified original background --glass-strength: strength of the glass (coefficient for the refraction distance)

on page load, and whenever any elements update, call LiquidGlass.mapElements for react, call this on a state change when necessary.