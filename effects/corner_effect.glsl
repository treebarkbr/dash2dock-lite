uniform sampler2D tex;
uniform float radius;
uniform float smoothing;
uniform float width;
uniform float height;

void main() {
    vec2 texCoord = cogl_tex_coord_in[0].st;
    vec4 color = texture2D(tex, texCoord);

    float r = min(radius, min(width, height) * 0.5);
    if (r <= 0.0) {
        cogl_color_out = color;
        return;
    }

    vec2 p = texCoord * vec2(width, height);
    vec2 halfSize = vec2(width, height) * 0.5;
    vec2 corner = max(abs(p - halfSize) - (halfSize - vec2(r)), vec2(0.0));

    float exponent = mix(2.0, 5.0, clamp(smoothing, 0.0, 1.0));
    vec2 normalized = corner / r;
    float field = pow(normalized.x, exponent) + pow(normalized.y, exponent);
    float edge = 1.5 / max(r, 1.0);
    float alpha = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, field);

    cogl_color_out = vec4(color.rgb, color.a * alpha);
}
