from http.server import BaseHTTPRequestHandler
import json
import math

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body.decode('utf-8'))
        
        # Extract parameters
        lights = data.get('lights', [])
        stick_x = data.get('stickX', 400)
        stick_height = data.get('stickHeight', 150)
        ground_y = data.get('groundY', 500)
        canvas_width = data.get('canvasWidth', 800)
        canvas_height = data.get('canvasHeight', 600)
        
        # Calculate shadow geometry for each light source
        shadow_results = []
        
        for i, light in enumerate(lights):
            light_x = light.get('x', 200)
            light_y = light.get('y', 150)
            is_extended = light.get('isExtended', False)
            radius = light.get('radius', 20)
            intensity = light.get('intensity', 1.0)
            
            if is_extended:
                # Calculate umbra and penumbra for extended light source
                shadow_data = calculate_extended_shadow(
                    light_x, light_y, radius,
                    stick_x, stick_height, ground_y
                )
            else:
                # Calculate simple shadow for point light source
                shadow_data = calculate_point_shadow(
                    light_x, light_y,
                    stick_x, stick_height, ground_y
                )
            
            shadow_data['light_index'] = i
            shadow_data['intensity'] = intensity
            shadow_results.append(shadow_data)
        
        # Send response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            'shadows': shadow_results,
            'stick_x': stick_x,
            'stick_height': stick_height
        }
        
        self.wfile.write(json.dumps(response).encode('utf-8'))
        return

def calculate_point_shadow(light_x, light_y, stick_x, stick_height, ground_y):
    """Calculate shadow from a point light source"""
    dx = stick_x - light_x
    dy = ground_y - light_y
    
    if dy <= 0:
        # Light is at or below ground level
        return {
            'type': 'point',
            'shadow_start': stick_x,
            'shadow_end': stick_x,
            'shadow_length': 0,
            'visible': False
        }
    
    # Calculate where shadow ends
    shadow_length = abs((stick_height * dx) / dy)
    shadow_end = stick_x + shadow_length
    
    return {
        'type': 'point',
        'shadow_start': stick_x,
        'shadow_end': shadow_end,
        'shadow_length': abs(shadow_length),
        'visible': True
    }

def calculate_extended_shadow(light_x, light_y, radius, stick_x, stick_height, ground_y):
    """Calculate umbra and penumbra from an extended light source"""
    
    # Calculate shadows from both edges of the light source
    left_edge_x = light_x - radius
    right_edge_x = light_x + radius
    
    # Left edge creates right boundary of umbra / left boundary of penumbra
    left_shadow = calculate_point_shadow(left_edge_x, light_y, stick_x, stick_height, ground_y)
    
    # Right edge creates left boundary of umbra / right boundary of penumbra
    right_shadow = calculate_point_shadow(right_edge_x, light_y, stick_x, stick_height, ground_y)
    
    if not left_shadow['visible'] or not right_shadow['visible']:
        return {
            'type': 'extended',
            'umbra_start': stick_x,
            'umbra_end': stick_x,
            'penumbra_left': stick_x,
            'penumbra_right': stick_x,
            'visible': False
        }
    
    # Determine umbra (complete shadow) and penumbra (partial shadow) regions
    # The umbra is where both edges of the light are blocked
    # The penumbra is where only one edge is blocked
    
    if light_x < stick_x:
        # Light is to the left of stick
        umbra_start = stick_x
        umbra_end = min(left_shadow['shadow_end'], right_shadow['shadow_end'])
        penumbra_left = stick_x
        penumbra_right = max(left_shadow['shadow_end'], right_shadow['shadow_end'])
    else:
        # Light is to the right of stick
        umbra_start = max(left_shadow['shadow_end'], right_shadow['shadow_end'])
        umbra_end = stick_x
        penumbra_left = min(left_shadow['shadow_end'], right_shadow['shadow_end'])
        penumbra_right = stick_x
    
    return {
        'type': 'extended',
        'umbra_start': umbra_start,
        'umbra_end': umbra_end,
        'penumbra_left': penumbra_left,
        'penumbra_right': penumbra_right,
        'visible': True,
        'has_umbra': abs(umbra_end - umbra_start) > 1
    }
