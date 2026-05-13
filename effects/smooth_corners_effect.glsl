uniform sampler2D tex;
uniform float actorWidth;
uniform float actorHeight;
uniform float clipRadius;
uniform float exponent;

float circleBounds(vec2 p, vec2 center, float radius) {
    vec2 delta = p - center;
    float distSquared = dot(delta, delta);

    float outerRadius = radius + 0.5;
    if (distSquared >= outerRadius * outerRadius)
        return 0.0;

    float innerRadius = radius - 0.5;
    if (distSquared <= innerRadius * innerRadius)
        return 1.0;

    return outerRadius - sqrt(distSquared);
}

float squircleBounds(vec2 p, vec2 center, float radius, float n) {
    vec2 delta = abs(p - center);
    float dist = pow(pow(delta.x, n) + pow(delta.y, n), 1.0 / n);
    return clamp(radius - dist + 0.5, 0.0, 1.0);
}

float getPointOpacity(vec2 p, vec2 size, float radius, float n) {
    if (p.x < 0.0 || p.x > size.x || p.y < 0.0 || p.y > size.y)
        return 0.0;

    float centerLeft = radius;
    float centerRight = size.x - radius;
    float centerTop = radius;
    float centerBottom = size.y - radius;
    vec2 center;

    if (p.x < centerLeft)
        center.x = centerLeft;
    else if (p.x > centerRight)
        center.x = centerRight;
    else
        return 1.0;

    if (p.y < centerTop)
        center.y = centerTop;
    else if (p.y > centerBottom)
        center.y = centerBottom;
    else
        return 1.0;

    if (n <= 2.0)
        return circleBounds(p, center, radius);

    return squircleBounds(p, center, radius, n);
}

void main() {
    vec2 texCoord = cogl_tex_coord_in[0].st;
    vec4 original = texture2D(tex, texCoord);
    vec2 size = vec2(actorWidth, actorHeight);
    vec2 p = texCoord * size;
    float alpha = getPointOpacity(p, size, clipRadius, exponent);

    cogl_color_out = vec4(original.rgb, original.a * alpha);
}
