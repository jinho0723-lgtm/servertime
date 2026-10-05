import math
from PIL import Image, ImageDraw, ImageFilter

def create_favicon():
    # Supersampled high-res canvas (1024x1024)
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Squircle
    # Corner radius ~ 224 on 1024
    padding = 32
    bg_box = [padding, padding, size - padding, size - padding]
    corner_radius = 220

    # Draw rounded rectangle for dark background
    draw.rounded_rectangle(bg_box, radius=corner_radius, fill=(9, 14, 26, 255), outline=(30, 41, 59, 255), width=16)

    # 2. Glowing Dial Arc (Time Sweep from 7 o'clock around to 12 o'clock)
    # Center (512, 530) slightly offset down to give room to the 12 o'clock pinpoint
    cx, cy = 512, 532
    radius = 330
    ring_width = 68

    # We can draw the arc using fine angular segments for smooth color gradient
    # Angles: 135 deg to 450 deg (or 120 to 420)
    start_angle = 130
    end_angle = 410
    total_steps = 300

    for i in range(total_steps):
        t = i / total_steps
        angle_deg = start_angle + t * (end_angle - start_angle)
        rad = math.radians(angle_deg)
        x = cx + radius * math.cos(rad)
        y = cy + radius * math.sin(rad)

        # Gradient from Indigo (99, 102, 241) -> Electric Blue (37, 99, 235) -> Cyan (0, 240, 255)
        if t < 0.5:
            ratio = t / 0.5
            r = int(99 + ratio * (37 - 99))
            g = int(102 + ratio * (99 - 102))
            b = int(241 + ratio * (235 - 241))
        else:
            ratio = (t - 0.5) / 0.5
            r = int(37 + ratio * (0 - 37))
            g = int(99 + ratio * (240 - 99))
            b = int(235 + ratio * (255 - 235))

        r_dot = ring_width // 2
        draw.ellipse([x - r_dot, y - r_dot, x + r_dot, y + r_dot], fill=(r, g, b, 255))

    # 3. Outer subtle track ring for the missing segment (subtle dark slate)
    # From -90 (270) to 130
    track_radius = radius
    for a in range(50, 130, 2):
        rad = math.radians(a)
        x = cx + track_radius * math.cos(rad)
        y = cy + track_radius * math.sin(rad)
        draw.ellipse([x - 12, y - 12, x + 12, y + 12], fill=(30, 41, 59, 140))

    # 4. Center Core / Hub
    hub_radius = 96
    draw.ellipse([cx - hub_radius, cy - hub_radius, cx + hub_radius, cy + hub_radius], 
                 fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=18)
    
    inner_hub = 42
    draw.ellipse([cx - inner_hub, cy - inner_hub, cx + inner_hub, cy + inner_hub], 
                 fill=(0, 240, 255, 255))

    # 5. Bold High-Precision Needle / Pin pointing directly to 12 o'clock (00:00:00 Target)
    # Razor needle polygon: from center base to top apex
    needle_top_y = cy - radius - 55
    needle_tip = (cx, needle_top_y)
    needle_left = (cx - 36, cy - 20)
    needle_right = (cx + 36, cy - 20)
    needle_bottom = (cx, cy + 60)

    # Needle base shadow/body
    draw.polygon([needle_tip, needle_left, needle_bottom, needle_right], fill=(255, 255, 255, 255))
    # Half-needle shading for 3D metallic / luminous effect
    draw.polygon([needle_tip, needle_left, needle_bottom, (cx, cy - 20)], fill=(203, 213, 225, 255))
    draw.polygon([needle_tip, (cx, cy - 20), needle_bottom, needle_right], fill=(255, 255, 255, 255))

    # 6. Target Pin Head / Neon Pulse at 12 o'clock apex
    target_y = cy - radius
    pulse_r = 38
    # Glow ring
    draw.ellipse([cx - pulse_r - 16, target_y - pulse_r - 16, cx + pulse_r + 16, target_y + pulse_r + 16],
                 fill=(0, 240, 255, 100))
    # Core bright dot
    draw.ellipse([cx - pulse_r, target_y - pulse_r, cx + pulse_r, target_y + pulse_r],
                 fill=(0, 240, 255, 255), outline=(255, 255, 255, 255), width=8)

    # Small top tick mark at 12 o'clock outside ring
    tick_w = 12
    draw.rounded_rectangle([cx - tick_w, padding + 55, cx + tick_w, padding + 105], radius=6, fill=(0, 240, 255, 255))

    return img

if __name__ == "__main__":
    img = create_favicon()
    
    # Save high-res master
    img.save("public/icon-512.png", "PNG")
    
    # Generate 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save("public/icon-192.png", "PNG")

    # Generate 180x180 (apple-touch-icon)
    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save("public/apple-touch-icon.png", "PNG")

    # Generate multi-size favicon.ico (16, 32, 48)
    img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Favicon files generated successfully!")
