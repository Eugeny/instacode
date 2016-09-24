import pygments.styles
from pygments.lexers import guess_lexer, get_lexer_by_name
from pygments.formatters import ImageFormatter
from pygments import highlight
from PIL import Image
from styles.solarized import SolarizedStyle
from styles.solarized256 import Solarized256Style


# PYGMENTS ---------------------------
STYLE_CLASS_MAP = {
    'solarized': SolarizedStyle,
    'solarized256': Solarized256Style,
}

old_gsbn = pygments.styles.get_style_by_name


def get_style_by_name(name):
    if name in STYLE_CLASS_MAP:
        return STYLE_CLASS_MAP[name]
    return old_gsbn(name)

pygments.styles.get_style_by_name = get_style_by_name

LIGHT_THEMES = ['vs', 'tango', 'solarized']
# ---------------------------


class Instacode:
    def run(self, code, language=None, font='Ubuntu Mono', style='solarized256'):
        # cut n pad
        max_height = 60
        max_width = 120
        code = '\n' + '\n'.join(('  ' + x[:max_width] + '  ') for x in code.splitlines()[:max_height]) + '\n'

        try:
            lexer = get_lexer_by_name(language.lower())
        except:
            lexer = guess_lexer(code)

        formatter = ImageFormatter(font_name=font, font_size=36, style=style, line_numbers=False, image_pad=20, line_pad=12)
        result = highlight(code, lexer, formatter)
        return result

    def make_thumbnail(self, photo):
        im = Image.open(photo.get_path())
        im.thumbnail((240, 240), Image.ANTIALIAS)
        if im.mode != 'RGB':
            im = im.convert('RGB')
        im.save(photo.get_path('thumbnail', 'jpg'), 'JPEG')
