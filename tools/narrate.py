"""
හඳ මාමා කතන්දර — recorded narration for "read to me"

Makes one MP3 for every paragraph the app reads aloud (book titles, story pages, the lesson
and the goodnight wish), so stories are read aloud on every device, including iPhones and
computers that have no Sinhala voice of their own. Runs in GitHub Actions (narrate.yml):

    pip install torch "coqui-tts[codec]" six huggingface_hub imageio-ffmpeg
    python tools/narrate.py            # only makes clips that are missing

The voice is SinhalaVITS F1 ("Nipunika"), a Sinhala voice model by Dialog Axiata and the
Dialog–UoM Research Lab (MPL-2.0, https://huggingface.co/dialoglk/SinhalaVITS-TTS-F1).
It reads romanized Sinhala, made by the romanizer.py that comes with the model.

data/narration.js maps a hash of each paragraph's text (the app computes the same hash) to its
clip. A clip's file name is a hash of what was actually spoken (voice and the respelled text),
so editing a story, tools/pronunciation.txt or the voice re-records only the clips that change,
and phones never play an old saved clip in place of a new one.
"""
import glob, importlib, json, os, re, subprocess, sys, tempfile

MODEL = os.environ.get('NARRATION_MODEL', 'dialoglk/SinhalaVITS-TTS-F1')
VOICE = MODEL.split('/')[-1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, 'audio')


def fnv(text):
    """FNV-1a, 32 bit, over the UTF-8 bytes: the same as hashText() in js/app.js"""
    h = 0x811c9dc5
    for b in text.encode('utf-8'):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return '%08x' % h


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


def respellings():
    """tools/pronunciation.txt: 'written = spoken' lines, for words the voice says unnaturally"""
    out = []
    path = os.path.join(ROOT, 'tools', 'pronunciation.txt')
    for line in open(path, encoding='utf-8') if os.path.exists(path) else []:
        line = line.split('#', 1)[0].strip()
        if '=' in line:
            a, b = (x.strip() for x in line.split('=', 1))
            if a and b:
                out.append((a, b))
    return sorted(out, key=lambda x: -len(x[0]))  # longest first, so phrases win over words


RESPELL = respellings()


def spoken(t):
    """the text as the voice should read it: same words, punctuation that reads naturally aloud"""
    for a, b in RESPELL:
        t = t.replace(a, b)
    t = re.sub(r'[“”"‘’]', '', t)          # quote marks: the voice pauses oddly on them
    t = re.sub(r'\s*[–—]\s*', ', ', t)     # a dash is a short pause
    t = t.replace('…', '.')
    t = re.sub(r'([.!?])(?=\S)', r'\1 ', t)
    return norm(t)


def texts():
    src = open(os.path.join(ROOT, 'data', 'stories.js'), encoding='utf-8').read()
    books = json.loads(src[src.index('['):src.rindex(']') + 1])
    out = []
    for b in books:
        out += [b['title']] + ([b['subtitle']] if b.get('subtitle') else [])
        for p in b['pages']:
            out += p['paras']
        out += [b['moral'], b.get('goodnight') or 'සුබ රාත්‍රියක්!']
    return [n for n in dict.fromkeys(norm(t) for t in out) if n]


def load_voice():
    """the model, and the romanizer that turns Sinhala script into what the model reads"""
    from huggingface_hub import snapshot_download
    from TTS.utils.synthesizer import Synthesizer
    d = snapshot_download(MODEL)
    sys.path.insert(0, d)
    romanize = importlib.import_module('romanizer').sinhala_to_roman
    sys.path.pop(0)
    cfg = glob.glob(os.path.join(d, '*config*.json'))[0]
    ckpt = glob.glob(os.path.join(d, '*.pth'))[0]
    return Synthesizer(tts_checkpoint=ckpt, tts_config_path=cfg, use_cuda=False), romanize


def main():
    os.makedirs(AUDIO, exist_ok=True)
    clips = {}   # hash of the text in the book -> clip file
    say = {}     # clip file -> what is spoken
    for t in texts():
        s = spoken(t)
        f = fnv(VOICE + '|' + s)
        clips[fnv(t)] = f
        say[f] = s
    missing = [(f, s) for f, s in say.items() if not os.path.exists(os.path.join(AUDIO, f + '.mp3'))]
    print(f'{len(clips)} paragraphs, {len(missing)} to record with {VOICE}, {len(RESPELL)} respellings')
    if missing:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        synth, romanize = load_voice()
        with tempfile.TemporaryDirectory() as tmp:
            for n, (f, s) in enumerate(missing, 1):
                wav = os.path.join(tmp, f + '.wav')
                synth.save_wav(synth.tts(romanize(s)), wav)
                subprocess.run([ffmpeg, '-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', '64k',
                                os.path.join(AUDIO, f + '.mp3')], check=True)
                print(f'  {n}/{len(missing)} recorded', f, s[:30])
    # clips nothing uses any more (old voice, old spelling, text no longer in a story)
    for f in os.listdir(AUDIO):
        if f.endswith('.mp3') and f[:-4] not in say:
            os.remove(os.path.join(AUDIO, f))
    clips = dict(sorted(clips.items()))
    with open(os.path.join(ROOT, 'data', 'narration.js'), 'w', encoding='utf-8') as f:
        f.write('/* generated by tools/narrate.py — paragraph hash -> recorded clip audio/<clip>.mp3 */\n')
        f.write('window.HM_NARRATION = ' + json.dumps({'voice': VOICE, 'clips': clips}) + ';\n')
    print('done:', len(clips), 'clips')


main()
